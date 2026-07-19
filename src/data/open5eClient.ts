const BASE_URL = 'https://api.open5e.com/v2'
const CACHE_TTL_MS = 24 * 60 * 60 * 1000

// Open5e also carries content for Level Up: Advanced 5e (a5e), a related but
// distinct game system. We only want genuine D&D 5e content (SRD + 5e-compatible
// third party like Kobold Press), so we filter to these game systems.
const D5E_GAMESYSTEMS = new Set(['5e-2014', '5e-2024'])

export interface Open5eDocument {
  key: string
  name: string
  gamesystem: { key: string; name: string }
  publisher: { key: string; name: string }
}

export interface Open5eClass {
  key: string
  name: string
  desc: string
  hit_dice: string | null
  subclass_of: string | null
  document: Open5eDocument
}

export interface Open5eSpecies {
  key: string
  name: string
  desc: string
  is_subspecies: boolean
  subspecies_of: string | null
  document: Open5eDocument
}

export function sourceLabel(doc: Open5eDocument): string {
  if (doc.key === 'srd-2014') return 'SRD 2014'
  if (doc.key === 'srd-2024') return 'SRD 2024'
  return doc.name
}

interface CacheEntry<T> {
  fetchedAt: number
  data: T
}

function readCache<T>(key: string): T[] | null {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return null
    const entry = JSON.parse(raw) as CacheEntry<T[]>
    if (Date.now() - entry.fetchedAt > CACHE_TTL_MS) return null
    return entry.data
  } catch {
    return null
  }
}

function writeCache<T>(key: string, data: T[]) {
  try {
    const entry: CacheEntry<T[]> = { fetchedAt: Date.now(), data }
    localStorage.setItem(key, JSON.stringify(entry))
  } catch {
    // Storage full or unavailable — skip caching, next load just refetches.
  }
}

async function fetchAllPages<T>(path: string): Promise<T[]> {
  const results: T[] = []
  let url: string | null = `${BASE_URL}${path}`
  while (url) {
    const response: Response = await fetch(url)
    if (!response.ok) {
      throw new Error(`Open5e request failed: ${response.status} ${response.statusText}`)
    }
    const page: { results: T[]; next: string | null } = await response.json()
    results.push(...page.results)
    url = page.next
  }
  return results
}

async function fetchWithCache<T>(cacheKey: string, path: string): Promise<T[]> {
  const cached = readCache<T>(cacheKey)
  if (cached) return cached
  const data = await fetchAllPages<T>(path)
  writeCache(cacheKey, data)
  return data
}

function bySourceThenName(a: { name: string; document: Open5eDocument }, b: { name: string; document: Open5eDocument }) {
  return a.name.localeCompare(b.name) || a.document.key.localeCompare(b.document.key)
}

export async function fetchBaseClasses(): Promise<Open5eClass[]> {
  const all = await fetchWithCache<Open5eClass>('dungeon-mapper.cache.classes', '/classes/?limit=250')
  return all
    .filter((c) => !c.subclass_of && D5E_GAMESYSTEMS.has(c.document.gamesystem.key))
    .sort(bySourceThenName)
}

export async function fetchBaseSpecies(): Promise<Open5eSpecies[]> {
  const all = await fetchWithCache<Open5eSpecies>('dungeon-mapper.cache.species', '/species/?limit=100')
  return all
    .filter((s) => !s.is_subspecies && D5E_GAMESYSTEMS.has(s.document.gamesystem.key))
    .sort(bySourceThenName)
}
