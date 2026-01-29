export const TaskStatus = ({ status }: { status: boolean }) => {
  if (status) {
    return <div className="h-2 w-2 animate-breathe rounded-full bg-tonic outline outline-1 outline-offset-4 outline-tonic" />
  }

  return <div className="h-2 w-2 rounded-full bg-subtitle" />
}
