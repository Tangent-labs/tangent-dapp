export const dynamic = "force-static" // 'auto' | 'force-dynamic' | 'error' | 'force-static'
import texts from "@/app/dictionnaries/en.json"

export default async function Page() {
  await wait5Seconds()
  return (
    <div>
      <span className="text-red-950">Dynamic PAGE {Math.random()}</span>
      <div className="text-2xl"> {texts.gnl.welcome}Dynamic page</div>
      <strong>{dynamic}</strong>
    </div>
  )
}

function wait5Seconds() {
  return new Promise((resolve) => {
    setTimeout(resolve, 5000)
  })
}
