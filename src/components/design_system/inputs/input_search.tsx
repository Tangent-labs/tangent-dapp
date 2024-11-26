"use client"

type InputSearchProps = React.ParamHTMLAttributes<HTMLInputElement> & {
  placeholder?: string
  value: string
  onChange: (value: string) => void
  onSearch?: () => void // Optional prop if you want a search button
}

const InputSearch = ({ placeholder = "Search...", value, onChange, onSearch, className = "" }: InputSearchProps) => {
  return (
    <div className={`relative flex items-center ${className}`}>
      <input type="text" value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="" />
      {value && (
        <button type="button" onClick={() => onChange("")} className="absolute right-2 focus:outline-none">
          &#x2715;
        </button>
      )}
      {onSearch && (
        <button type="button" onClick={onSearch} className="ml-2 rounded-md p-2 focus:outline-none">
          Search
        </button>
      )}
    </div>
  )
}

export default InputSearch
