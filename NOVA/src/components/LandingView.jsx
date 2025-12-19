import { useState } from 'react'
import CanvasView from './CanvasView.jsx'
import '../styles/landing.css'

function LandingView() {
  const [query, setQuery] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    if (query.trim()) {
      // TODO: 검색 처리 로직
      console.log('Search:', query)
    }
  }

  return (
    <div className="landing-container">
      {/* 배경: 별과 지구 (블러 효과) */}
      <div className="landing-background">
        <CanvasView />
      </div>

      {/* 전면: 검색바 */}
      <div className="landing-content">
        <div className="landing-header">
          <h1 className="landing-title">NOVA</h1>
          <p className="landing-subtitle">
            자신만의 우주를 만들어보세요
          </p>
        </div>

        <form className="landing-search-form" onSubmit={handleSubmit}>
          <div className="landing-search-wrapper">
            <input
              type="text"
              className="landing-search-input"
              placeholder="당신의 우주를 설명해주세요..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              autoFocus
            />
            <button type="submit" className="landing-search-button">
              →
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default LandingView

