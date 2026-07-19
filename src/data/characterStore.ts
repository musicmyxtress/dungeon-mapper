import type { Character } from '../types/character'

const STORAGE_KEY = 'dungeon-mapper.characters'

function readAll(): Character[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as Character[]) : []
  } catch {
    return []
  }
}

function writeAll(characters: Character[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(characters))
}

export function listCharacters(): Character[] {
  return readAll().sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
}

export function getCharacter(id: string): Character | undefined {
  return readAll().find((c) => c.id === id)
}

export function createCharacter(name: string): Character {
  const now = new Date().toISOString()
  const character: Character = {
    id: crypto.randomUUID(),
    name,
    level: 1,
    createdAt: now,
    updatedAt: now,
  }
  writeAll([...readAll(), character])
  return character
}

export function updateCharacter(
  id: string,
  patch: Partial<Omit<Character, 'id' | 'createdAt'>>,
): Character | undefined {
  const characters = readAll()
  const index = characters.findIndex((c) => c.id === id)
  if (index === -1) return undefined
  const updated = { ...characters[index], ...patch, updatedAt: new Date().toISOString() }
  characters[index] = updated
  writeAll(characters)
  return updated
}

export function deleteCharacter(id: string): void {
  writeAll(readAll().filter((c) => c.id !== id))
}
