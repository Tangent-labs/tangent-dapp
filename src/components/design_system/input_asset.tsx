'use client';
import { useState } from 'react';

interface InputAssetProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  decimals?: number; // Maximum number of decimal places allowed
  displayDecimals?:number
  className?: string;
}

const InputAsset = ({
  label,
  value,
  onChange,
  displayDecimals=2,
  decimals = 18, // Default to 18 decimals (common for Ethereum-based tokens)
  className = '',
}:InputAssetProps) => {
  const [error, setError] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    const regex = new RegExp(`^\\d*(\\.\\d{0,${decimals}})?$`);

    if (inputValue === '' || regex.test(inputValue)) {
      setError('');
      onChange(inputValue);
    } else {
      setError(`Please enter a valid number with up to ${displayDecimals} decimal places.`);
    }
  };

  return (
    <div className={`flex flex-col ${className}`}>
      <label className="text-sm text-gray-400 mb-1">{label}</label>
      <input
        type="text"
        value={value}
        onChange={handleInputChange}
        className="p-2 rounded-md border border-gray-600 bg-gray-900 text-white focus:outline-none focus:ring-2 focus:ring-blue-300"
        placeholder={`0.000000`}
      />
      {error && <span className="text-sm text-red-500 mt-1">{error}</span>}
    </div>
  );
};

export default InputAsset;
