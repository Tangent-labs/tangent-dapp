import { revalidateTag, unstable_cache } from "next/cache"

const GOUV_DATASETS_CACHE_TAG = "gouv-datasets"
const CACHE_OPTION = { revalidate: 10 * 60 } // revalidate time in {revalidate} seconds

export const refreshDataSet = () => {
  revalidateTag(GOUV_DATASETS_CACHE_TAG)
}

const getData = async () => {
  const apiUrl = "https://www.data.gouv.fr/api/1/datasets/"
  // Fetch the list of datasets
  const response = await fetch(apiUrl)
  return (await response.json()) as GouvDatasetResponse
}

export const getDatasets = async () => {
  return await getData()
}

export const getDatasetsWithCache = unstable_cache(
  async () => {
    return getData()
  },
  [GOUV_DATASETS_CACHE_TAG],
  CACHE_OPTION
)

export type GouvDatasetResponse = {
  data: {
    id: string
    url: string
    title: string
  }[]
}
