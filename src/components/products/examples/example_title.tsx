export default function ExampleTitle({ title }: { title: string }) {
  return (
    <>
      <hr className="my-8 border-white border-opacity-20" />
      <h2 className="py-4 text-4xl uppercase">{title} </h2>
    </>
  )
}
