const STORAGE_KEY = 'busca-minas-records'

export function getRecords() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {}
  } catch {
    return {}
  }
}

export function saveRecord(difficulty, time) {
  const records = getRecords()
  if (!records[difficulty] || time < records[difficulty]) {
    records[difficulty] = time
    localStorage.setItem(STORAGE_KEY, JSON.stringify(records))
    return true
  }
  return false
}

export function getRecord(difficulty) {
  const records = getRecords()
  return records[difficulty] ?? null
}
