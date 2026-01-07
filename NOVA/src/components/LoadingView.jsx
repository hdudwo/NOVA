import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "../styles/loading.css";

function LoadingView() {
  const navigate = useNavigate();
  const location = useLocation();
  const query = location.state?.query || "";

  useEffect(() => {
    // 3초 후 우주 생성 페이지로 이동
    const timer = setTimeout(() => {
      navigate("/universe", { state: { query } });
    }, 3000);

    return () => clearTimeout(timer);
  }, [navigate, query]);

  return (
    <div className="loading-container">
      <div className="loading-content">
        <div className="loading-spinner">
          <div className="spinner-ring"></div>
          <div className="spinner-ring"></div>
          <div className="spinner-ring"></div>
        </div>

        <h2 className="loading-title">당신만의 우주를 생성중입니다</h2>
        <p className="loading-subtitle">잠시만 기다려주세요...</p>

        {query && <p className="loading-query">"{query}"</p>}
      </div>
    </div>
  );
}

export default LoadingView;
