export const TaskStatus = ({ status }: { status: boolean }) => {
  if (status) {
    return <div className="h-2 w-2 rounded-full bg-light-tonic outline outline-1 outline-offset-4 outline-light-tonic"></div>
  }
  return <div className="h-2 w-2 rounded-full bg-subtitle"></div>
}
