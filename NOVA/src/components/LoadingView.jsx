import { useEffect, useState } from "react";

function LoadingView() {
  const [flash, setFlash] = useState(false);

  useEffect(() => {
    const flashTimer = setTimeout(() => {
      setFlash(true);
    }, 3700);

    return () => {
      clearTimeout(flashTimer);
    };
  }, []);

  // 색상 배열 (파란색, 보라색, 흰색)
  const colors = [
    { r: 147, g: 197, b: 253 }, // 파란색
    { r: 196, g: 181, b: 253 }, // 보라색
    { r: 255, g: 255, b: 255 }, // 흰색
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
      {/* 워프 라인들 - 중앙에서 바깥으로 */}
      <div style={{ position: "absolute", inset: 0 }}>
        {[...Array(150)].map((_, i) => {
          const angle = (i / 150) * 360;
          const delay = (i % 20) * 0.03;
          const opacity = 0.4 + Math.random() * 0.6;
          const speed = 0.8 + Math.random() * 0.4; // 랜덤 속도

          // 랜덤 색상 선택
          const color = colors[Math.floor(Math.random() * colors.length)];

          return (
            <div
              key={i}
              style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                width: "2px",
                height: "0px",
                transformOrigin: "center top",
                transform: `translate(-50%, 0) rotate(${angle}deg)`,
                background: `linear-gradient(to bottom, 
                  rgba(${color.r}, ${color.g}, ${color.b}, ${opacity}), 
                  rgba(${color.r}, ${color.g}, ${color.b}, ${opacity * 0.5}), 
                  rgba(${color.r}, ${color.g}, ${color.b}, 0))`,
                animation: `warpOut ${speed}s linear ${delay}s infinite`,
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
          width: "30px",
          height: "30px",
          background: "white",
          borderRadius: "50%",
          animation: "pulseGlow 2s ease-in-out infinite",
          boxShadow:
            "0 0 40px 15px rgba(255, 255, 255, 0.8), 0 0 80px 30px rgba(147, 197, 253, 0.5), 0 0 120px 50px rgba(196, 181, 253, 0.3)",
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
        @keyframes warpOut {
          0% {
            height: 0px;
            opacity: 0;
            transform: translate(-50%, 0) rotate(var(--angle, 0deg)) translateY(0);
          }
          10% {
            opacity: 1;
            height: 50px;
          }
          100% {
            height: 800px;
            opacity: 0;
            transform: translate(-50%, 0) rotate(var(--angle, 0deg)) translateY(0);
          }
        }

        @keyframes pulseGlow {
          0%, 100% {
            transform: translate(-50%, -50%) scale(1);
            box-shadow: 
              0 0 40px 15px rgba(255, 255, 255, 0.8), 
              0 0 80px 30px rgba(147, 197, 253, 0.5), 
              0 0 120px 50px rgba(196, 181, 253, 0.3);
          }
          50% {
            transform: translate(-50%, -50%) scale(1.3);
            box-shadow: 
              0 0 60px 25px rgba(255, 255, 255, 1), 
              0 0 120px 50px rgba(147, 197, 253, 0.7), 
              0 0 180px 80px rgba(196, 181, 253, 0.5);
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
