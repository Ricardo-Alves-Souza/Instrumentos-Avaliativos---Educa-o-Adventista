import React, { useEffect, useRef } from 'react';

interface AutoResizeTextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  value: string | number | readonly string[] | undefined;
}

export const AutoResizeTextarea: React.FC<AutoResizeTextareaProps> = ({
  value,
  className = '',
  rows = 2,
  onChange,
  ...props
}) => {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const adjustHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      // Definir a nova altura calculada pelo scrollHeight
      textarea.style.height = `${Math.max(textarea.scrollHeight, 36)}px`;
    }
  };

  useEffect(() => {
    adjustHeight();
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    adjustHeight();
    if (onChange) {
      onChange(e);
    }
  };

  return (
    <textarea
      ref={textareaRef}
      value={value}
      onChange={handleChange}
      rows={rows}
      className={`resize-none overflow-hidden transition-all ${className}`}
      {...props}
    />
  );
};
