import { localStorageUtils } from "@/lib/local_storage"
import { useEffect, useState } from "react"

export function useLocalStorageState<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    const item = localStorageUtils.getItem<T>(key)
    return item !== null ? item : initialValue
  })

  useEffect(() => {
    localStorageUtils.setItem(key, storedValue)
  }, [key, storedValue])

  return [storedValue, setStoredValue] as const
}
