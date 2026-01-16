// LandingView.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import CanvasView from "./CanvasView.jsx";
import "../styles/landing.css";

function LandingView() {
  const [query, setQuery] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      // 로딩 페이지로 이동
      navigate("/loading", { state: { query } });
    }
  };


  
 

  
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
          <p className="landing-subtitle">자신만의 우주를 만들어보세요</p>
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
              <svg
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="cursor-arrow"
              >
                {/* Vertical line (cursor body) */}
                <line
                  x1="10"
                  y1="2"
                  x2="10"
                  y2="17"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
                {/* Arrow pointing top-right (cursor arrowhead) */}
                <path
                  d="M10 2 L16 8 M10 2 L4 8 M16 8 L12 4"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default LandingView;
