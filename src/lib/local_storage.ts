// localStorageUtils.ts
export const localStorageUtils = {
  setItem<T>(key: string, value: T): void {
    try {
      //Server side.
      if (typeof window === "undefined") return

      const serializedValue = JSON.stringify(value)
      localStorage.setItem(key, serializedValue)
    } catch (error) {
      console.error("Error setting item to localStorage", error)
    }
  },

  getItem<T>(key: string): T | null {
    try {
      //Server side. console.log("localStorage", localStorage)
      if (typeof window === "undefined") return null

      const serializedValue = localStorage.getItem(key)
      if (serializedValue === null) return null
      return JSON.parse(serializedValue) as T
    } catch (error) {
      console.error("Error getting item from localStorage", error)
      return null
    }
  },

  removeItem(key: string): void {
    try {
      //Server side.
      if (typeof window === "undefined") return
      localStorage.removeItem(key)
    } catch (error) {
      console.error("Error removing item from localStorage", error)
    }
  },

  clear(): void {
    try {
      //Server side.
      if (typeof window === "undefined") return
      localStorage.clear()
    } catch (error) {
      console.error("Error clearing localStorage", error)
    }
  },
}
