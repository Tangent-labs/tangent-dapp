"use client"

interface IndicatorCardProps {
  title: string
  value: string | number
  className?: string
}

const IndicatorCard = ({ title, value, className = "" }: IndicatorCardProps) => {
  return (
    <div className={`flex flex-col items-center justify-center p-4 rounded-md bg-gray-800 text-white shadow-md ${className}`}>
      <span className="text-sm text-gray-400">{title}</span>
      <span className="text-xl font-bold">{value}</span>
    </div>
  )
}

interface IndicatorCardsProps {
  indicators: { title: string; value: string | number }[]
  className?: string
}

const IndicatorCards = ({ indicators, className = "" }: IndicatorCardsProps) => {
  return (
    <div className={`flex space-x-4 ${className}`}>
      {indicators.map((indicator, index) => (
        <IndicatorCard key={index} title={indicator.title} value={indicator.value} />
      ))}
    </div>
  )
}

export default IndicatorCards

/* 

  const indicators = [
    { title: 'Total Deposited', value: '$100,000' },
    { title: 'Total Claimable', value: '$40,000' },
  ];

  return (
    <div className="p-8">
      <IndicatorCards indicators={indicators} />
    </div>
  );
  */
