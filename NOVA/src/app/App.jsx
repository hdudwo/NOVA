import { useState } from 'react'
import CanvasView from '../components/CanvasView.jsx'
import TextInput from '../components/TextInput.jsx'

function App() {
  const [sentence, setSentence] = useState('')

  return (
    <main className="app-shell">
      <header className="app-header">
        <div>
          <p className="eyebrow">NOVA</p>
          <h1>Language → Universe</h1>
          <p className="app-tagline">
            Describe a feeling or a scene and we will map it into a visual
            universe.
          </p>
        </div>
      </header>

      <section className="app-grid">
        <CanvasView />
        <TextInput value={sentence} onChange={setSentence} />
      </section>
    </main>
  )
}

export default App

