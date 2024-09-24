"use client";

interface ListIndicatorProps {
  label: string;
  value: string;
}

const ListIndicator = ({ label, value }: ListIndicatorProps) => {
  return (
    <div className="flex flex-col items-center flex-1">
      <span className="text-sm text-gray-400">{label}</span>
      <span className="text-lg font-bold">{value}</span>
    </div>
  );
};

export default ListIndicator;
