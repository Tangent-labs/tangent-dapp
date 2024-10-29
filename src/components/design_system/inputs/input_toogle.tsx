"use client"
interface InputToggleProps {
  isOn: boolean
  onToggle: () => void
  label?: string
  className?: string
}

const InputToggle = ({ isOn, onToggle, label, className = "" }: InputToggleProps) => {
  return (
    <div className={`flex items-center space-x-3 ${className}`}>
      {label && <span className="text-sm text-gray-400">{label}</span>}
      <button
        type="button"
        onClick={onToggle}
        className={`relative h-6 w-12 rounded-full transition-colors ${isOn ? "bg-green-500" : "bg-gray-600"} focus:outline-none`}
      >
        <span className={`absolute left-0 top-0 h-6 w-6 transform rounded-full bg-white transition-transform ${isOn ? "translate-x-6" : ""}`} />
      </button>
    </div>
  )
}

export default InputToggle
