import React, { useMemo } from 'react';

interface DevelopmentSectionProps {
  desenvolvimento: string;
}

export const DevelopmentSection: React.FC<DevelopmentSectionProps> = ({ desenvolvimento }) => {
  // Editorial text normalization:
  // 1. Remove redundant 3+ blank lines into clean single paragraph breaks
  // 2. Trim excess trailing whitespace per line
  // 3. Keep semantic paragraphs and list structures intact
  const formattedParagraphs = useMemo(() => {
    if (!desenvolvimento) return [];

    // Normalize Windows/Mac line endings
    const normalized = desenvolvimento.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

    // Split by double line breaks (paragraphs) or preserve single line breaks with intent
    const rawBlocks = normalized.split(/\n{2,}/);

    return rawBlocks
      .map((block) => block.trim())
      .filter((block) => block.length > 0);
  }, [desenvolvimento]);

  return (
    <div className="mb-6 relative break-inside-avoid">
      <p className="text-[10px] font-bold text-[#6B7280] uppercase tracking-wider mb-3">
        Desenvolvimento
      </p>

      <div className="w-full text-xs text-[#374151] leading-relaxed space-y-2 font-normal">
        {formattedParagraphs.map((paragraph, idx) => {
          // Check if paragraph is composed of bullet points
          const isBulletList = paragraph.includes('•') || paragraph.startsWith('- ');

          if (isBulletList) {
            return (
              <div
                key={idx}
                className="text-xs text-[#374151] leading-relaxed font-normal bg-[#F9FAFB] p-3 rounded-lg border border-[#F3F4F6]"
              >
                {paragraph}
              </div>
            );
          }

          return (
            <p key={idx} className="text-xs text-[#374151] leading-relaxed text-justify">
              {paragraph}
            </p>
          );
        })}
      </div>
    </div>
  );
};
