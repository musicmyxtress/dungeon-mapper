import { Route, Routes } from 'react-router-dom'
import { CharacterList } from './pages/CharacterList'
import { CharacterBuilder } from './pages/CharacterBuilder'

function App() {
  return (
    <Routes>
      <Route path="/" element={<CharacterList />} />
      <Route path="/character/:id" element={<CharacterBuilder />} />
    </Routes>
  )
}

export default App
