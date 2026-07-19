import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Button, Input, Label, TextField } from 'react-aria-components'
import { createCharacter, deleteCharacter, listCharacters } from '../data/characterStore'
import type { Character } from '../types/character'

export function CharacterList() {
  const [characters, setCharacters] = useState<Character[]>(() => listCharacters())
  const [newName, setNewName] = useState('')
  const navigate = useNavigate()

  function handleCreate(event: FormEvent) {
    event.preventDefault()
    const trimmed = newName.trim()
    if (!trimmed) return
    const character = createCharacter(trimmed)
    setNewName('')
    navigate(`/character/${character.id}`)
  }

  function handleDelete(id: string) {
    deleteCharacter(id)
    setCharacters(listCharacters())
  }

  return (
    <main>
      <h1>Your Characters</h1>

      <form onSubmit={handleCreate}>
        <TextField value={newName} onChange={setNewName}>
          <Label>New character name</Label>
          <Input placeholder="e.g. Kaelith Stormbinder" />
        </TextField>
        <Button type="submit">Create character</Button>
      </form>

      {characters.length === 0 ? (
        <p>No characters yet. Create your first one above.</p>
      ) : (
        <ul className="character-list">
          {characters.map((character) => (
            <li key={character.id}>
              <Link to={`/character/${character.id}`}>
                {character.name} — Level {character.level}
              </Link>
              <Button onPress={() => handleDelete(character.id)} aria-label={`Delete ${character.name}`}>
                Delete
              </Button>
            </li>
          ))}
        </ul>
      )}
    </main>
  )
}
