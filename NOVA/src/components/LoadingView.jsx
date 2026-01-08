import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

function LoadingView() {
  const navigate = useNavigate();
  const location = useLocation();
  const query = location.state?.query || "";
  const [flash, setFlash] = useState(false);

  useEffect(() => {
    const flashTimer = setTimeout(() => {
      setFlash(true);
    }, 3700);

    const navTimer = setTimeout(() => {
      navigate("/universe", { state: { query } });
    }, 4000);

    return () => {
      clearTimeout(flashTimer);
      clearTimeout(navTimer);
    };
  }, [navigate, query]);

  // 색상 배열 (파란색, 보라색, 노란색)
  const colors = [
    { r: 147, g: 197, b: 253 }, // 파란색
    { r: 196, g: 181, b: 253 }, // 보라색
    { r: 253, g: 224, b: 71 }, // 노란색
  ];

  return (
    <div
      style={{
        position: "relative",
        width: "100vw",
        height: "100vh",
        background: "black",
        overflow: "hidden",
      }}
    >
      {/* 워프 라인들 */}
      <div style={{ position: "absolute", inset: 0 }}>
        {[...Array(120)].map((_, i) => {
          const angle = (i / 120) * 360;
          const delay = (i % 15) * 0.05;
          const opacity = 0.5 + Math.random() * 0.4;

          // 랜덤 색상 선택
          const color = colors[Math.floor(Math.random() * colors.length)];

          // 각도를 라디안으로 변환
          const radian = (angle * Math.PI) / 180;
          const startRadius = 800; // 시작 위치 (멀리)
          const startX = Math.cos(radian) * startRadius;
          const startY = Math.sin(radian) * startRadius;

          return (
            <div
              key={i}
              style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                width: "3px",
                height: "100px",
                transformOrigin: "center top",
                transform: `translate(-50%, -50%) rotate(${angle}deg)`,
                background: `linear-gradient(to bottom, 
                  rgba(255, 255, 255, 0.9), 
                  rgba(${color.r}, ${color.g}, ${color.b}, ${opacity}), 
                  rgba(${color.r}, ${color.g}, ${color.b}, 0))`,
                animation: `flyToCenter 1.5s ease-in ${delay}s infinite`,
                "--start-x": `${startX}px`,
                "--start-y": `${startY}px`,
              }}
            />
          );
        })}
      </div>

      {/* 중앙 빛나는 점 */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "50px",
          height: "50px",
          background: "white",
          borderRadius: "50%",
          animation: "pulseGrow 4s ease-in forwards",
          boxShadow:
            "0 0 60px 25px rgba(255, 255, 255, 0.9), 0 0 120px 50px rgba(255, 255, 255, 0.5)",
          zIndex: 5,
        }}
      />

      {/* 강력한 플래시 효과 */}
      {flash && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "white",
            zIndex: 20,
            animation: "strongFlash 0.3s ease-out forwards",
          }}
        />
      )}

      <style>{`
        @keyframes flyToCenter {
          0% {
            transform: translate(-50%, -50%) translate(var(--start-x), var(--start-y)) rotate(var(--angle)) scale(0.3);
            height: 60px;
            opacity: 0;
          }
          20% {
            opacity: 1;
          }
          100% {
            transform: translate(-50%, -50%) translate(0, 0) rotate(var(--angle)) scale(2);
            height: 300px;
            opacity: 0;
          }
        }

        @keyframes pulseGrow {
          0% {
            transform: translate(-50%, -50%) scale(1);
            opacity: 1;
          }
          50% {
            transform: translate(-50%, -50%) scale(1.5);
            opacity: 1;
          }
          100% {
            transform: translate(-50%, -50%) scale(6);
            opacity: 1;
          }
        }

        @keyframes strongFlash {
          0% {
            opacity: 0;
          }
          30% {
            opacity: 1;
          }
          100% {
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}

export default LoadingView;
