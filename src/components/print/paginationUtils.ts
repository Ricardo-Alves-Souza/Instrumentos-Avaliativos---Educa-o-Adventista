import { InstrumentoAvaliativo, Disciplina, CriterioAvaliativo, Habilidade } from '../../types';

export type ModuleKind = 'header' | 'content_src' | 'development' | 'criteria' | 'skills';

export interface InstrumentItemPiece {
  instrumento: InstrumentoAvaliativo;
  modules: ModuleKind[];
  isContinuation: boolean;
  isCompleted: boolean;
  estimatedHeight: number;
  /** Dinamically calculated sequential number per discipline (01, 02, 03...) */
  sequentialNumber: number;
}

export interface DisciplinaSectionPiece {
  type: 'disciplina';
  disciplinaNome: string;
  estimatedHeight: number;
}

export interface InstrumentSectionPiece {
  type: 'instrument';
  piece: InstrumentItemPiece;
}

export type PageSectionPiece = DisciplinaSectionPiece | InstrumentSectionPiece;

export interface PageData {
  pageNumber: number;
  totalPages: number;
  isFirstPage: boolean;
  turmaNome: string;
  bimestre: number;
  anoLetivo: number;
  sections: PageSectionPiece[];
}

// Constants for Page Dimensions in mm (A4 = 210mm x 297mm)
export const PAGE_HEIGHT_MM = 297;
export const PAGE_PADDING_TOP_MM = 14;
export const PAGE_PADDING_BOTTOM_MM = 14;
export const PAGE_USABLE_HEIGHT_MM = PAGE_HEIGHT_MM - PAGE_PADDING_TOP_MM - PAGE_PADDING_BOTTOM_MM; // 269mm

export const FULL_HEADER_HEIGHT_MM = 56;
export const CONT_HEADER_HEIGHT_MM = 22;
export const FOOTER_HEIGHT_MM = 14;

export const DISCIPLINA_HEADER_HEIGHT_MM = 12;
export const CARD_CONTAINER_OVERHEAD_MM = 8; // border + card padding
export const CONTINUATION_HEADER_OVERHEAD_MM = 9; // Continuation header badge bar

/**
 * Calculates estimated height in mm for each indivisible module
 */
export function estimateModuleHeight(
  moduleKind: ModuleKind,
  inst: InstrumentoAvaliativo,
  includeSkills: boolean
): number {
  switch (moduleKind) {
    case 'header': {
      // MÓDULO 1: Sequential #, Code, Title, Badges (Data, Peso, Disciplina)
      return 22;
    }
    case 'content_src': {
      // MÓDULO 2: Conteúdo + Fonte de Estudo grid (never split)
      const cLen = inst.conteudo?.length || 0;
      const fLen = inst.fonteEstudo?.length || 0;
      const maxLen = Math.max(cLen, fLen);
      const lines = Math.max(Math.ceil(maxLen / 40), 1);
      return 10 + lines * 4 + 4; // base title + text lines + margin
    }
    case 'development': {
      // MÓDULO 3: Desenvolvimento title + text (never split)
      const dLen = inst.desenvolvimento?.length || 0;
      if (dLen === 0) return 0;
      const lines = Math.ceil(dLen / 85);
      const paragraphs = inst.desenvolvimento.split(/\n{2,}/).filter(Boolean).length || 1;
      return 6 + lines * 4 + paragraphs * 2 + 4; // title + text lines + paragraph spacing + margin
    }
    case 'criteria': {
      // MÓDULO 4: Critérios Avaliativos title + criteria rows (never split)
      if (!inst.criterios || inst.criterios.length === 0) return 0;
      return 6 + inst.criterios.length * 6.5 + 4; // title + each criterion row + margin
    }
    case 'skills': {
      // MÓDULO 5: Habilidades (BNCC) title + skills boxes (never split, conditional)
      if (!includeSkills || !inst.habilidades || inst.habilidades.length === 0) return 0;
      return 6 + inst.habilidades.length * 9.5 + 4; // title + skill badge boxes + margin
    }
    default:
      return 0;
  }
}

/**
 * Calculates total height of an instrument with all its active modules
 */
export function estimateFullInstrumentHeight(
  inst: InstrumentoAvaliativo,
  includeSkills: boolean
): number {
  const modules: ModuleKind[] = ['header', 'content_src', 'development', 'criteria'];
  if (includeSkills && inst.habilidades && inst.habilidades.length > 0) {
    modules.push('skills');
  }

  let total = CARD_CONTAINER_OVERHEAD_MM;
  for (const m of modules) {
    total += estimateModuleHeight(m, inst, includeSkills);
  }
  return total;
}

export interface PaginateParams {
  turmaNome: string;
  bimestre: number;
  anoLetivo: number;
  instrumentos: InstrumentoAvaliativo[];
  disciplinas: Disciplina[];
  includeSkills: boolean;
}

/**
 * Intelligent pagination engine:
 * 1. Filter ONLY 'APROVADO' status instruments.
 * 2. Group instruments by disciplina.
 * 3. Sort disciplines by academic precedence and instruments within each discipline.
 * 4. Number sequentially per discipline (01, 02, 03...).
 * 5. Paginate strictly module-by-module (indivisible modules 1 to 5):
 *    - First try to fit entire instrument on current page.
 *    - If not, fit the MAXIMUM number of full modules on current page, then continue remaining modules on next page.
 *    - Discipline transitions flow seamlessly onto the same page if space permits.
 */
export function paginateTurmaDocument(params: PaginateParams): PageData[] {
  const { turmaNome, bimestre, anoLetivo, instrumentos, disciplinas, includeSkills } = params;

  // Filter ONLY "APROVADO"
  const approvedOnly = instrumentos.filter((inst) => inst.status === 'APROVADO');

  // Handle empty state: 1 page with empty message
  if (approvedOnly.length === 0) {
    return [
      {
        pageNumber: 1,
        totalPages: 1,
        isFirstPage: true,
        turmaNome,
        bimestre,
        anoLetivo,
        sections: [],
      },
    ];
  }

  // 1. Group approved instruments by disciplina
  const map = new Map<string, { discId: string; discNome: string; items: InstrumentoAvaliativo[] }>();
  for (const inst of approvedOnly) {
    const discNome = inst.disciplinaNome || 'Geral';
    const discId = inst.disciplinaId || 'general';
    if (!map.has(discNome)) {
      map.set(discNome, { discId, discNome, items: [] });
    }
    map.get(discNome)!.items.push(inst);
  }

  // 2. Sort groups by academic precedence and sort instruments inside each group
  const groups = Array.from(map.values())
    .filter((g) => g.items.length > 0)
    .map((g) => {
      const discObj = disciplinas.find(
        (d) =>
          d.id === g.discId ||
          (d.nome && g.discNome && d.nome.toLowerCase() === g.discNome.toLowerCase())
      );
      const ordem = discObj?.ordem ?? 999;
      
      // Sort instruments by original número/código/data
      const sortedItems = g.items.sort((a, b) => {
        if (a.numero !== b.numero) return a.numero - b.numero;
        return (a.codigoIdentificador || '').localeCompare(b.codigoIdentificador || '');
      });

      // Assign sequential number 1, 2, 3... for each approved item in this discipline
      const itemsWithSequential = sortedItems.map((item, idx) => ({
        inst: item,
        seqNumber: idx + 1,
      }));

      return {
        disciplinaNome: g.discNome,
        ordem,
        items: itemsWithSequential,
      };
    })
    .sort((a, b) => a.ordem - b.ordem);

  // 3. Pagination calculation
  const pages: PageData[] = [];

  const getUsableHeightForPage = (pageIndex: number) => {
    const isFirst = pageIndex === 0;
    const headerH = isFirst ? FULL_HEADER_HEIGHT_MM : CONT_HEADER_HEIGHT_MM;
    return PAGE_USABLE_HEIGHT_MM - headerH - FOOTER_HEIGHT_MM;
  };

  let currentPageSections: PageSectionPiece[] = [];
  let currentPageRemainingHeight = getUsableHeightForPage(0);

  const finalizePage = () => {
    pages.push({
      pageNumber: pages.length + 1,
      totalPages: 1, // updated at the end
      isFirstPage: pages.length === 0,
      turmaNome,
      bimestre,
      anoLetivo,
      sections: currentPageSections,
    });
    currentPageSections = [];
    currentPageRemainingHeight = getUsableHeightForPage(pages.length);
  };

  for (const group of groups) {
    let disciplinaHeaderRenderedForGroup = false;

    for (const { inst, seqNumber } of group.items) {
      // Build active modules list for this instrument (Modules 1 to 4, or 1 to 5 if skills active)
      const activeModules: ModuleKind[] = ['header', 'content_src', 'development', 'criteria'];
      if (includeSkills && inst.habilidades && inst.habilidades.length > 0) {
        activeModules.push('skills');
      }

      let remainingModules = [...activeModules];
      let isFirstPieceOfInst = true;

      while (remainingModules.length > 0) {
        const discHeaderCost = !disciplinaHeaderRenderedForGroup ? DISCIPLINA_HEADER_HEIGHT_MM : 0;
        const overheadCost = isFirstPieceOfInst ? CARD_CONTAINER_OVERHEAD_MM : (CARD_CONTAINER_OVERHEAD_MM + CONTINUATION_HEADER_OVERHEAD_MM);

        // Check if ALL remaining modules fit in the current page
        let sumAllRemaining = 0;
        for (const mod of remainingModules) {
          sumAllRemaining += estimateModuleHeight(mod, inst, includeSkills);
        }
        const totalNeededForAll = discHeaderCost + overheadCost + sumAllRemaining;

        if (totalNeededForAll <= currentPageRemainingHeight) {
          // All remaining modules fit on the current page!
          if (!disciplinaHeaderRenderedForGroup) {
            currentPageSections.push({
              type: 'disciplina',
              disciplinaNome: group.disciplinaNome,
              estimatedHeight: DISCIPLINA_HEADER_HEIGHT_MM,
            });
            currentPageRemainingHeight -= DISCIPLINA_HEADER_HEIGHT_MM;
            disciplinaHeaderRenderedForGroup = true;
          }

          const isCompleted = true;
          currentPageSections.push({
            type: 'instrument',
            piece: {
              instrumento: inst,
              modules: remainingModules,
              isContinuation: !isFirstPieceOfInst,
              isCompleted,
              estimatedHeight: overheadCost + sumAllRemaining,
              sequentialNumber: seqNumber,
            },
          });
          currentPageRemainingHeight -= (overheadCost + sumAllRemaining);
          remainingModules = [];
          break;
        }

        // If NOT all remaining modules fit, find the MAXIMUM number of complete modules that DO fit
        let fittedModulesCount = 0;
        let cumulativeHeight = 0;

        for (let i = 0; i < remainingModules.length; i++) {
          const modHeight = estimateModuleHeight(remainingModules[i], inst, includeSkills);
          if (discHeaderCost + overheadCost + cumulativeHeight + modHeight <= currentPageRemainingHeight) {
            cumulativeHeight += modHeight;
            fittedModulesCount++;
          } else {
            break;
          }
        }

        if (fittedModulesCount > 0) {
          // Place the maximum fitting modules on current page
          if (!disciplinaHeaderRenderedForGroup) {
            currentPageSections.push({
              type: 'disciplina',
              disciplinaNome: group.disciplinaNome,
              estimatedHeight: DISCIPLINA_HEADER_HEIGHT_MM,
            });
            currentPageRemainingHeight -= DISCIPLINA_HEADER_HEIGHT_MM;
            disciplinaHeaderRenderedForGroup = true;
          }

          const modulesToPlace = remainingModules.slice(0, fittedModulesCount);
          const isCompleted = fittedModulesCount === remainingModules.length;
          const pieceHeight = overheadCost + cumulativeHeight;

          currentPageSections.push({
            type: 'instrument',
            piece: {
              instrumento: inst,
              modules: modulesToPlace,
              isContinuation: !isFirstPieceOfInst,
              isCompleted,
              estimatedHeight: pieceHeight,
              sequentialNumber: seqNumber,
            },
          });
          currentPageRemainingHeight -= pieceHeight;

          remainingModules = remainingModules.slice(fittedModulesCount);
          isFirstPieceOfInst = false;

          // If there are still remaining modules, break page
          if (remainingModules.length > 0) {
            finalizePage();
          }
        } else {
          // Not even the first module fits on the current page
          if (currentPageSections.length > 0) {
            // Page has previous content: finalize page to get a fresh page
            finalizePage();
          } else {
            // Edge case: Even on a completely empty fresh page, the single module exceeds page size.
            // Render it as a single indivisible module on this fresh page rather than getting stuck.
            if (!disciplinaHeaderRenderedForGroup) {
              currentPageSections.push({
                type: 'disciplina',
                disciplinaNome: group.disciplinaNome,
                estimatedHeight: DISCIPLINA_HEADER_HEIGHT_MM,
              });
              disciplinaHeaderRenderedForGroup = true;
            }

            const modulesToPlace = [remainingModules[0]];
            const modHeight = estimateModuleHeight(remainingModules[0], inst, includeSkills);
            const pieceHeight = overheadCost + modHeight;

            currentPageSections.push({
              type: 'instrument',
              piece: {
                instrumento: inst,
                modules: modulesToPlace,
                isContinuation: !isFirstPieceOfInst,
                isCompleted: remainingModules.length === 1,
                estimatedHeight: pieceHeight,
                sequentialNumber: seqNumber,
              },
            });

            remainingModules = remainingModules.slice(1);
            isFirstPieceOfInst = false;

            if (remainingModules.length > 0) {
              finalizePage();
            }
          }
        }
      }
    }
  }

  // Finalize any remaining page
  if (currentPageSections.length > 0) {
    finalizePage();
  }

  // Set total pages across all pages
  const total = pages.length;
  pages.forEach((p) => {
    p.totalPages = total;
  });

  return pages;
}
