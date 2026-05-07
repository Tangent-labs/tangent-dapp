export const TaskStatus = ({ status }: { status: boolean }) => {
  return (
    <div className="flex h-8 w-8 items-center justify-center rounded-[10px] bg-white/10 backdrop-blur-lg">
      {status ? (
        <div className="relative flex items-center justify-center">
          <div className="absolute h-2 w-2 animate-sonar rounded-full bg-tonic" />
          <div className="h-2 w-2 rounded-full bg-tonic" />
        </div>
      ) : (
        <div className="h-2 w-2 rounded-full bg-subtitle" />
      )}
    </div>
  )
}
