import { useState } from "react"

export function useMockCollection<T extends { id: string }>(initialRecords: T[]) {
  const [records, setRecords] = useState(initialRecords)
  return {
    records,
    create: (record: T) => setRecords((current) => {
      // Check if record already exists
      const exists = current.some((item) => item.id === record.id)
      if (exists) return current
      return [record, ...current]
    }),
    update: (record: T) => setRecords((current) => 
      current.map((item) => item.id === record.id ? record : item)
    ),
    remove: (id: string) => setRecords((current) => 
      current.filter((item) => item.id !== id)
    ),
    // Add a setRecords method to directly set all records
    setRecords: (newRecords: T[]) => setRecords(newRecords),
    // Add a clear method
    clear: () => setRecords([]),
  }
}