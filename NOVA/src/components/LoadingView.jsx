import { useEffect, useState, useMemo } from "react";

function LoadingView() {
  const [flash, setFlash] = useState(false);

  useEffect(() => {
    const flashTimer = setTimeout(() => {
      setFlash(true);
    }, 2800);

    return () => {
      clearTimeout(flashTimer);
    };
  }, []);

  // 색상 배열 (노랑, 연보라 추가)
  const colors = [
    { r: 147, g: 197, b: 253 }, // 파란색
    { r: 196, g: 181, b: 253 }, // 보라색
    { r: 255, g: 255, b: 255 }, // 흰색
    { r: 253, g: 224, b: 71 }, // 노랑 ✨
    { r: 220, g: 200, b: 255 }, // 연보라 ✨
  ];

  // 화면 안에서 밖으로 날아오는 선들
  const lines = useMemo(() => {
    return [...Array(500)].map(() => {
      // 중앙에서 바깥으로 방사형으로 퍼지는 각도
      const angle = Math.random() * 360;

      // 해당 각도 방향의 위치 계산
      const radian = angle * (Math.PI / 180);
      const distance = 1500 + Math.random() * 1000;
      const posX = Math.cos(radian) * distance;
      const posY = Math.sin(radian) * distance;

      // 랜덤 색상
      const color = colors[Math.floor(Math.random() * colors.length)];

      // 랜덤 속성
      const delay = Math.random() * 0.4;
      const speed = 0.6 + Math.random() * 0.4;
      const opacity = 0.5 + Math.random() * 0.5;
      const width = 3 + Math.random() * 3; // 3~6px로 두껍게 ✨

      return {
        posX,
        posY,
        angle,
        color,
        delay,
        speed,
        opacity,
        width,
      };
    });
  }, []);

  return (
    <div
      style={{
        position: "relative",
        width: "100vw",
        height: "100vh",
        background: "black",
        overflow: "hidden",
        perspective: "800px",
      }}
    >
      {/* 화면 안에서 밖으로 뚫고 나오는 선들 */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          transformStyle: "preserve-3d",
        }}
      >
        {lines.map((line, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              width: `${line.width}px`,
              height: "0px",
              transformOrigin: "center top",
              transformStyle: "preserve-3d",
              background: `linear-gradient(to bottom, 
                rgba(${line.color.r}, ${line.color.g}, ${line.color.b}, ${
                line.opacity
              }), 
                rgba(${line.color.r}, ${line.color.g}, ${line.color.b}, ${
                line.opacity * 0.6
              }), 
                rgba(${line.color.r}, ${line.color.g}, ${line.color.b}, 0))`,
              animation: `breakThrough ${line.speed}s ease-out ${line.delay}s infinite`,
              "--pos-x": `${line.posX}px`,
              "--pos-y": `${line.posY}px`,
              "--angle": `${line.angle}deg`,
              willChange: "transform, height, opacity",
            }}
          />
        ))}
      </div>

      {/* 중앙 빛나는 점 */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "15px",
          height: "15px",
          background: "white",
          borderRadius: "50%",
          animation:
            "approachingLight 3s cubic-bezier(0.2, 0.1, 0.8, 1) forwards",
          boxShadow:
            "0 0 20px 8px rgba(255, 255, 255, 0.9), 0 0 40px 15px rgba(147, 197, 253, 0.6), 0 0 60px 25px rgba(196, 181, 253, 0.4)",
          zIndex: 10,
        }}
      />

      {/* 충격파 이펙트 - 원이 커질 때 */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          width: "100px",
          height: "100px",
          transform: "translate(-50%, -50%)",
          zIndex: 9,
        }}
      >
        {[...Array(12)].map((_, i) => {
          const angle = (i / 12) * 360;
          return (
            <div
              key={i}
              style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                width: "4px",
                height: "4px",
                background: "white",
                borderRadius: "50%",
                boxShadow: "0 0 10px 3px rgba(255, 255, 255, 0.8)",
                animation: `impactParticle 0.8s ease-out 2.2s forwards`,
                opacity: 0,
                "--angle": `${angle}deg`,
              }}
            />
          );
        })}
      </div>

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
        @keyframes breakThrough {
          0% {
            transform: 
              translate(-50%, -50%)
              translate(0, 0)
              translateZ(0px)
              rotate(var(--angle))
              scale(0.1);
            height: 0px;
            opacity: 0;
          }
          5% {
            opacity: 1;
          }
          15% {
            height: 100px;
            transform: 
              translate(-50%, -50%)
              translate(calc(var(--pos-x) * 0.1), calc(var(--pos-y) * 0.1))
              translateZ(100px)
              rotate(var(--angle))
              scale(0.3);
          }
          30% {
            transform: 
              translate(-50%, -50%)
              translate(calc(var(--pos-x) * 0.3), calc(var(--pos-y) * 0.3))
              translateZ(300px)
              rotate(var(--angle))
              scale(0.5);
            height: 250px;
          }
          50% {
            transform: 
              translate(-50%, -50%)
              translate(calc(var(--pos-x) * 0.5), calc(var(--pos-y) * 0.5))
              translateZ(600px)
              rotate(var(--angle))
              scale(0.8);
            height: 400px;
          }
          70% {
            transform: 
              translate(-50%, -50%)
              translate(calc(var(--pos-x) * 0.7), calc(var(--pos-y) * 0.7))
              translateZ(1000px)
              rotate(var(--angle))
              scale(1.2);
            height: 600px;
          }
          85% {
            transform: 
              translate(-50%, -50%)
              translate(calc(var(--pos-x) * 0.9), calc(var(--pos-y) * 0.9))
              translateZ(1500px)
              rotate(var(--angle))
              scale(1.5);
            height: 800px;
            opacity: 1;
          }
          100% {
            transform: 
              translate(-50%, -50%)
              translate(var(--pos-x), var(--pos-y))
              translateZ(2000px)
              rotate(var(--angle))
              scale(2);
            height: 1000px;
            opacity: 0;
          }
        }

        @keyframes approachingLight {
          0% {
            transform: translate(-50%, -50%) scale(1);
            box-shadow: 
              0 0 20px 8px rgba(255, 255, 255, 0.9), 
              0 0 40px 15px rgba(147, 197, 253, 0.6), 
              0 0 60px 25px rgba(196, 181, 253, 0.4);
          }
          50% {
            transform: translate(-50%, -50%) scale(1.5);
            box-shadow: 
              0 0 30px 12px rgba(255, 255, 255, 0.95), 
              0 0 60px 25px rgba(147, 197, 253, 0.65), 
              0 0 90px 40px rgba(196, 181, 253, 0.45);
          }
          75% {
            transform: translate(-50%, -50%) scale(3);
            box-shadow: 
              0 0 80px 35px rgba(255, 255, 255, 1), 
              0 0 160px 70px rgba(147, 197, 253, 0.8), 
              0 0 240px 100px rgba(196, 181, 253, 0.6);
          }
          100% {
            transform: translate(-50%, -50%) scale(15);
            box-shadow: 
              0 0 250px 120px rgba(255, 255, 255, 1), 
              0 0 500px 250px rgba(147, 197, 253, 1), 
              0 0 750px 400px rgba(196, 181, 253, 0.8);
          }
        }

        @keyframes impactParticle {
          0% {
            transform: translate(-50%, -50%) rotate(var(--angle)) translateX(0px) scale(1);
            opacity: 0;
          }
          10% {
            opacity: 1;
          }
          100% {
            transform: translate(-50%, -50%) rotate(var(--angle)) translateX(150px) scale(0.3);
            opacity: 0;
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
