import { ExampleForm } from "@/components/pages/examples/form/example_form"
import ExampleTitle from "@/components/pages/examples/example_title"
import { ExampleFormProvider } from "@/components/pages/examples/form/example_form_context"
import { getFormExampleInitData, transformAssetToOptions } from "@/components/pages/examples/form/example_form_controller"

const { assetList, contract } = await getFormExampleInitData()

const assetOptions = transformAssetToOptions(assetList)

const ExmapleListForm = async () => {
  return (
    <>
      <ExampleTitle title="Form page" />
      <ExampleFormProvider assetList={assetList} contract={contract} assetOptions={assetOptions}>
        <ExampleForm />
      </ExampleFormProvider>
    </>
  )
}

export default ExmapleListForm
