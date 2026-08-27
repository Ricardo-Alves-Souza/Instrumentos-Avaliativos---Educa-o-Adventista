import React, { useState, useRef, useEffect } from 'react';
import { Search, ChevronDown, Check, X, User as UserIcon } from 'lucide-react';

export interface ComboboxOption {
  id: string;
  label: string;
  subLabel?: string;
  badge?: string;
}

interface SearchableComboboxProps {
  options: ComboboxOption[];
  value: string;
  onChange: (id: string) => void;
  placeholder?: string;
  label?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
}

export const SearchableCombobox: React.FC<SearchableComboboxProps> = ({
  options,
  value,
  onChange,
  placeholder = 'Buscar ou selecionar...',
  label,
  required = false,
  disabled = false,
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const selectedOption = options.find((opt) => opt.id === value);

  // Sync search input with selection when closed
  useEffect(() => {
    if (!isOpen) {
      setSearchTerm(selectedOption ? selectedOption.label : '');
    }
  }, [isOpen, selectedOption]);

  // Click outside handler
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setSearchTerm(selectedOption ? selectedOption.label : '');
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [selectedOption]);

  // Filter options based on searchTerm
  const filteredOptions = options.filter((opt) => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    const matchLabel = opt.label.toLowerCase().includes(term);
    const matchSub = opt.subLabel ? opt.subLabel.toLowerCase().includes(term) : false;
    const matchBadge = opt.badge ? opt.badge.toLowerCase().includes(term) : false;
    return matchLabel || matchSub || matchBadge;
  });

  const handleSelect = (opt: ComboboxOption) => {
    onChange(opt.id);
    setSearchTerm(opt.label);
    setIsOpen(false);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange('');
    setSearchTerm('');
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const handleInputFocus = () => {
    if (!disabled) {
      setIsOpen(true);
      // Select text for quick typing over
      if (inputRef.current) {
        inputRef.current.select();
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setIsOpen(false);
      setSearchTerm(selectedOption ? selectedOption.label : '');
    } else if (e.key === 'Enter' && isOpen && filteredOptions.length > 0) {
      e.preventDefault();
      handleSelect(filteredOptions[0]);
    } else if (e.key === 'ArrowDown' && !isOpen) {
      setIsOpen(true);
    }
  };

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      {label && (
        <label className="block text-xs font-semibold text-[#374151] mb-1">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}

      {/* Input container with Search icon */}
      <div
        className={`relative flex items-center border rounded-lg transition-all bg-[#F9FAFB] ${
          disabled
            ? 'opacity-60 cursor-not-allowed border-[#E5E7EB]'
            : isOpen
            ? 'border-[#3B82F6] ring-2 ring-[#3B82F6]/20 bg-white'
            : 'border-[#E5E7EB] hover:border-[#D1D5DB]'
        }`}
      >
        <div className="pl-3 pr-2 flex items-center pointer-events-none text-[#9CA3AF]">
          <Search className="w-4 h-4 text-[#3B82F6]" />
        </div>

        <input
          ref={inputRef}
          type="text"
          disabled={disabled}
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            if (!isOpen) setIsOpen(true);
          }}
          onFocus={handleInputFocus}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="w-full py-2.5 text-xs text-[#111827] bg-transparent focus:outline-none font-medium placeholder:text-[#9CA3AF]"
        />

        <div className="flex items-center gap-1 pr-2.5">
          {value && !disabled && (
            <button
              type="button"
              onClick={handleClear}
              className="p-1 text-[#9CA3AF] hover:text-[#4B5563] hover:bg-[#F3F4F6] rounded-md transition-colors cursor-pointer"
              title="Limpar seleção"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}

          <button
            type="button"
            disabled={disabled}
            onClick={() => {
              if (!disabled) {
                setIsOpen(!isOpen);
                if (!isOpen && inputRef.current) {
                  inputRef.current.focus();
                }
              }
            }}
            className="p-1 text-[#9CA3AF] hover:text-[#4B5563] rounded-md transition-colors cursor-pointer"
          >
            <ChevronDown
              className={`w-4 h-4 transition-transform duration-200 ${
                isOpen ? 'rotate-180 text-[#3B82F6]' : ''
              }`}
            />
          </button>
        </div>
      </div>

      {/* Dropdown menu */}
      {isOpen && !disabled && (
        <div className="absolute z-50 mt-1 w-full bg-white border border-[#E5E7EB] rounded-xl shadow-xl max-h-60 overflow-y-auto divide-y divide-[#F3F4F6] animate-in fade-in-50 zoom-in-95 duration-100">
          {filteredOptions.length === 0 ? (
            <div className="p-4 text-center text-xs text-[#6B7280]">
              <p className="font-medium">Nenhum professor encontrado</p>
              <p className="text-[11px] text-[#9CA3AF] mt-0.5">
                Tente buscar por outro termo (nome ou e-mail).
              </p>
            </div>
          ) : (
            filteredOptions.map((opt) => {
              const isSelected = opt.id === value;
              return (
                <div
                  key={opt.id}
                  onClick={() => handleSelect(opt)}
                  className={`px-3.5 py-2.5 flex items-center justify-between cursor-pointer transition-colors ${
                    isSelected
                      ? 'bg-[#EFF6FF] text-[#1E40AF]'
                      : 'hover:bg-[#F9FAFB] text-[#111827]'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0 ${
                        isSelected
                          ? 'bg-[#3B82F6] text-white'
                          : 'bg-[#EFF6FF] text-[#3B82F6] border border-[#DBEAFE]'
                      }`}
                    >
                      {opt.label.slice(0, 2).toUpperCase()}
                    </div>
                    <div className="truncate">
                      <p className="text-xs font-semibold truncate leading-tight">
                        {opt.label}
                      </p>
                      {opt.subLabel && (
                        <p
                          className={`text-[11px] truncate mt-0.5 ${
                            isSelected ? 'text-[#3B82F6]' : 'text-[#6B7280]'
                          }`}
                        >
                          {opt.subLabel}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 ml-2">
                    {opt.badge && (
                      <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-[#F3F4F6] text-[#4B5563]">
                        {opt.badge}
                      </span>
                    )}
                    {isSelected && (
                      <Check className="w-4 h-4 text-[#3B82F6] shrink-0" />
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};
