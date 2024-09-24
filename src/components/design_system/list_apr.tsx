"use client"

interface ListAPRProps {
  apr?: number
  projectedApr?: number // Optional, in case the projected APR isn't always present
  className?: string
}

const ListAPR = ({ apr, projectedApr, className = "" }: ListAPRProps) => {
  return (
    <div className={`flex flex-col items-center  space-y-1 ${className}`}>
      <span className="text-lg font-bold text-purple-500">{apr}</span>
      {projectedApr && (
        <span className="text-sm text-gray-400">
          Proj: <span className="text-purple-400">{projectedApr}</span>
        </span>
      )}
    </div>
  )
}

export default ListAPR
