import React, { useEffect, useRef, useMemo } from "react";
import cloudImg from "../../assets/parallax/cloudzip.png";
import mountainImg from "../../assets/parallax/mountainzip.png";
import cornImg from "../../assets/parallax/cornfieldzip.png";
import grassImg from "../../assets/parallax/grasszip.png";
import bushImg from "../../assets/parallax/bushzip.png";

const ParallaxEffects = ({ currentSection }) => {
    const layerRefs = useRef([]);
    const containerRef = useRef(null);

    // 🔥 패럴랙스 레이어 설정 - 각 레이어마다 명확히 다른 속도
    const layers = useMemo(() => [
        { src: cloudImg, speed: 0.2, top: "-15%", minH: "130vh", z: 1, scale: false },
        { src: mountainImg, speed: 0.4, top: "-3%", minH: "120vh", z: 2, scale: false },
        { src: cornImg, speed: 0.6, top: "-3%", minH: "120vh", z: 3, scale: false },
        { src: grassImg, speed: 0.85, top: "-3%", minH: "120vh", z: 4, scale: false },
        { src: bushImg, speed: 1.2, bottom: "-15", minH: "100vh", z: 5, scale: true },
    ], []);

    useEffect(() => {
        // 스크롤 컨테이너 찾기
        const findScrollContainer = () => {
            let el = layerRefs.current[0];
            while (el && el.parentElement) {
                const parent = el.parentElement;
                const overflowY = window.getComputedStyle(parent).overflowY;
                if (overflowY === 'scroll' || overflowY === 'auto') {
                    return parent;
                }
                el = parent;
            }
            return window;
        };

        const scrollContainer = findScrollContainer();
        containerRef.current = scrollContainer;

        let animationFrameId = null;
        let running = true;
        let lastScrollY = -1;

        const handleParallax = () => {
            if (!running) return;

            // 🔥 올바른 스크롤 값 가져오기
            const scrollY = scrollContainer === window 
                ? window.scrollY 
                : scrollContainer.scrollTop;
            
            // 스크롤이 변하지 않으면 스킵
            if (scrollY === lastScrollY) {
                animationFrameId = requestAnimationFrame(handleParallax);
                return;
            }
            lastScrollY = scrollY;

            const viewportHeight = window.innerHeight;
            const firstSectionHeight = viewportHeight * 1.5;

            // 🔥 첫 섹션 벗어났을 때 페이드아웃
            if (currentSection !== 0) {
                const fadeStart = firstSectionHeight;
                const fadeDistance = viewportHeight * 0.5;
                const fadeProgress = Math.min((scrollY - fadeStart) / fadeDistance, 1);
                
                layerRefs.current.forEach((el, i) => {
                    if (!el) return;
                    
                    const { speed, scale } = layers[i];
                    const translateY = -(scrollY * speed);
                    
                    const progress = scrollY / firstSectionHeight;
                    let scaleValue = 1;
                    if (scale) {
                        scaleValue = 1 + (progress * 0.4);
                    }
                    
                    const combined = scale 
                        ? `translate3d(0, ${translateY}px, 0) scale(${scaleValue})`
                        : `translate3d(0, ${translateY}px, 0)`;
                    
                    const opacity = Math.max(0, 1 - fadeProgress);
                    
                    el.style.transform = combined;
                    el.style.opacity = opacity.toString();
                });
                
                animationFrameId = requestAnimationFrame(handleParallax);
                return;
            }

            // 🔥 섹션 0일 때 - 풀 패럴랙스 효과
            const progress = Math.min(scrollY / firstSectionHeight, 1);

            layerRefs.current.forEach((el, i) => {
                if (!el) return;

                const { speed, scale } = layers[i];
                
                // 🎯 각 레이어마다 독립적인 패럴랙스 이동 (음수로 위로 올라감)
                const translateY = -(scrollY * speed);
                
                let scaleValue = 1;
                if (scale) {
                    scaleValue = 1 + (progress * 0.4);
                }
                
                const combined = scale 
                    ? `translate3d(0, ${translateY}px, 0) scale(${scaleValue})`
                    : `translate3d(0, ${translateY}px, 0)`;

                // 🔥 90% 이상 스크롤 시 빠르게 페이드아웃
                let opacity = 1;
                if (progress > 0.9) {
                    opacity = Math.max(0, 1 - ((progress - 0.9) / 0.1) * 5);
                } else {
                    opacity = Math.max(0.5, 1 - (progress * 0.3));
                }

                el.style.transform = combined;
                el.style.opacity = opacity.toString();
            });

            animationFrameId = requestAnimationFrame(handleParallax);
        };

        // 🚀 초기 설정
        layerRefs.current.forEach((el) => {
            if (el) {
                el.style.opacity = "1";
                el.style.transform = "translate3d(0, 0, 0)";
            }
        });

        // 스크롤 이벤트 리스너 추가
        const handleScrollEvent = () => {
            if (!animationFrameId) {
                animationFrameId = requestAnimationFrame(handleParallax);
            }
        };

        if (scrollContainer === window) {
            window.addEventListener('scroll', handleScrollEvent, { passive: true });
        } else {
            scrollContainer.addEventListener('scroll', handleScrollEvent, { passive: true });
        }

        // 초기 실행
        handleParallax();

        return () => {
            running = false;
            if (animationFrameId) cancelAnimationFrame(animationFrameId);
            
            if (scrollContainer === window) {
                window.removeEventListener('scroll', handleScrollEvent);
            } else {
                scrollContainer.removeEventListener('scroll', handleScrollEvent);
            }
        };
    }, [currentSection, layers]);

    return (
        <>
            {/* 아래 그라디언트 오버레이 */}
            <div
                style={{
                    position: "absolute",
                    bottom: 0,
                    left: 0,
                    width: "100%",
                    height: "50%",
                    background:
                        "linear-gradient(180deg, transparent 0%, rgba(10, 58, 43, 0.5) 40%, rgba(26, 46, 18, 0.9) 100%)",
                    zIndex: 6,
                    pointerEvents: "none",
                }}
            />

            {/* 패럴랙스 레이어들 */}
            {layers.map((layer, i) => (
                <img
                    key={i}
                    ref={(el) => (layerRefs.current[i] = el)}
                    src={layer.src}
                    alt={`parallax-layer-${i}`}
                    style={{
                        position: "absolute",
                        left: 0,
                        width: "100%",
                        height: "auto",
                        objectFit: "cover",
                        willChange: "transform",
                        transformOrigin: layer.scale ? "center bottom" : "center",
                        top: layer.top,
                        bottom: layer.bottom,
                        minHeight: layer.minH,
                        zIndex: layer.z,
                        pointerEvents: "none",
                        opacity: 1,
                    }}
                />
            ))}
        </>
    );
};

export default ParallaxEffects;