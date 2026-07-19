import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import {
  Button,
  Input,
  Label,
  ListBox,
  ListBoxItem,
  Popover,
  Select,
  SelectValue,
  TextField,
} from 'react-aria-components'
import { getCharacter, updateCharacter } from '../data/characterStore'
import {
  fetchBaseClasses,
  fetchBaseSpecies,
  sourceLabel,
  type Open5eDocument,
} from '../data/open5eClient'
import { useOpen5eCollection } from '../data/useOpen5eCollection'
import type { Character } from '../types/character'

export function CharacterBuilder() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [character, setCharacter] = useState<Character | undefined>(() =>
    id ? getCharacter(id) : undefined,
  )

  const species = useOpen5eCollection(fetchBaseSpecies)
  const classes = useOpen5eCollection(fetchBaseClasses)

  useEffect(() => {
    if (id && !character) {
      navigate('/', { replace: true })
    }
  }, [id, character, navigate])

  if (!character) return null

  function handleNameChange(name: string) {
    setCharacter((prev) => (prev ? (updateCharacter(prev.id, { name }) ?? prev) : prev))
  }

  function handleRaceChange(key: string) {
    setCharacter((prev) => (prev ? (updateCharacter(prev.id, { race: key }) ?? prev) : prev))
  }

  function handleClassChange(key: string) {
    setCharacter((prev) => (prev ? (updateCharacter(prev.id, { className: key }) ?? prev) : prev))
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

      <Open5ePicker
        label="Race"
        status={species.status}
        error={species.error}
        onRetry={species.retry}
        items={species.items}
        selectedKey={character.race}
        onChange={handleRaceChange}
      />

      <Open5ePicker
        label="Class"
        status={classes.status}
        error={classes.error}
        onRetry={classes.retry}
        items={classes.items}
        selectedKey={character.className}
        onChange={handleClassChange}
      />
    </main>
  )
}

interface Open5eOption {
  key: string
  name: string
  document: Open5eDocument
}

function Open5ePicker<T extends Open5eOption>({
  label,
  status,
  error,
  onRetry,
  items,
  selectedKey,
  onChange,
}: {
  label: string
  status: 'loading' | 'error' | 'ready'
  error: string | null
  onRetry: () => void
  items: T[]
  selectedKey: string | undefined
  onChange: (key: string) => void
}) {
  if (status === 'loading') {
    return (
      <p role="status" aria-live="polite">
        Loading {label.toLowerCase()} options…
      </p>
    )
  }

  if (status === 'error') {
    return (
      <div role="alert">
        <p>Couldn't load {label.toLowerCase()} options{error ? `: ${error}` : '.'}</p>
        <Button onPress={onRetry}>Retry</Button>
      </div>
    )
  }

  return (
    <Select selectedKey={selectedKey ?? null} onSelectionChange={(key) => onChange(String(key))}>
      <Label>{label}</Label>
      <Button>
        <SelectValue />
        <span aria-hidden="true"> ▾</span>
      </Button>
      <Popover>
        <ListBox items={items}>
          {(item) => (
            <ListBoxItem id={item.key} textValue={`${item.name} — ${sourceLabel(item.document)}`}>
              {item.name}
              <span className="source-tag"> — {sourceLabel(item.document)}</span>
            </ListBoxItem>
          )}
        </ListBox>
      </Popover>
    </Select>
  )
}
