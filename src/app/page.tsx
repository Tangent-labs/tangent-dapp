import texts from "@/app/dictionnaries/en.json"
import { getDatasets } from "@/services/service_gouv"

export const dynamic = "force-static"

const datasets = await getDatasets()

export default function Home() {
  return (
    <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start">
      <span className="text-red-950">Home {Math.random()}</span>
      <div className="text-2xl font-serif"> {texts.gnl.welcome}</div>

      <span className="text-2xl">Aperçu des datasets</span>
      <ul>
        {datasets?.data?.map((dataset) => (
          <li key={dataset.id}>
            {dataset.title}: <a href={dataset.url}>Link to Dataset</a>
          </li>
        ))}
      </ul>
    </main>
  )
}
