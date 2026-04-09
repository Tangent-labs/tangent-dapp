export const TaskStatus = ({ status }: { status: boolean }) => {
  if (status) {
    return (
      <div className="relative flex items-center justify-center">
        <div className="absolute h-2 w-2 animate-sonar rounded-full bg-tonic" />
        <div className="h-2 w-2 rounded-full bg-tonic" />
      </div>
    )
  }

  return <div className="h-2 w-2 rounded-full bg-subtitle" />
}
