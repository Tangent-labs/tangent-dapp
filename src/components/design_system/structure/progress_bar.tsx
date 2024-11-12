type ProgressBarprops = {
  percent: number
}

export default function ProgressBar({ percent }: ProgressBarprops) {
  return (
    <div className="relative h-5 w-full rounded-full border border-gray-600">
      <div className="absolute inset-0 rounded-full bg-progress" style={{ width: `${percent}%` }}></div>
    </div>
  )
}
