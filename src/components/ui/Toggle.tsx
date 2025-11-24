import React from 'react';

export interface ToggleOption {
  value: string;
  label: string;
}

export interface ToggleProps {
  value: string;
  onChange: (value: string) => void;
  options: ToggleOption[];
  disabled?: boolean;
  className?: string;
}

const Toggle: React.FC<ToggleProps> = ({
  value,
  onChange,
  options,
  disabled = false,
  className = '',
}) => {
  return (
    <div className={`flex gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg w-fit ${className}`}>
      {options.map((option) => (
        <button
          key={option.value}
          onClick={() => onChange(option.value)}
          disabled={disabled}
          className={`px-4 py-2 rounded font-medium transition-all ${
            value === option.value
              ? 'bg-primary dark:bg-secondary text-white shadow-md'
              : 'bg-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
          } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
};

export default Toggle;
