import React, { useEffect, useRef, useMemo } from "react";
import cloudImg from "../../assets/parallax/cloudzip.png";
import mountainImg from "../../assets/parallax/mountainzip.png";
import cornImg from "../../assets/parallax/cornfieldzip.png";
import grassImg from "../../assets/parallax/grasszip.png";
import bushImg from "../../assets/parallax/bushzip.png";

const ParallaxEffects = ({ currentSection }) => {
    const layerRefs = useRef([]);

    // 🔥 useMemo로 layers 배열이 리렌더 때마다 다시 만들어지지 않게 고정
    const layers = useMemo(() => [
        { src: cloudImg, speed: 0.2, range: 100, top: "-5%", minH: "120vh", z: 1, scale: false },
        { src: mountainImg, speed: 0.45, range: 250, top: "-3%", minH: "120vh", z: 2, scale: false },
        { src: cornImg, speed: 0.7, range: 350, top: "-3%", minH: "120vh", z: 3, scale: false },
        { src: grassImg, speed: 0.9, range: 450, top: "-3%", minH: "120vh", z: 4, scale: false },
        { src: bushImg, speed: 1.0, range: 550, bottom: "0", minH: "100vh", z: 5, scale: true },
    ], []);

    useEffect(() => {
        let animationFrameId = null;
        let running = true; // 🔒 안전장치

        const handleParallax = () => {
            if (!running) return;

            const scrollY = window.scrollY;

            if (currentSection !== 0) {
                // 🔥 필요할 때만 style 변경 (성능 ↑)
                layerRefs.current.forEach((el, i) => {
                    if (el && el.style.opacity !== "0") {
                        el.style.opacity = 0;
                        el.style.transform = "translateY(0px) scale(1)";
                    }
                });
                return;
            }

            // 🔥 섹션 0일 때 패럴랙스 진행
            layerRefs.current.forEach((el, i) => {
                if (!el) return;

                const { speed, range, scale } = layers[i];
                const move = (scrollY * speed) % range;

                const translate = `translateY(${move}px)`;
                const scaled = scale ? `scale(${1 + scrollY * 0.0002})` : "";

                // 필요한 변화만 반영
                el.style.opacity = 1;
                el.style.transform = `${translate} ${scaled}`;
            });

            animationFrameId = requestAnimationFrame(handleParallax);
        };

        animationFrameId = requestAnimationFrame(handleParallax);

        return () => {
            running = false;
            if (animationFrameId) cancelAnimationFrame(animationFrameId);
        };
    }, [currentSection, layers]);

    return (
        <>
            {/* 아래쪽 그라디언트 */}
            <div
                style={{
                    position: "absolute",
                    bottom: 0,
                    left: 0,
                    width: "100%",
                    height: "45%",
                    background:
                        "linear-gradient(180deg, transparent 0%, #0A3A2B 50%, #1a2e12 100%)",
                    zIndex: 0,
                }}
            />

            {/* 패럴랙스 레이어 */}
            {layers.map((layer, i) => (
                <img
                    key={i}
                    ref={el => (layerRefs.current[i] = el)}
                    src={layer.src}
                    alt=""
                    style={{
                        position: "absolute",
                        left: 0,
                        width: "100%",
                        objectFit: "cover",
                        willChange: "transform, opacity",
                        transformOrigin: layer.scale ? "center bottom" : undefined,
                        opacity: 0,
                        top: layer.top,
                        bottom: layer.bottom,
                        minHeight: layer.minH,
                        height: "auto",
                        zIndex: layer.z,
                    }}
                />
            ))}
        </>
    );
};

export default ParallaxEffects;