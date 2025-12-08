import React, { useEffect, useRef, useMemo } from "react";
import cloudImg from "../../assets/parallax/cloudzip.png";
import mountainImg from "../../assets/parallax/mountainzip.png";
import bushImg from "../../assets/parallax/bushzip.png";

const ParallaxEffects = ({ currentSection }) => {
    const layerRefs = useRef([]);
    const containerRef = useRef(null);

    // 🔥 패럴랙스 레이어 설정 (높이와 수풀 bottom 값 수정)
    const layers = useMemo(() => [
        // 1. 구름: 높이 넉넉하게 확보
        { src: cloudImg, speed: 0.2, top: "-15%", height: "200vh", z: 1, scale: false },
        // 2. 산: 높이 넉넉하게 확보
        { src: mountainImg, speed: 0.4, top: "0", height: "180vh", z: 2, scale: false },
        // 3. 수풀: bottom을 음수로 설정하고 높이를 충분히 확보하여 잘림 방지
        { src: bushImg, speed: 1.2, bottom: "-30vh", height: "180vh", z: 5, scale: true },
    ], []);

    useEffect(() => {
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

            const scrollY = scrollContainer === window 
                ? window.scrollY 
                : scrollContainer.scrollTop;
            
            if (scrollY === lastScrollY) {
                animationFrameId = requestAnimationFrame(handleParallax);
                return;
            }
            lastScrollY = scrollY;

            const viewportHeight = window.innerHeight;
            // 섹션 높이 (스크롤이 완료되는 지점)
            const firstSectionHeight = viewportHeight * 1.5; 

            // 🔥 스크롤 진행률 (0.0 ~ 1.0)
            const progress = Math.min(scrollY / firstSectionHeight, 1); 

            layerRefs.current.forEach((el, i) => {
                if (!el) return;
                
                const { speed, scale } = layers[i];
                
                // 1. 변환 계산
                const translateY = -(scrollY * speed);
                
                let scaleValue = 1;
                if (scale) {
                    scaleValue = 1 + (progress * 0.4);
                }
                
                const combined = scale 
                    ? `translate3d(0, ${translateY}px, 0) scale(${scaleValue})`
                    : `translate3d(0, ${translateY}px, 0)`;

                // 2. 투명도 (Opacity) 계산
                let opacity = 1;

                if (currentSection === 0) {
                    // 섹션 0일 때: 스크롤 끝(70% 지점부터) 빠르게 페이드아웃
                    if (progress > 0.7) {
                        // 70%부터 100%까지 (0.3 구간) 투명도를 1에서 0으로 선형적으로 낮춤
                        opacity = Math.max(0, 1 - ((progress - 0.7) / 0.3)); 
                    } else {
                        // 일반 스크롤 시에도 약간 투명도를 낮춰 뒷 배경과 융화
                        opacity = Math.max(0.6, 1 - (progress * 0.4));
                    }
                } 
                else {
                    // 💥 섹션 0이 아닐 때: 즉시 투명도 0으로 설정하여 잔상 제거
                    opacity = 0;
                }

                // 3. 스타일 적용
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
        <div 
            style={{
                position: 'absolute', 
                top: 0, 
                left: 0, 
                width: '100%', 
                height: '100%', 
                zIndex: 1, 
                overflow: 'hidden' 
            }}
        >
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
                        height: layer.height, 
                        objectFit: "cover",
                        willChange: "transform",
                        // 렌더링 안정성 추가
                        backfaceVisibility: "hidden", 
                        perspective: "1000px", 
                        
                        transformOrigin: layer.scale ? "center bottom" : "center",
                        top: layer.bottom ? 'unset' : layer.top, 
                        bottom: layer.bottom,
                        zIndex: layer.z,
                        pointerEvents: "none",
                        // opacity는 useEffect에서 제어
                        opacity: 1, 
                    }}
                />
            ))}
        </div>
    );
};

export default ParallaxEffects;