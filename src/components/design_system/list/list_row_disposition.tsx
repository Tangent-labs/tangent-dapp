"use client"

interface ListRowDispositionProps {
  children: React.ReactNode[]
}

const ListRowDisposition = ({ children }: ListRowDispositionProps) => {
  return (
    <div className="flex items-center justify-between max-xl:flex-col">
      <div className="flex w-full items-center justify-between xl:w-5/12 xl:justify-start">
        <div className="xl:w-9/12">{children?.at(0)}</div>
        <div className="xl:w-3/12">{children?.at(1)}</div>
      </div>
      <hr className="my-2 w-full opacity-20 xl:hidden" />
      <div className="flex w-full flex-wrap items-center justify-evenly gap-2 xl:w-7/12">{children?.at(2)}</div>
    </div>
  )
}

export default ListRowDisposition
