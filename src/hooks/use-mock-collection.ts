import { useState } from "react"

export function useMockCollection<T extends { id: string }>(initialRecords: T[]) {
  const [records, setRecords] = useState(initialRecords)
  return {
    records,
    create: (record: T) => setRecords((current) => [record, ...current]),
    update: (record: T) => setRecords((current) => current.map((item) => item.id === record.id ? record : item)),
    remove: (id: string) => setRecords((current) => current.filter((item) => item.id !== id)),
  }
}
