"use client"

interface Option {
  label: string
  value: string | number
}

interface InputSelectButtonProps {
  options: Option[]
  value: string | number
  onChange: (value: string | number) => void
  className?: string
}

const InputSelectButton = ({ options, value, onChange, className = "" }: InputSelectButtonProps) => {
  return (
    <div className={`flex space-x-2 ${className}`}>
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => onChange(option.value)}
          className={`px-4 py-2 rounded-md text-white transition-colors focus:outline-none ${
            value === option.value ? "bg-blue-500" : "bg-gray-600 hover:bg-gray-500"
          }`}
        >
          {option.label}
        </button>
      ))}
    </div>
  )
}

export default InputSelectButton
