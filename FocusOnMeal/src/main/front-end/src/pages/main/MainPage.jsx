import React, { useState, useEffect, useRef } from "react";
import Footer from "../../components/common/Footer.jsx";

import cloudImg from "../../assets/parallax/cloud.png";
import mountainImg from "../../assets/parallax/mountain.png";
import cornImg from "../../assets/parallax/cornfield.png";
import grassImg from "../../assets/parallax/grass.png";
import bushImg from "../../assets/parallax/bush.png";

const ParallaxPage = () => {
    const [hoveredBox, setHoveredBox] = useState(null);
    const [scrollProgress, setScrollProgress] = useState(0);
    const [currentSection, setCurrentSection] = useState(0);
    const [staticLeaves, setStaticLeaves] = useState([]);
    const [cursorParticles, setCursorParticles] = useState([]);
    const containerRef = useRef(null);
    const scrollTimeoutRef = useRef(null);

    /* 💚 첫 장 정적 나뭇잎 */
    useEffect(() => {
        const leafColors = ['#F1F7AD', '#B6BE5C', '#99A237'];

        const createStaticLeaves = () => {
        const leafCount = Math.floor(Math.random() * 4) + 4;
        const newLeaves = Array.from({ length: leafCount }, (_, i) => ({
            id: Date.now() + i,
            left: Math.random() * 25,
            top: 10 + Math.random() * 40,
            duration: 5 + Math.random() * 3,
            size: 6 + Math.random() * 4,
            rotation: -15 + Math.random() * 30,
            delay: i * 0.25,
            color: leafColors[Math.floor(Math.random() * leafColors.length)],
        }));
        setStaticLeaves(newLeaves);
        };

        if (currentSection === 0) {
        createStaticLeaves();
        const interval = setInterval(createStaticLeaves, 8000);
        return () => clearInterval(interval);
        }
    }, [currentSection]);

    /* 📌 스크롤 핸들러 */
    useEffect(() => {
        const handleScroll = () => {
        const container = containerRef.current;
        if (!container) return;

        const scrollTop = container.scrollTop;
        
        // 전체 높이 계산 (각 섹션의 height 반영)
        let totalHeight = 0;
        sections.forEach(section => {
            totalHeight += container.clientHeight * section.height;
        });
        const scrollHeight = totalHeight - container.clientHeight;

        setScrollProgress((scrollTop / scrollHeight) * 100);
        
        // 현재 섹션 계산 (height 반영)
        let accumulatedHeight = 0;
        let currentSec = 0;
        for (let i = 0; i < sections.length; i++) {
            const sectionHeight = container.clientHeight * sections[i].height;
            if (scrollTop < accumulatedHeight + sectionHeight) {
            currentSec = i;
            break;
            }
            accumulatedHeight += sectionHeight;
        }
        setCurrentSection(currentSec);

        // 🌿 수풀 확대 체크 - 일정 스케일 이상이면 자동으로 2페이지로 이동
        if (currentSec === 0) {
            const sectionHeight = container.clientHeight * sections[0].height;
            const localScroll = scrollTop;
            const scale = 1 + (localScroll / sectionHeight) * 1.0;
            
            // 수풀 스케일이 1.85 이상이면 자동으로 2페이지로 이동
            if (scale >= 1.85) {
            const targetScroll = container.clientHeight * sections[0].height;
            container.scrollTo({
                top: targetScroll,
                behavior: "smooth",
            });
            }
        }

        if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
        scrollTimeoutRef.current = setTimeout(() => {}, 150);
        };

        const c = containerRef.current;
        if (c) c.addEventListener("scroll", handleScroll, { passive: true });

        return () => c?.removeEventListener("scroll", handleScroll);
    }, []);

    /* 🥕 커스텀 당근 커서 */
    useEffect(() => {
        const carrotCursor = document.createElement("div");
        carrotCursor.id = "carrot-cursor";
        carrotCursor.innerText = "🥕";
        document.body.appendChild(carrotCursor);

        Object.assign(carrotCursor.style, {
        position: "fixed",
        left: "0px",
        top: "0px",
        fontSize: "34px",
        pointerEvents: "none",
        zIndex: 999999,
        userSelect: "none",
        transform: "translate(-70%, -40%) rotate(95deg)",
        });

        const moveCursor = (e) => {
        carrotCursor.style.left = `${e.clientX}px`;
        carrotCursor.style.top = `${e.clientY}px`;
        };

        window.addEventListener("mousemove", moveCursor);

        return () => {
        window.removeEventListener("mousemove", moveCursor);
        carrotCursor.remove();
        };
    }, []);

    /* ✨ 커서 파티클 */
    useEffect(() => {
        let lastSpawn = 0;

        const handleMove = (e) => {
        const now = Date.now();
        if (now - lastSpawn < 40) return;
        lastSpawn = now;

        const newParticle = {
            id: now + Math.random(),
            x: e.clientX,
            y: e.clientY,
            size: 6 + Math.random() * 10,
            lifespan: 700 + Math.random() * 400,
        };

        setCursorParticles((prev) => [...prev.slice(-20), newParticle]);

        setTimeout(() => {
            setCursorParticles((prev) =>
            prev.filter((p) => p.id !== newParticle.id)
            );
        }, newParticle.lifespan);
        };

        window.addEventListener("pointermove", handleMove);
        return () => window.removeEventListener("pointermove", handleMove);
    }, []);

    /* 🌈 섹션 데이터 */
    const sections = [
        {
        id: 1,
        title: "Focus on Meal",
        subtitle: "메인에 들어가는 내용 왼쪽 상단에 들어갈 예정 제목이랑 내용 크기 줄일 것.",
        bgColor: "linear-gradient(180deg, #38A7DF 0%, #6AB9E2 100%)",
        height: 1.8,
        hasParallax: true,
        },
        { 
        id: 2, 
        bgColor: "linear-gradient(180deg, #67932A 0%, #99A237 100%)", 
        height: 1,
        hasParallax: false,
        },
        { 
        id: 3, 
        bgColor: "linear-gradient(180deg, #99A237 0%, #B6BE5C 100%)", 
        height: 1.4,
        hasParallax: false,
        },
    ];

    /* 🖼️ 1번째 섹션 패럴랙스 계산 - 아래에서 위로 올라오기 */
    const getParallaxTransform = (speed, initialOffset = 0, shouldScale = false) => {
        const container = containerRef.current;
        if (!container) return {};

        const sectionTop = 0;
        const sectionHeight = container.clientHeight * sections[0].height;
        const localScroll = container.scrollTop - sectionTop;

        if (localScroll < 0) {
        return { 
            transform: shouldScale 
            ? `translateY(${initialOffset}px) scale(1)` 
            : `translateY(${initialOffset}px)` 
        };
        }

        if (localScroll > sectionHeight) {
        return { 
            transform: shouldScale
            ? `translateY(${-sectionHeight * speed + initialOffset}px) scale(2)`
            : `translateY(${-sectionHeight * speed + initialOffset}px)` 
        };
        }

        const translateY = -localScroll * speed + initialOffset;
        
        if (shouldScale) {
        const scale = 1 + (localScroll / sectionHeight) * 1.0;
        return { transform: `translateY(${translateY}px) scale(${scale})` };
        }
        
        return { transform: `translateY(${translateY}px)` };
    };

    return (
        <>
        <style>
            {`
            body, html {
                cursor: none !important;
            }

            @keyframes cursorFade {
                0% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
                100% { opacity: 0; transform: translate(-50%, -50%) scale(0.4); }
            }

            @keyframes flyLeafSlow {
                0% { opacity: 0; left: -10%; top: var(--start-top); }
                10% { opacity: 1; }
                100% {
                opacity: 0;
                left: 110%;
                top: calc(var(--start-top) + 40vh);
                }
            }

            @keyframes shake {
                0%, 100% { transform: translate(0, 0) rotate(0deg); }
                10% { transform: translate(-2px, -2px) rotate(-1deg); }
                20% { transform: translate(2px, 2px) rotate(1deg); }
                30% { transform: translate(-2px, 2px) rotate(-1deg); }
                40% { transform: translate(2px, -2px) rotate(1deg); }
                50% { transform: translate(-2px, -2px) rotate(-1deg); }
                60% { transform: translate(2px, 2px) rotate(1deg); }
                70% { transform: translate(-2px, 2px) rotate(-1deg); }
                80% { transform: translate(2px, -2px) rotate(1deg); }
                90% { transform: translate(-2px, -2px) rotate(-1deg); }
            }

            @keyframes chatPopup {
                0% { opacity: 0; transform: translateY(10px) scale(0.9); }
                100% { opacity: 1; transform: translateY(0) scale(1); }
            }

            @keyframes sirenRotate {
                0%, 100% { transform: rotate(-10deg); }
                50% { transform: rotate(10deg); }
            }

            ::-webkit-scrollbar { display: none; }
            `}
        </style>

        {/* ✨ 커서 파티클 */}
        {cursorParticles.map((p) => (
            <div
            key={p.id}
            style={{
                position: "fixed",
                left: p.x,
                top: p.y,
                width: p.size,
                height: p.size,
                background: "rgba(255,255,255,0.9)",
                borderRadius: "50%",
                transform: "translate(-50%, -50%)",
                filter: "blur(2px)",
                pointerEvents: "none",
                animation: `cursorFade ${p.lifespan}ms ease-out forwards`,
                zIndex: 9999,
            }}
            />
        ))}

        {/* 전체 레이아웃 컨테이너 */}
        <div style={{ width: "100vw", height: "100vh", position: "relative", overflow: "hidden" }}>
            <div
            ref={containerRef}
            style={{
                width: "100%",
                height: "100vh",
                overflowY: "scroll",
                scrollSnapType: "y proximity",
                scrollBehavior: "smooth",
            }}
            >
            {sections.map((section, index) => (
                <div
                key={section.id}
                style={{
                    width: "100%",
                    height: `${section.height * 100}vh`,
                    scrollSnapAlign: "start",
                    background: section.bgColor,
                    position: "relative",
                    overflow: "hidden",
                }}
                >
                {/* 🌿 첫 화면 나뭇잎 (1페이지에서만 보임) */}
                {index === 0 && staticLeaves.map((leaf) => (
                    <div
                    key={leaf.id}
                    style={{
                        position: "absolute",
                        left: `${leaf.left}%`,
                        top: `${leaf.top}%`,
                        width: `${leaf.size * 2}px`,
                        height: `${leaf.size}px`,
                        '--start-top': `${leaf.top}%`,
                        background: leaf.color,
                        borderRadius: "50%",
                        transform: `rotate(${leaf.rotation}deg)`,
                        animation: `flyLeafSlow ${leaf.duration}s ease-in-out forwards`,
                        animationDelay: `${leaf.delay}s`,
                        pointerEvents: "none",
                        zIndex: 500,
                    }}
                    />
                ))}

                {/* 첫 화면 텍스트 */}
                {index === 0 && (
                    <div
                    style={{
                        position: "absolute",
                        top: "20%",
                        left: "10%",
                        textAlign: "left",
                        color: "white",
                        zIndex: 10,
                    }}
                    >
                    <h1 style={{ fontSize: "64px", marginBottom: "20px" }}>{section.title}</h1>
                    <p style={{ fontSize: "28px" }}>{section.subtitle}</p>
                    </div>
                )}

                {/* ⭐ 1번째 페이지 패럴랙스 이미지 - 아래에서 위로 올라오기 */}
                {index === 0 && section.hasParallax && (
                    <>
                    {/* 🎨 배경 하단 진한 초록색 레이어 (맨 뒤) */}
                    <div
                        style={{
                        position: "absolute",
                        bottom: "0",
                        left: "0",
                        width: "100%",
                        height: "45%",
                        background: "linear-gradient(180deg, transparent 0%, #0A3A2B 50%, #1a2e12 100%)",
                        zIndex: 0,
                        }}
                    />

                    {/* ☁ 구름 - 가장 느리게 + 높이 배치 (뒤쪽) */}
                    <img
                        src={cloudImg}
                        alt="cloud"
                        style={{
                        position: "absolute",
                        top: "-5%",
                        left: "0",
                        width: "100%",
                        height: "auto",
                        minHeight: "120vh",
                        objectFit: "cover",
                        ...getParallaxTransform(0.2, 100, false),
                        transition: "transform 0.1s linear",
                        zIndex: 1,
                        }}
                    />

                    {/* 🏔 산 - 구름과 같은 위치 */}
                    <img
                        src={mountainImg}
                        alt="mountain"
                        style={{
                        position: "absolute",
                        top: "-3%",
                        left: "0",
                        width: "100%",
                        height: "auto",
                        minHeight: "120vh",
                        objectFit: "cover",
                        ...getParallaxTransform(0.45, 250, false),
                        transition: "transform 0.1s linear",
                        zIndex: 2,
                        }}
                    />

                    {/* 🌾 밀밭 - 구름과 같은 위치 */}
                    <img
                        src={cornImg}
                        alt="cornfield"
                        style={{
                        position: "absolute",
                        top: "-3%",
                        left: "0",
                        width: "100%",
                        height: "auto",
                        minHeight: "120vh",
                        objectFit: "cover",
                        ...getParallaxTransform(0.65, 350, false),
                        transition: "transform 0.1s linear",
                        zIndex: 3,
                        }}
                    />

                    {/* 🌱 잔디 - 구름과 같은 위치 */}
                    <img
                        src={grassImg}
                        alt="grass"
                        style={{
                        position: "absolute",
                        top: "-3%",
                        left: "0",
                        width: "100%",
                        height: "auto",
                        minHeight: "120vh",
                        objectFit: "cover",
                        ...getParallaxTransform(0.85, 450, false),
                        transition: "transform 0.1s linear",
                        zIndex: 4,
                        }}
                    />

                    {/* 🌿 수풀 - 맨 아래 배치 + 확대 효과 (맨 앞) */}
                    <img
                        src={bushImg}
                        alt="bush"
                        style={{
                        position: "absolute",
                        bottom: "0",
                        left: "0",
                        width: "100%",
                        height: "auto",
                        minHeight: "100vh",
                        objectFit: "cover",
                        transformOrigin: "center bottom",
                        ...getParallaxTransform(1.0, 550, true),
                        transition: "transform 0.1s linear",
                        zIndex: 5,
                        }}
                    />
                    </>
                )}

                {/* 2페이지 콘텐츠 */}
                {index === 1 && (
                    <div
                    style={{
                        position: "absolute",
                        top: "50%",
                        left: "50%",
                        transform: "translate(-50%, -50%)",
                        textAlign: "center",
                        color: "white",
                        zIndex: 10,
                    }}
                    >
                    <h1 style={{ fontSize: "48px" }}>2페이지</h1>
                    <p style={{ fontSize: "24px" }}>여기에 내용을 추가하세요</p>
                    </div>
                )}

                {/* 3페이지 콘텐츠 */}
                {index === 2 && (
                    <div
                    style={{
                        position: "absolute",
                        top: "50%",
                        left: "50%",
                        transform: "translate(-50%, -50%)",
                        width: "90%",
                        maxWidth: "1200px",
                        display: "flex",
                        gap: "40px",
                        zIndex: 10,
                    }}
                    >
                    {/* 위해 식품 정보 박스 */}
                    <div
                        onMouseEnter={() => setHoveredBox('warning')}
                        onMouseLeave={() => setHoveredBox(null)}
                        style={{
                        flex: 1,
                        background: "rgba(255, 255, 255, 0.95)",
                        borderRadius: "20px",
                        padding: "40px",
                        position: "relative",
                        cursor: "pointer",
                        animation: hoveredBox === 'warning' ? 'shake 0.5s ease-in-out infinite' : 'none',
                        boxShadow: hoveredBox === 'warning' 
                            ? "0 20px 60px rgba(255, 0, 0, 0.3)" 
                            : "0 10px 30px rgba(0, 0, 0, 0.1)",
                        transition: "box-shadow 0.3s ease",
                        }}
                    >
                        {/* 사이렌 아이콘 */}
                        <div
                        style={{
                            position: "absolute",
                            top: "-30px",
                            left: "50%",
                            transform: "translateX(-50%)",
                            fontSize: "60px",
                            animation: hoveredBox === 'warning' ? 'sirenRotate 0.5s ease-in-out infinite' : 'none',
                        }}
                        >
                        🚨
                        </div>

                        <h2
                        style={{
                            fontSize: "32px",
                            fontWeight: "bold",
                            color: "#d32f2f",
                            marginTop: "40px",
                            marginBottom: "20px",
                            textAlign: "center",
                        }}
                        >
                        위해 식품 정보
                        </h2>

                        <p
                        style={{
                            fontSize: "18px",
                            color: "#666",
                            textAlign: "center",
                            lineHeight: "1.6",
                        }}
                        >
                        최신 위해 식품 정보를 확인하고<br />
                        안전한 식생활을 유지하세요
                        </p>

                        <div
                        style={{
                            marginTop: "30px",
                            padding: "20px",
                            background: "#fff3f3",
                            borderRadius: "10px",
                            border: "2px solid #ffcdd2",
                        }}
                        >
                        <p style={{ fontSize: "16px", color: "#d32f2f", margin: 0 }}>
                            ⚠️ 주의사항을 확인하세요
                        </p>
                        </div>
                    </div>

                    {/* 공지사항 박스 */}
                    <div
                        onMouseEnter={() => setHoveredBox('notice')}
                        onMouseLeave={() => setHoveredBox(null)}
                        style={{
                        flex: 1,
                        background: "rgba(255, 255, 255, 0.95)",
                        borderRadius: "20px",
                        padding: "40px",
                        position: "relative",
                        cursor: "pointer",
                        boxShadow: hoveredBox === 'notice' 
                            ? "0 20px 60px rgba(103, 147, 42, 0.3)" 
                            : "0 10px 30px rgba(0, 0, 0, 0.1)",
                        transition: "all 0.3s ease",
                        }}
                    >
                        {/* 채팅 아이콘 */}
                        <div
                        style={{
                            position: "absolute",
                            top: "-30px",
                            left: "50%",
                            transform: "translateX(-50%)",
                            fontSize: "60px",
                        }}
                        >
                        📢
                        </div>

                        <h2
                        style={{
                            fontSize: "32px",
                            fontWeight: "bold",
                            color: "#67932A",
                            marginTop: "40px",
                            marginBottom: "20px",
                            textAlign: "center",
                        }}
                        >
                        공지사항
                        </h2>

                        <p
                        style={{
                            fontSize: "18px",
                            color: "#666",
                            textAlign: "center",
                            lineHeight: "1.6",
                        }}
                        >
                        새로운 소식과 업데이트를<br />
                        확인해보세요
                        </p>

                        {/* 호버 시 나타나는 채팅 메시지들 */}
                        {hoveredBox === 'notice' && (
                        <div style={{ marginTop: "30px", position: "relative" }}>
                            <div
                            style={{
                                background: "#f1f7ad",
                                padding: "15px 20px",
                                borderRadius: "15px 15px 15px 0",
                                marginBottom: "10px",
                                animation: "chatPopup 0.3s ease-out",
                                animationDelay: "0s",
                                boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
                            }}
                            >
                            <p style={{ margin: 0, fontSize: "14px", color: "#333" }}>
                                🎉 새로운 기능이 추가되었습니다!
                            </p>
                            </div>

                            <div
                            style={{
                                background: "#b6be5c",
                                padding: "15px 20px",
                                borderRadius: "15px 15px 15px 0",
                                marginBottom: "10px",
                                animation: "chatPopup 0.3s ease-out",
                                animationDelay: "0.1s",
                                boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
                            }}
                            >
                            <p style={{ margin: 0, fontSize: "14px", color: "#fff" }}>
                                📢 정기 점검 안내: 매주 월요일 02:00-04:00
                            </p>
                            </div>

                            <div
                            style={{
                                background: "#99a237",
                                padding: "15px 20px",
                                borderRadius: "15px 15px 15px 0",
                                animation: "chatPopup 0.3s ease-out",
                                animationDelay: "0.2s",
                                boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
                            }}
                            >
                            <p style={{ margin: 0, fontSize: "14px", color: "#fff" }}>
                                ✨ 더 많은 정보를 확인하세요
                            </p>
                            </div>
                        </div>
                        )}
                    </div>
                    </div>
                )}
                </div>
            ))}
            
            {/* 🔽 Footer - 3페이지 바로 다음에 자연스럽게 배치 */}
            <Footer/>
            </div>

            {/* 🔘 스크롤 인디케이터 */}
            <div
            style={{
                position: "fixed",
                right: "30px",
                top: "50%",
                transform: "translateY(-50%)",
                zIndex: 2000,
            }}
            >
            {sections.map((_, index) => (
                <div
                key={index}
                style={{
                    width: "12px",
                    height: "12px",
                    margin: "10px 0",
                    borderRadius: "50%",
                    background:
                    currentSection === index
                        ? "white"
                        : "rgba(255,255,255,0.3)",
                    cursor: "pointer",
                    transition: "0.3s",
                }}
                onClick={() => {
                    let targetScroll = 0;
                    for (let i = 0; i < index; i++) {
                    targetScroll += window.innerHeight * sections[i].height;
                    }
                    
                    containerRef.current.scrollTo({
                    top: targetScroll,
                    behavior: "smooth",
                    });
                }}
                />
            ))}
            </div>
        </div>
        </>
    );
};

export default ParallaxPage;