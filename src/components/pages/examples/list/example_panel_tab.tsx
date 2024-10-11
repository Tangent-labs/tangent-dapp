import Panel from "../../../design_system/structure/panel"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../../ui/tabs"
import ExampleTitle from "../example_title"

export default function ExamplePanelTabs() {
  return (
    <>
      <ExampleTitle title="Panel and tab" />
      <Panel>
        <Tabs defaultValue="deposit" className="bg-none">
          <TabsList className=" flex justify-start gap-2 bg-transparent">
            <TabsTrigger value="deposit" className="min-w-40">
              Deposit
            </TabsTrigger>
            <TabsTrigger value="withdraw" className="min-w-40">
              withdraw
            </TabsTrigger>
            <TabsTrigger value="info" className="min-w-40">
              Info
            </TabsTrigger>
          </TabsList>
          <TabsContent value="deposit">Deposit</TabsContent>
          <TabsContent value="withdraw">Withdraw</TabsContent>
          <TabsContent value="info">Info</TabsContent>
        </Tabs>
      </Panel>
    </>
  )
}
