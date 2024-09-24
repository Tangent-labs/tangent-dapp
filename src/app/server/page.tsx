import texts from "@/app/dictionnaries/en.json";
import { getDatasetsWithCache } from "@/services/gouv";

// load the data

export default async function Page() {
  const datasets = await getDatasetsWithCache();
  return (
    <>
     <span className="text-red-950">Server PAGE {Math.random()}</span>
      <div>{texts.gnl.welcome}</div>
      <ul>
      {datasets?.data?.map((dataset) => (
        <li key={dataset.id}>
          {dataset.title}: <a href={dataset.url}>Link to Dataset</a>
        </li>
      ))}
      </ul>
    </>
  );
}
