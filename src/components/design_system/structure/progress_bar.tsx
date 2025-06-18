type ProgressBarprops = {
  percent: number
  minPercent: number
}

export default function ProgressBar({ percent, minPercent = 0 }: ProgressBarprops) {
  const percentDisplay = ((100 - minPercent) * percent) / 100 + minPercent

  return (
    <div className="relative h-5 w-full rounded-full border-2 border-gray-600">
      <div className="absolute inset-0 rounded-full bg-progress" style={{ width: `${percentDisplay}%` }}></div>
    </div>
  )
}
