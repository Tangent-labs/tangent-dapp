export default function ExampleTitle({ title }: { title: string }) {
  return (
    <>
      <hr className="my-8 border-opacity-20 border-white" />
      <h2 className="text-4xl py-4 uppercase">{title} </h2>
    </>
  )
}
