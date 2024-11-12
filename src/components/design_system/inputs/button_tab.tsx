type ButtonTabProps = React.ParamHTMLAttributes<HTMLButtonElement> & {
  label: string
  active: boolean
}

export default function ButtonTab({ label, active, ...props }: ButtonTabProps) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      data-state={active ? "active" : "inactive"}
      id="radix-:r0:-trigger-deposit"
      className="data-[state=active]text-black mb-2 inline-flex min-w-40 items-center justify-center whitespace-nowrap rounded-[10px] border border-gray-400 px-4 py-1 hover:bg-white hover:bg-opacity-[3%] data-[state=active]:bg-white data-[state=active]:text-black"
      {...props}
    >
      {label}
    </button>
  )
}
