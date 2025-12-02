import React, { useState, useEffect, useRef, useCallback } from "react";
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
    const [showOverlay, setShowOverlay] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    
    const containerRef = useRef(null);
    const scrollTimeoutRef = useRef(null);
    const rafIdRef = useRef(null);
    const isSnapingRef = useRef(false);
    const lastScrollTimeRef = useRef(Date.now());
    const lastScrollTopRef = useRef(0);

    // 🥬 식재료 가격 데이터
    const priceData = [
        { id: 1, name: "배추", price: "2,850원", change: 12.5, unit: "1포기" },
        { id: 2, name: "무", price: "1,200원", change: -8.3, unit: "1개" },
        { id: 3, name: "대파", price: "3,500원", change: 5.2, unit: "1kg" },
        { id: 4, name: "양파", price: "1,800원", change: -3.1, unit: "1kg" },
        { id: 5, name: "감자", price: "2,400원", change: 15.8, unit: "1kg" },
        { id: 6, name: "당근", price: "2,100원", change: -5.6, unit: "1kg" },
        { id: 7, name: "사과", price: "4,500원", change: 8.9, unit: "1개" },
        { id: 8, name: "배", price: "3,800원", change: -2.4, unit: "1개" },
    ];

    // 검색 필터링
    const filteredPriceData = priceData.filter(item =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const sections = [
        {
        id: 1,
        title: "Focus on Meal",
        subtitle: "메인에 들어가는 내용 왼쪽 상단에 들어갈 예정",
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

    /* 🎯 자동 스냅 함수 */
    const snapToSection = useCallback((targetSection) => {
        if (isSnapingRef.current) return;
        
        const container = containerRef.current;
        if (!container) return;

        isSnapingRef.current = true;
        
        // 페이지 전환 시 오버레이 표시
        if (targetSection > 0 && currentSection === 0) {
        setShowOverlay(true);
        setTimeout(() => setShowOverlay(false), 600);
        }
        
        let targetScroll = 0;
        for (let i = 0; i < targetSection; i++) {
        targetScroll += window.innerHeight * sections[i].height;
        }
        
        container.scrollTo({
        top: targetScroll,
        behavior: "smooth",
        });

        setTimeout(() => {
        isSnapingRef.current = false;
        }, 800);
    }, [sections, currentSection]);

    /* 📌 스크롤 핸들러 (최적화) */
    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        let ticking = false;

        const updateScroll = () => {
        const scrollTop = container.scrollTop;
        const scrollDelta = scrollTop - lastScrollTopRef.current;
        lastScrollTopRef.current = scrollTop;
        
        // 전체 높이 계산
        let totalHeight = 0;
        sections.forEach(section => {
            totalHeight += container.clientHeight * section.height;
        });
        const scrollHeight = totalHeight - container.clientHeight;

        setScrollProgress((scrollTop / scrollHeight) * 100);

        // 현재 섹션 계산
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

        // 🌿 수풀 확대 체크 - 자동 이동
        if (currentSec === 0) {
            const sectionHeight = container.clientHeight * sections[0].height;
            const localScroll = scrollTop;
            const scale = 1 + (localScroll / sectionHeight) * 1.0;
            
            if (scale >= 1.85 && !isSnapingRef.current) {
            snapToSection(1);
            }
        }

        // 🔙 2페이지에서 위로 스크롤 시 1페이지 맨 위로
        if (currentSec === 1 && scrollDelta < 0 && !isSnapingRef.current) {
            const section1Start = container.clientHeight * sections[0].height;
            const distanceFromSection1 = Math.abs(scrollTop - section1Start);
            
            if (distanceFromSection1 < 50) {
            snapToSection(0);
            }
        }

        // 자동 스냅 로직 (민감도 개선)
        const now = Date.now();
        if (now - lastScrollTimeRef.current > 100 && !isSnapingRef.current) {
            let accHeight = 0;
            for (let i = 0; i < sections.length; i++) {
            const sectionHeight = container.clientHeight * sections[i].height;
            const sectionMiddle = accHeight + sectionHeight / 2;
            
            // 섹션 경계 근처에서 스냅 (민감도 향상)
            if (Math.abs(scrollTop - accHeight) < sectionHeight * 0.15) {
                if (currentSec === i && scrollDelta > 0) {
                snapToSection(i);
                }
                break;
            }
            
            // 섹션 끝 근처에서 다음 섹션으로 스냅
            if (Math.abs(scrollTop - (accHeight + sectionHeight)) < sectionHeight * 0.15) {
                if (currentSec === i && scrollDelta > 0) {
                snapToSection(i + 1);
                }
                break;
            }
            
            accHeight += sectionHeight;
            }
        }

        ticking = false;
        };

        const handleScroll = () => {
        lastScrollTimeRef.current = Date.now();
        
        if (!ticking) {
            rafIdRef.current = requestAnimationFrame(updateScroll);
            ticking = true;
        }
        };

        container.addEventListener("scroll", handleScroll, { passive: true });

        return () => {
        container.removeEventListener("scroll", handleScroll);
        if (rafIdRef.current) {
            cancelAnimationFrame(rafIdRef.current);
        }
        };
    }, [sections, snapToSection]);

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
        zIndex: "999999",
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

    /* 🖼️ 1번째 섹션 패럴랙스 계산 - GPU 가속 */
    const getParallaxTransform = useCallback((speed, initialOffset = 0, shouldScale = false) => {
        const container = containerRef.current;
        if (!container) return {};

        const sectionTop = 0;
        const sectionHeight = container.clientHeight * sections[0].height;
        const localScroll = container.scrollTop - sectionTop;

        if (localScroll < 0) {
        return { 
            transform: shouldScale 
            ? `translate3d(0, ${initialOffset}px, 0) scale(1)` 
            : `translate3d(0, ${initialOffset}px, 0)`,
            willChange: "transform",
        };
        }

        if (localScroll > sectionHeight) {
        return { 
            transform: shouldScale
            ? `translate3d(0, ${-sectionHeight * speed + initialOffset}px, 0) scale(2)`
            : `translate3d(0, ${-sectionHeight * speed + initialOffset}px, 0)`,
            willChange: "transform",
        };
        }

        const translateY = -localScroll * speed + initialOffset;
        
        if (shouldScale) {
        const scale = 1 + (localScroll / sectionHeight) * 1.0;
        return { 
            transform: `translate3d(0, ${translateY}px, 0) scale(${scale})`,
            willChange: "transform",
        };
        }
        
        return { 
        transform: `translate3d(0, ${translateY}px, 0)`,
        willChange: "transform",
        };
    }, [sections]);

    return (
        <>
        <style>
            {`
            body, html {
                cursor: none !important;
                margin: 0;
                padding: 0;
                overflow: hidden;
            }

            * {
                box-sizing: border-box;
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
                scrollBehavior: "auto",
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
                {/* 🌿 첫 화면 나뭇잎 */}
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
                        willChange: "transform, opacity",
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
                    <h1 style={{ fontSize: "40px", marginBottom: "20px" }}>{section.title}</h1>
                    <p style={{ fontSize: "16px" }}>{section.subtitle}</p>
                    </div>
                )}

                {/* ⭐ 1번째 페이지 패럴랙스 이미지 */}
                {index === 0 && section.hasParallax && (
                    <>
                    {/* 🎨 배경 하단 진한 초록색 레이어 */}
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

                    {/* ☁ 구름 */}
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
                        zIndex: 1,
                        }}
                    />

                    {/* 🏔 산 */}
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
                        zIndex: 2,
                        }}
                    />

                    {/* 🌾 밀밭 */}
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
                        zIndex: 3,
                        }}
                    />

                    {/* 🌱 잔디 */}
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
                        zIndex: 4,
                        }}
                    />

                    {/* 🌿 수풀 - 확대 효과 */}
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
                        width: "90%",
                        maxWidth: "1400px",
                        zIndex: 10,
                    }}
                    >
                    {/* 타이틀 */}
                    <h1 style={{ 
                        fontSize: "42px", 
                        color: "white", 
                        textAlign: "center",
                        marginBottom: "15px",
                        fontWeight: "bold",
                    }}>
                        🥬 오늘의 식재료 가격
                    </h1>
                    <p style={{ 
                        fontSize: "16px", 
                        color: "rgba(255,255,255,0.9)", 
                        textAlign: "center",
                        marginBottom: "30px" 
                    }}>
                        실시간 농산물 가격 정보를 확인하세요
                    </p>

                    {/* 검색바 */}
                    <div style={{
                        display: "flex",
                        justifyContent: "center",
                        marginBottom: "30px",
                    }}>
                        <div style={{
                        position: "relative",
                        width: "100%",
                        maxWidth: "500px",
                        }}>
                        <input
                            type="text"
                            placeholder="식재료 검색 (예: 배추, 무, 대파)"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            style={{
                            width: "100%",
                            padding: "15px 50px 15px 20px",
                            fontSize: "16px",
                            border: "none",
                            borderRadius: "30px",
                            outline: "none",
                            boxShadow: "0 4px 15px rgba(0,0,0,0.2)",
                            }}
                        />
                        <span style={{
                            position: "absolute",
                            right: "20px",
                            top: "50%",
                            transform: "translateY(-50%)",
                            fontSize: "20px",
                            pointerEvents: "none",
                        }}>
                            🔍
                        </span>
                        </div>
                    </div>

                    {/* 가격 정보 카드들 - 가로로 길게 */}
                    <div style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "15px",
                        marginBottom: "25px",
                    }}>
                        {filteredPriceData.slice(0, 5).map((item, idx) => (
                        <div
                            key={item.id}
                            style={{
                            background: "white",
                            borderRadius: "15px",
                            padding: "20px 30px",
                            boxShadow: "0 4px 15px rgba(0,0,0,0.15)",
                            animation: `slideUp 0.5s ease-out ${idx * 0.1}s both`,
                            transition: "transform 0.3s ease, box-shadow 0.3s ease",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            }}
                            onMouseEnter={(e) => {
                            e.currentTarget.style.transform = "translateX(5px)";
                            e.currentTarget.style.boxShadow = "0 8px 25px rgba(0,0,0,0.25)";
                            }}
                            onMouseLeave={(e) => {
                            e.currentTarget.style.transform = "translateX(0)";
                            e.currentTarget.style.boxShadow = "0 4px 15px rgba(0,0,0,0.15)";
                            }}
                        >
                            {/* 왼쪽: 식재료 정보 */}
                            <div style={{ display: "flex", alignItems: "center", gap: "20px", flex: 1 }}>
                            <div style={{
                                fontSize: "28px",
                                fontWeight: "bold",
                                color: "#67932A",
                                minWidth: "80px",
                            }}>
                                {item.name}
                            </div>
                            <div style={{
                                fontSize: "14px",
                                color: "#999",
                                padding: "4px 12px",
                                background: "#f5f5f5",
                                borderRadius: "20px",
                            }}>
                                {item.unit}
                            </div>
                            </div>

                            {/* 중앙: 가격 */}
                            <div style={{
                            fontSize: "32px",
                            fontWeight: "bold",
                            color: "#333",
                            minWidth: "150px",
                            textAlign: "center",
                            }}>
                            {item.price}
                            </div>

                            {/* 오른쪽: 변동률 */}
                            <div style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                            minWidth: "150px",
                            justifyContent: "flex-end",
                            }}>
                            <span style={{
                                fontSize: "24px",
                                fontWeight: "bold",
                                color: item.change > 0 ? "#d32f2f" : "#1976d2",
                            }}>
                                {item.change > 0 ? "▲" : "▼"}
                            </span>
                            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
                                <span style={{
                                fontSize: "20px",
                                fontWeight: "bold",
                                color: item.change > 0 ? "#d32f2f" : "#1976d2",
                                }}>
                                {item.change > 0 ? "+" : ""}{item.change}%
                                </span>
                                <span style={{
                                fontSize: "12px",
                                color: "#999",
                                }}>
                                전주 대비
                                </span>
                            </div>
                            </div>
                        </div>
                        ))}
                    </div>

                    {/* 더보기 버튼 */}
                    <div style={{
                        display: "flex",
                        justifyContent: "center",
                    }}>
                        <button
                        onClick={() => {
                            // 식재료 페이지로 이동하는 로직
                            // window.location.href = "/ingredients"; // 실제 경로로 변경
                            alert("식재료 페이지로 이동합니다!");
                        }}
                        style={{
                            padding: "15px 40px",
                            fontSize: "16px",
                            fontWeight: "bold",
                            color: "white",
                            background: "linear-gradient(135deg, #67932A 0%, #99A237 100%)",
                            border: "none",
                            borderRadius: "30px",
                            cursor: "pointer",
                            boxShadow: "0 4px 15px rgba(0,0,0,0.2)",
                            transition: "all 0.3s ease",
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.transform = "scale(1.05)";
                            e.currentTarget.style.boxShadow = "0 6px 20px rgba(0,0,0,0.3)";
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.transform = "scale(1)";
                            e.currentTarget.style.boxShadow = "0 4px 15px rgba(0,0,0,0.2)";
                        }}
                        >
                        더 많은 식재료 보기 →
                        </button>
                    </div>

                    {/* 검색 결과 없음 메시지 */}
                    {searchQuery && filteredPriceData.length === 0 && (
                        <div style={{
                        textAlign: "center",
                        color: "white",
                        fontSize: "18px",
                        padding: "40px",
                        background: "rgba(255,255,255,0.1)",
                        borderRadius: "15px",
                        }}>
                        🔍 "{searchQuery}"에 대한 검색 결과가 없습니다.
                        </div>
                    )}
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
            
            <Footer />
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
                onClick={() => snapToSection(index)}
                />
            ))}
            </div>
        </div>
        </>
    );
    };

export default ParallaxPage;