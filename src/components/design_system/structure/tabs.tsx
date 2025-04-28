"use client"

type TabsProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  activeTab: string
  setActiveTab: (arg: string) => void
}

export default function Tabs({ activeTab, setActiveTab }: TabsProps) {
  return (
    <div className="mx-auto w-full">
      <div className="relative flex justify-between rounded-lg p-2 text-white">
        <button
          onClick={() => setActiveTab("Deposit")}
          className={`w-1/2 py-2 text-center text-lg font-semibold ${activeTab === "Deposit" ? "text-white" : "text-gray-400"} z-10`}
        >
          Deposit
        </button>
        <button
          onClick={() => setActiveTab("Leverage")}
          className={`w-1/2 py-2 text-center text-lg font-semibold ${activeTab === "Leverage" ? "text-white" : "text-gray-400"} z-10`}
        >
          Leverage
        </button>

        <div
          className={`absolute bottom-0 h-1 rounded-full bg-blue-500 transition-all duration-300 ease-in-out ${activeTab === "Deposit" ? "left-0 w-1/2" : "left-1/2 w-1/2"}`}
        />

        <div className="absolute bottom-0 left-0 h-1 w-full rounded-full bg-white/10" />
      </div>
    </div>
  )
}
