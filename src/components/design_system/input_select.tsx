'use client';

interface Option {
  label: string;
  value: string | number;
}

interface InputSelectProps {
  options: Option[];
  value: string | number;
  onChange: (value: string | number) => void;
  label?: string;
  placeholder?: string;
  className?: string;
}

const InputSelect = ({
  options,
  value,
  onChange,
  label,
  placeholder = 'Select an option',
  className = '',
}:InputSelectProps) => {
  return (
    <div className={`flex flex-col ${className}`}>
      {label && <label className="text-sm text-gray-400 mb-1">{label}</label>}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="p-2 rounded-md border border-gray-600 bg-gray-900 text-white focus:outline-none focus:ring-2 focus:ring-blue-300"
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
};

export default InputSelect;
