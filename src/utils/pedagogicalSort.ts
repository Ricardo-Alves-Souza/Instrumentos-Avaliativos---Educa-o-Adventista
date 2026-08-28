import { Turma } from '../types';

/**
 * Retorna um peso numérico pedagógico ordenado para qualquer descrição de série escolar brasileira.
 * 
 * Ordem Pedagógica Padrão:
 * - Fundamental I: 1º Ano (10) até 5º Ano (50)
 * - Fundamental II: 6º Ano (60) até 9º Ano (90)
 * - Ensino Médio: 1ª Série / 1º EM (110), 2ª Série / 2º EM (120), 3ª Série / 3º EM (130)
 */
export function getPedagogicalSeriesWeight(serieStr: string): number {
  if (!serieStr) return 999;
  const s = serieStr.trim().toLowerCase();

  // Ensino Médio
  if (s.includes('médio') || s.includes('medio') || s.includes('em') || s.includes('série') || s.includes('serie')) {
    if (s.includes('1') || s.includes('1ª') || s.includes('1º') || s.includes('primeir')) return 110;
    if (s.includes('2') || s.includes('2ª') || s.includes('2º') || s.includes('segund')) return 120;
    if (s.includes('3') || s.includes('3ª') || s.includes('3º') || s.includes('terceir')) return 130;
    return 100;
  }

  // Fundamental I e II por número de ano
  const match = s.match(/([1-9])\s*[ºªo°a]?\s*ano/);
  if (match) {
    const num = parseInt(match[1], 10);
    return num * 10; // 1º Ano = 10, ..., 9º Ano = 90
  }

  // Caso contenha apenas o número inicial
  const firstNumMatch = s.match(/^([1-9])/);
  if (firstNumMatch) {
    const num = parseInt(firstNumMatch[1], 10);
    return num * 10;
  }

  return 900;
}

/**
 * Ordena uma lista de strings de séries pedagogicamente (1º Ano ... 9º Ano -> 1ª Série EM ... 3ª Série EM).
 */
export function sortSeriesPedagogically(series: string[]): string[] {
  return [...series].sort((a, b) => {
    const weightA = getPedagogicalSeriesWeight(a);
    const weightB = getPedagogicalSeriesWeight(b);
    if (weightA !== weightB) {
      return weightA - weightB;
    }
    return a.localeCompare(b, 'pt-BR', { numeric: true });
  });
}

/**
 * Ordena turmas pedagogicamente por série e em seguida por nome/turno.
 */
export function sortTurmasPedagogically(turmas: Turma[]): Turma[] {
  return [...turmas].sort((a, b) => {
    const weightA = getPedagogicalSeriesWeight(a.serie);
    const weightB = getPedagogicalSeriesWeight(b.serie);
    if (weightA !== weightB) {
      return weightA - weightB;
    }
    return a.nome.localeCompare(b.nome, 'pt-BR', { numeric: true });
  });
}
