import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Input, Label, TextField } from 'react-aria-components'
import { getCharacter, updateCharacter } from '../data/characterStore'
import type { Character } from '../types/character'

export function CharacterBuilder() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [character, setCharacter] = useState<Character | undefined>(() =>
    id ? getCharacter(id) : undefined,
  )

  useEffect(() => {
    if (id && !character) {
      navigate('/', { replace: true })
    }
  }, [id, character, navigate])

  if (!character) return null

  function handleNameChange(name: string) {
    setCharacter((prev) => {
      if (!prev) return prev
      return updateCharacter(prev.id, { name }) ?? prev
    })
  }

  return (
    <main>
      <p>
        <Link to="/">&larr; Back to characters</Link>
      </p>
      <h1>{character.name}</h1>

      <TextField value={character.name} onChange={handleNameChange}>
        <Label>Character name</Label>
        <Input />
      </TextField>

      <p className="placeholder-note">
        Race, class, spell, and skill pickers are coming next — this page proves the save/load
        flow works.
      </p>
    </main>
  )
}
