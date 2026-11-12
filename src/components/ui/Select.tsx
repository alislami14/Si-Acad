import { useState, useRef, useEffect, forwardRef, useId } from 'react';
import { ChevronDown, Check, Search, X } from 'lucide-react';

export interface SelectOption {
  value: string;
  label: string;
  sublabel?: string;
  badge?: string;
  icon?: React.ReactNode;
}

export interface SelectProps {
  label?: string;
  error?: string;
  options: SelectOption[];
  value?: string;
  defaultValue?: string;
  onChange?: (e: { target: { value: string; name?: string } }) => void;
  onValueChange?: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  id?: string;
  name?: string;
  required?: boolean;
  searchable?: boolean;
  clearable?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const Select = forwardRef<HTMLDivElement, SelectProps>(
  (
    {
      label,
      error,
      options = [],
      value: controlledValue,
      defaultValue = '',
      onChange,
      onValueChange,
      placeholder = 'Pilih opsi...',
      disabled = false,
      className = '',
      id,
      name,
      required = false,
      searchable,
      clearable = true,
      size = 'md',
    },
    ref
  ) => {
    const generatedId = useId();
    const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : generatedId);

    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [internalValue, setInternalValue] = useState(defaultValue);
    const [placeAbove, setPlaceAbove] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const searchInputRef = useRef<HTMLInputElement>(null);

    // Controlled vs uncontrolled value
    const currentValue = controlledValue !== undefined ? controlledValue : internalValue;

    // Find selected option object
    const selectedOption = options.find((opt) => opt.value === currentValue);

    // Auto-enable search if there are 5 or more options, unless explicitly turned off
    const shouldShowSearch = searchable !== undefined ? searchable : options.length >= 5;

    // Filter options by search term
    const filteredOptions = options.filter((opt) => {
      if (!searchTerm.trim()) return true;
      const term = searchTerm.toLowerCase();
      const matchLabel = opt.label.toLowerCase().includes(term);
      const matchSublabel = opt.sublabel ? opt.sublabel.toLowerCase().includes(term) : false;
      return matchLabel || matchSublabel;
    });

    // Close on outside click
    useEffect(() => {
      const handleOutsideClick = (e: MouseEvent) => {
        if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
          setIsOpen(false);
        }
      };

      if (isOpen) {
        document.addEventListener('mousedown', handleOutsideClick);
      }
      return () => {
        document.removeEventListener('mousedown', handleOutsideClick);
      };
    }, [isOpen]);

    // Close on Escape key
    useEffect(() => {
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape' && isOpen) {
          setIsOpen(false);
        }
      };
      if (isOpen) {
        window.addEventListener('keydown', handleKeyDown);
      }
      return () => {
        window.removeEventListener('keydown', handleKeyDown);
      };
    }, [isOpen]);

    // Focus search input when dropdown opens and check available vertical space
    useEffect(() => {
      if (isOpen) {
        if (containerRef.current) {
          const rect = containerRef.current.getBoundingClientRect();
          const spaceBelow = window.innerHeight - rect.bottom;
          setPlaceAbove(spaceBelow < 220 && rect.top > 220);
        }
        if (shouldShowSearch) {
          const timer = setTimeout(() => {
            searchInputRef.current?.focus();
          }, 50);
          return () => clearTimeout(timer);
        }
      } else {
        setSearchTerm('');
      }
    }, [isOpen, shouldShowSearch]);

    const handleSelect = (val: string) => {
      if (disabled) return;
      if (controlledValue === undefined) {
        setInternalValue(val);
      }
      if (onChange) {
        onChange({ target: { value: val, name } });
      }
      if (onValueChange) {
        onValueChange(val);
      }
      setIsOpen(false);
      setSearchTerm('');
    };

    const handleClear = (e: React.MouseEvent) => {
      e.stopPropagation();
      if (disabled) return;
      handleSelect('');
    };

    const toggleOpen = () => {
      if (!disabled) {
        setIsOpen((prev) => !prev);
      }
    };

    const sizeClasses = {
      sm: 'px-2.5 py-1.5 text-xs rounded-lg',
      md: 'px-3.5 py-2 text-sm rounded-xl',
      lg: 'px-4 py-2.5 text-base rounded-xl',
    };

    return (
      <div className={`space-y-1.5 w-full relative ${className}`} ref={containerRef}>
        {label && (
          <label
            htmlFor={selectId}
            className="block text-xs font-semibold uppercase tracking-wider text-gray-700 dark:text-gray-300"
          >
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}

        {/* Hidden native input for forms */}
        <input type="hidden" id={selectId} name={name} value={currentValue} />

        {/* Trigger Button */}
        <div
          ref={ref}
          role="combobox"
          aria-expanded={isOpen}
          aria-haspopup="listbox"
          tabIndex={disabled ? -1 : 0}
          onClick={toggleOpen}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              toggleOpen();
            }
          }}
          className={`w-full flex items-center justify-between text-left transition-all duration-200 cursor-pointer select-none
            bg-white dark:bg-[#181F18]
            border border-gray-200 dark:border-gray-700
            text-gray-900 dark:text-gray-100
            hover:border-[#7C9A76] dark:hover:border-[#7C9A76]
            focus:outline-none focus:ring-2 focus:ring-[#7C9A76]/30 focus:border-[#7C9A76]
            ${isOpen ? 'ring-2 ring-[#7C9A76]/30 border-[#7C9A76]' : ''}
            ${disabled ? 'opacity-50 cursor-not-allowed bg-gray-50 dark:bg-gray-900' : ''}
            ${error ? 'border-red-500 focus:ring-red-500' : ''}
            ${sizeClasses[size]}`}
        >
          <div className="flex items-center gap-2 min-w-0 flex-1 pr-2">
            {selectedOption?.icon && <span className="shrink-0">{selectedOption.icon}</span>}
            {selectedOption ? (
              <div className="min-w-0 flex-1 flex flex-col">
                <span className="truncate font-medium text-gray-900 dark:text-gray-100">
                  {selectedOption.label}
                </span>
                {selectedOption.sublabel && (
                  <span className="truncate text-xs text-gray-500 dark:text-gray-400">
                    {selectedOption.sublabel}
                  </span>
                )}
              </div>
            ) : (
              <span className="truncate text-gray-400 dark:text-gray-500 font-normal">
                {placeholder}
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5 shrink-0 text-gray-400">
            {clearable && currentValue && !disabled && (
              <button
                type="button"
                onClick={handleClear}
                title="Hapus pilihan"
                className="p-1 rounded-md hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
            <ChevronDown
              className={`w-4 h-4 transition-transform duration-200 ${
                isOpen ? 'rotate-180 text-[#7C9A76]' : 'text-gray-400'
              }`}
            />
          </div>
        </div>

        {/* Dropdown Floating Menu */}
        {isOpen && (
          <div
            className={`absolute z-50 left-0 right-0 ${
              placeAbove ? 'bottom-full mb-1.5' : 'top-full mt-1.5'
            }
              bg-white dark:bg-[#1A221A] 
              border border-gray-200/90 dark:border-gray-700/80 
              rounded-2xl shadow-xl shadow-black/10 dark:shadow-black/40 
              overflow-hidden animate-in fade-in zoom-in-95 duration-150`}
          >
            {/* Search Box if needed */}
            {shouldShowSearch && (
              <div className="p-2 border-b border-gray-100 dark:border-gray-800 bg-gray-50/70 dark:bg-[#151C15]">
                <div className="relative flex items-center">
                  <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 pointer-events-none" />
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Ketik untuk mencari..."
                    className="w-full pl-8 pr-7 py-1.5 text-xs rounded-lg 
                      bg-white dark:bg-[#1E271E] 
                      border border-gray-200 dark:border-gray-700 
                      text-gray-900 dark:text-gray-100 
                      focus:outline-none focus:ring-1 focus:ring-[#7C9A76] focus:border-[#7C9A76]"
                  />
                  {searchTerm && (
                    <button
                      type="button"
                      onClick={() => setSearchTerm('')}
                      className="absolute right-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Options List */}
            <div className="max-h-48 overflow-y-auto p-1.5 space-y-0.5 no-scrollbar" role="listbox">
              {/* Optional Placeholder item to clear */}
              {placeholder && (
                <div
                  role="option"
                  aria-selected={!currentValue}
                  onClick={() => handleSelect('')}
                  className={`px-3 py-2 text-xs rounded-xl cursor-pointer transition-colors flex items-center justify-between
                    ${
                      !currentValue
                        ? 'bg-gray-100 dark:bg-gray-800/80 text-gray-700 dark:text-gray-200 font-medium'
                        : 'text-gray-400 dark:text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800/40'
                    }`}
                >
                  <span className="italic">{placeholder}</span>
                  {!currentValue && <Check className="w-3.5 h-3.5 text-[#7C9A76]" />}
                </div>
              )}

              {filteredOptions.length > 0 ? (
                filteredOptions.map((opt) => {
                  const isSelected = opt.value === currentValue;
                  return (
                    <div
                      key={opt.value}
                      role="option"
                      aria-selected={isSelected}
                      onClick={() => handleSelect(opt.value)}
                      className={`px-3 py-2 text-sm rounded-xl cursor-pointer transition-colors flex items-center justify-between gap-2
                        ${
                          isSelected
                            ? 'bg-[#EBF3E8] dark:bg-[#253625] text-[#2C4927] dark:text-[#A8CEA0] font-medium'
                            : 'text-gray-800 dark:text-gray-200 hover:bg-[#F4F7F2] dark:hover:bg-[#202920]'
                        }`}
                    >
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        {opt.icon && <span className="shrink-0">{opt.icon}</span>}
                        <div className="min-w-0 flex-1">
                          <p className="truncate">{opt.label}</p>
                          {opt.sublabel && (
                            <p className="truncate text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                              {opt.sublabel}
                            </p>
                          )}
                        </div>
                      </div>

                      {opt.badge && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 shrink-0">
                          {opt.badge}
                        </span>
                      )}

                      {isSelected && (
                        <Check className="w-4 h-4 text-[#7C9A76] shrink-0 ml-1" />
                      )}
                    </div>
                  );
                })
              ) : (
                <div className="py-6 px-3 text-center text-xs text-gray-400 dark:text-gray-500">
                  Tidak ada opsi yang sesuai
                </div>
              )}
            </div>
          </div>
        )}

        {error && <p className="text-xs text-red-600 dark:text-red-400 mt-1">{error}</p>}
      </div>
    );
  }
);

Select.displayName = 'Select';
export default Select;
