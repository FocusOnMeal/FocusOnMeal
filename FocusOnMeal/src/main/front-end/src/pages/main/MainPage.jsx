import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Footer from "../../components/common/Footer.jsx";

import cloudImg from "../../assets/parallax/cloudzip.png";
import mountainImg from "../../assets/parallax/mountainzip.png";
import cornImg from "../../assets/parallax/cornfieldzip.png";
import grassImg from "../../assets/parallax/grasszip.png";
import bushImg from "../../assets/parallax/bushzip.png";

const ParallaxPage = () => {
    const navigate = useNavigate();
    const [hoveredBox, setHoveredBox] = useState(null);
    const [currentSection, setCurrentSection] = useState(0);
    const [staticLeaves, setStaticLeaves] = useState([]);
    const [cursorParticles, setCursorParticles] = useState([]);
    const [isTransitioning, setIsTransitioning] = useState(false);
    const [ingredientList, setIngredientList] = useState([]);

    const containerRef = useRef(null);
    const scrollTimeoutRef = useRef(null);
    const rafIdRef = useRef(null);
    const isSnapingRef = useRef(false);
    const lastScrollTimeRef = useRef(Date.now());
    const lastScrollTopRef = useRef(0);
    const wheelTimeoutRef = useRef(null);

    // 🥬 식재료 가격 데이터 API 호출
    useEffect(() => {
        const fetchIngredients = async () => {
            try {
                const response = await axios.get("/ingredient/api/list");
                // 변동폭(절대값) 기준 내림차순 정렬 후 상위 5개
                const sorted = response.data
                    .filter(item => item.priceChangePercent !== null && item.priceChangePercent !== undefined)
                    .sort((a, b) => Math.abs(b.priceChangePercent) - Math.abs(a.priceChangePercent))
                    .slice(0, 5);
                setIngredientList(sorted);
            } catch (error) {
                console.error("식재료 목록 조회 실패:", error);
            }
        };
        fetchIngredients();
    }, []);

    const sections = [
        {
        id: 1,
        title: "Focus on Meal",
        subtitle: "예산은 가볍게, 식단은 완벽하게 AI로 완성하는 <br> 스마트한 식생활 관리 솔루션, FOM",
        bgColor: "linear-gradient(180deg, #38A7DF 0%, #6AB9E2 100%)",
        height: 1.5, // 패럴랙스 효과를 위한 여유 공간
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
        height: 1,
        hasParallax: false,
        },
    ];

    /* 💚 첫 장 정적 나뭇잎 - 성능 테스트를 위해 주석처리 */
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
        setIsTransitioning(true);

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
        setIsTransitioning(false);
        }, 1200);
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

        // 🌿 수풀 확대 체크 - 자동 이동 (더 빠르게)
        if (currentSec === 0 && !isSnapingRef.current) {
            const sectionHeight = container.clientHeight * sections[0].height;
            const localScroll = scrollTop;
            const scale = 1 + (localScroll / sectionHeight) * 1.0;
            
            // 스케일 1.7부터 자동 이동 (더 빠르게)
            if (scale >= 1.7) {
            snapToSection(1);
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

        // 🎯 휠 이벤트로 페이지 전환
        const handleWheel = (e) => {
        if (isSnapingRef.current || isTransitioning) return;

        const container = containerRef.current;
        if (!container) return;

        // 1페이지: 패럴랙스 효과를 위해 자연스럽게 스크롤 허용
        // 단, 일정 이상 스크롤되면 2페이지로 스냅
        if (currentSection === 0) {
            // 아래로 스크롤할 때만 체크
            if (e.deltaY > 0) {
            const scrollTop = container.scrollTop;
            const sectionHeight = container.clientHeight * sections[0].height;
            const scrollProgress = scrollTop / sectionHeight;

            // 30% 이상 스크롤되면 2페이지로 (풀숲 효과 후)
            if (scrollProgress > 0.3) {
                e.preventDefault();
                snapToSection(1);
            }
            }
            return; // 1페이지에서는 자연스러운 스크롤 허용
        }

        // 2페이지, 3페이지: 휠 시 바로 페이지 전환
        e.preventDefault();

        if (e.deltaY > 0) {
            // 아래로 스크롤 → 다음 페이지
            if (currentSection < sections.length - 1) {
            snapToSection(currentSection + 1);
            }
        } else {
            // 위로 스크롤 → 이전 페이지
            if (currentSection > 0) {
            snapToSection(currentSection - 1);
            }
        }
        };

        container.addEventListener("scroll", handleScroll, { passive: true });
        container.addEventListener("wheel", handleWheel, { passive: false });

        return () => {
        container.removeEventListener("scroll", handleScroll);
        container.removeEventListener("wheel", handleWheel);
        if (rafIdRef.current) {
            cancelAnimationFrame(rafIdRef.current);
        }
        };
    }, [sections, snapToSection, currentSection, isTransitioning]);

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

    /* ✨ 커서 파티클 - 성능 테스트를 위해 주석처리 */
    // useEffect(() => {
    //     let lastSpawn = 0;

    //     const handleMove = (e) => {
    //     const now = Date.now();
    //     if (now - lastSpawn < 150) return;
    //     lastSpawn = now;

    //     const newParticle = {
    //         id: now + Math.random(),
    //         x: e.clientX,
    //         y: e.clientY,
    //         size: 6 + Math.random() * 10,
    //         lifespan: 700 + Math.random() * 400,
    //     };

    //     setCursorParticles((prev) => [...prev.slice(-20), newParticle]);

    //     setTimeout(() => {
    //         setCursorParticles((prev) =>
    //         prev.filter((p) => p.id !== newParticle.id)
    //         );
    //     }, newParticle.lifespan);
    //     };

    //     window.addEventListener("pointermove", handleMove);
    //     return () => window.removeEventListener("pointermove", handleMove);
    // }, []);

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
            // willChange: "transform", // 성능 테스트를 위해 주석처리
        };
        }

        if (localScroll > sectionHeight) {
        return {
            transform: shouldScale
            ? `translate3d(0, ${-sectionHeight * speed + initialOffset}px, 0) scale(2)`
            : `translate3d(0, ${-sectionHeight * speed + initialOffset}px, 0)`,
            // willChange: "transform", // 성능 테스트를 위해 주석처리
        };
        }

        const translateY = -localScroll * speed + initialOffset;

        if (shouldScale) {
        const scale = 1 + (localScroll / sectionHeight) * 1.0;
        return {
            transform: `translate3d(0, ${translateY}px, 0) scale(${scale})`,
            // willChange: "transform", // 성능 테스트를 위해 주석처리
        };
        }

        return {
        transform: `translate3d(0, ${translateY}px, 0)`,
        // willChange: "transform", // 성능 테스트를 위해 주석처리
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
                        top: "30%",
                        left: "10%",
                        textAlign: "left",
                        color: "white",
                        zIndex: 10,
                    }}
                    >
                    <h1 style={{ fontSize: "40px", marginBottom: "20px" }}>{section.title}</h1>
                    <p 
                        style={{ fontSize: "20px" }} 
                        dangerouslySetInnerHTML={{ __html: section.subtitle }} 
                    />

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

                {/* 2페이지 콘텐츠 - 좌우 분할 */}
                {index === 1 && (
                    <div
                    style={{
                        position: "absolute",
                        top: "50%",
                        left: "50%",
                        transform: "translate(-50%, -50%)",
                        width: "90%",
                        maxWidth: "1400px",
                        display: "flex",
                        gap: "40px",
                        alignItems: "flex-start",
                        zIndex: 10,
                    }}
                    >
                    {/* 왼쪽: AI 식단 추천 홍보 */}
                    <div
                        onClick={() => navigate("/meal/mealAI")}
                        onMouseEnter={() => setHoveredBox('ai')}
                        onMouseLeave={() => setHoveredBox(null)}
                        style={{
                        flex: 1,
                        background: "rgba(255, 255, 255, 0.95)",
                        borderRadius: "20px",
                        padding: "40px",
                        position: "relative",
                        cursor: "pointer",
                        boxShadow: hoveredBox === 'ai'
                            ? "0 20px 60px rgba(103, 147, 42, 0.4)"
                            : "0 10px 30px rgba(0, 0, 0, 0.1)",
                        transition: "all 0.3s ease",
                        transform: hoveredBox === 'ai' ? "translateY(-5px)" : "translateY(0)",
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
                        🍽️
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
                        AI 식단 추천
                        </h2>

                        <p
                        style={{
                            fontSize: "18px",
                            color: "#666",
                            textAlign: "center",
                            lineHeight: "1.6",
                        }}
                        >
                        나만의 맞춤형 식단을<br />
                        AI가 추천해드립니다
                        </p>

                        <div
                        style={{
                            marginTop: "30px",
                            padding: "20px",
                            background: "#f1f7e6",
                            borderRadius: "10px",
                            border: "2px solid #c5d89d",
                        }}
                        >
                        <p style={{ fontSize: "16px", color: "#67932A", margin: 0, textAlign: "center" }}>
                            ✨ 클릭하여 시작하기
                        </p>
                        </div>

                        {hoveredBox === 'ai' && (
                        <div style={{ marginTop: "20px", position: "relative" }}>
                            <div
                            style={{
                                background: "#f1f7ad",
                                padding: "12px 16px",
                                borderRadius: "15px 15px 15px 0",
                                marginBottom: "8px",
                                animation: "chatPopup 0.3s ease-out",
                                boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
                            }}
                            >
                            <p style={{ margin: 0, fontSize: "13px", color: "#333" }}>
                                🥗 건강한 식단 추천받기
                            </p>
                            </div>
                            <div
                            style={{
                                background: "#b6be5c",
                                padding: "12px 16px",
                                borderRadius: "15px 15px 15px 0",
                                marginBottom: "8px",
                                animation: "chatPopup 0.3s ease-out",
                                animationDelay: "0.1s",
                                boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
                            }}
                            >
                            <p style={{ margin: 0, fontSize: "13px", color: "#fff" }}>
                                💰 예산에 맞는 식단 구성
                            </p>
                            </div>
                            <div
                            style={{
                                background: "#99a237",
                                padding: "12px 16px",
                                borderRadius: "15px 15px 15px 0",
                                animation: "chatPopup 0.3s ease-out",
                                animationDelay: "0.2s",
                                boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
                            }}
                            >
                            <p style={{ margin: 0, fontSize: "13px", color: "#fff" }}>
                                📊 영양 성분 자동 계산
                            </p>
                            </div>
                        </div>
                        )}
                    </div>

                    {/* 오른쪽: 오늘의 식재료 가격 */}
                    <div
                        onMouseEnter={() => setHoveredBox('price')}
                        onMouseLeave={() => setHoveredBox(null)}
                        style={{
                        flex: 1,
                        background: "rgba(255, 255, 255, 0.95)",
                        borderRadius: "20px",
                        padding: "40px",
                        position: "relative",
                        boxShadow: hoveredBox === 'price'
                            ? "0 20px 60px rgba(103, 147, 42, 0.4)"
                            : "0 10px 30px rgba(0, 0, 0, 0.1)",
                        transition: "all 0.3s ease",
                        transform: hoveredBox === 'price' ? "translateY(-5px)" : "translateY(0)",
                        display: "flex",
                        flexDirection: "column",
                        }}
                    >
                        {/* 이모티콘 */}
                        <div
                        style={{
                            position: "absolute",
                            top: "-30px",
                            left: "50%",
                            transform: "translateX(-50%)",
                            fontSize: "60px",
                        }}
                        >
                        📈
                        </div>

                        {/* 타이틀 */}
                        <h2 style={{
                        fontSize: "28px",
                        color: "#67932A",
                        textAlign: "center",
                        marginTop: "30px",
                        marginBottom: "20px",
                        fontWeight: "bold",
                        }}>
                        오늘의 식재료 가격
                        </h2>

                        {/* 가격 정보 카드들 */}
                        <div style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "10px",
                        flex: 1,
                        }}>
                        {ingredientList.map((item, idx) => (
                            <div
                            key={item.ingredientId}
                            onClick={() => navigate(`/ingredient/detail/${item.ingredientId}`)}
                            style={{
                                background: "#f1f7e6",
                                borderRadius: "12px",
                                padding: "14px 20px",
                                border: "1px solid #c5d89d",
                                transition: "transform 0.3s ease, box-shadow 0.3s ease",
                                cursor: "pointer",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.transform = "translateX(5px)";
                                e.currentTarget.style.boxShadow = "0 4px 15px rgba(103, 147, 42, 0.3)";
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform = "translateX(0)";
                                e.currentTarget.style.boxShadow = "none";
                            }}
                            >
                            {/* 왼쪽: 식재료 정보 */}
                            <div style={{ display: "flex", alignItems: "center", gap: "12px", flex: 1 }}>
                                <div style={{
                                fontSize: "18px",
                                fontWeight: "bold",
                                color: "#67932A",
                                minWidth: "60px",
                                }}>
                                {item.name}
                                </div>
                                <div style={{
                                fontSize: "11px",
                                color: "#67932A",
                                padding: "2px 8px",
                                background: "rgba(103, 147, 42, 0.15)",
                                borderRadius: "15px",
                                }}>
                                {item.standardUnit || "1kg"}
                                </div>
                            </div>

                            {/* 중앙: 가격 */}
                            <div style={{
                                fontSize: "20px",
                                fontWeight: "bold",
                                color: "#333",
                                minWidth: "100px",
                                textAlign: "center",
                            }}>
                                {item.currentPrice ? `${item.currentPrice.toLocaleString()}원` : "-"}
                            </div>

                            {/* 오른쪽: 변동률 */}
                            <div style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "5px",
                                minWidth: "90px",
                                justifyContent: "flex-end",
                            }}>
                                <span style={{
                                fontSize: "16px",
                                fontWeight: "bold",
                                color: item.priceChangePercent > 0 ? "#d32f2f" : "#1976d2",
                                }}>
                                {item.priceChangePercent > 0 ? "▲" : "▼"}
                                </span>
                                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
                                <span style={{
                                    fontSize: "14px",
                                    fontWeight: "bold",
                                    color: item.priceChangePercent > 0 ? "#d32f2f" : "#1976d2",
                                }}>
                                    {item.priceChangePercent > 0 ? "+" : ""}{item.priceChangePercent?.toFixed(1)}%
                                </span>
                                <span style={{
                                    fontSize: "9px",
                                    color: "#999",
                                }}>
                                    전일 대비
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
                        marginTop: "20px",
                        }}>
                        <button
                            onClick={() => navigate("/ingredient/list")}
                            style={{
                            padding: "12px 30px",
                            fontSize: "14px",
                            fontWeight: "bold",
                            color: "white",
                            background: "linear-gradient(135deg, #67932A 0%, #99A237 100%)",
                            border: "none",
                            borderRadius: "25px",
                            cursor: "pointer",
                            boxShadow: "0 4px 15px rgba(103, 147, 42, 0.3)",
                            transition: "all 0.3s ease",
                            }}
                            onMouseEnter={(e) => {
                            e.currentTarget.style.transform = "scale(1.05)";
                            e.currentTarget.style.boxShadow = "0 6px 20px rgba(103, 147, 42, 0.5)";
                            }}
                            onMouseLeave={(e) => {
                            e.currentTarget.style.transform = "scale(1)";
                            e.currentTarget.style.boxShadow = "0 4px 15px rgba(103, 147, 42, 0.3)";
                            }}
                        >
                            더 많은 식재료 보기 →
                        </button>
                        </div>
                    </div>
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
                        maxWidth: "1400px",
                        display: "flex",
                        gap: "40px",
                        alignItems: "flex-start",
                        zIndex: 10,
                    }}
                    >
                    {/* 위해 식품 정보 박스 */}
                    <div
                        onClick={() => navigate("/board/safety/list")}
                        onMouseEnter={() => setHoveredBox('warning')}
                        onMouseLeave={() => setHoveredBox(null)}
                        style={{
                        flex: 1,
                        background: "rgba(255, 255, 255, 0.95)",
                        borderRadius: "20px",
                        padding: "40px",
                        position: "relative",
                        cursor: "pointer",
                        boxShadow: hoveredBox === 'warning'
                            ? "0 20px 60px rgba(211, 47, 47, 0.4)"
                            : "0 10px 30px rgba(0, 0, 0, 0.1)",
                        transition: "all 0.3s ease",
                        transform: hoveredBox === 'warning' ? "translateY(-5px)" : "translateY(0)",
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
                        <p style={{ fontSize: "16px", color: "#d32f2f", margin: 0, textAlign: "center" }}>
                            ⚠️ 클릭하여 확인하기
                        </p>
                        </div>

                        {hoveredBox === 'warning' && (
                        <div style={{ marginTop: "20px", position: "relative" }}>
                            <div
                            style={{
                                background: "#ffebee",
                                padding: "12px 16px",
                                borderRadius: "15px 15px 15px 0",
                                marginBottom: "8px",
                                animation: "chatPopup 0.3s ease-out",
                                boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
                            }}
                            >
                            <p style={{ margin: 0, fontSize: "13px", color: "#333" }}>
                                🔍 리콜 식품 정보 확인
                            </p>
                            </div>
                            <div
                            style={{
                                background: "#ef9a9a",
                                padding: "12px 16px",
                                borderRadius: "15px 15px 15px 0",
                                marginBottom: "8px",
                                animation: "chatPopup 0.3s ease-out",
                                animationDelay: "0.1s",
                                boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
                            }}
                            >
                            <p style={{ margin: 0, fontSize: "13px", color: "#fff" }}>
                                📋 부적합 식품 목록 조회
                            </p>
                            </div>
                            <div
                            style={{
                                background: "#d32f2f",
                                padding: "12px 16px",
                                borderRadius: "15px 15px 15px 0",
                                animation: "chatPopup 0.3s ease-out",
                                animationDelay: "0.2s",
                                boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
                            }}
                            >
                            <p style={{ margin: 0, fontSize: "13px", color: "#fff" }}>
                                🛡️ 안전 알림 설정하기
                            </p>
                            </div>
                        </div>
                        )}
                    </div>

                    {/* 공지사항 박스 */}
                    <div
                        onClick={() => navigate("/board/notice/list")}
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
                            ? "0 20px 60px rgba(103, 147, 42, 0.4)"
                            : "0 10px 30px rgba(0, 0, 0, 0.1)",
                        transition: "all 0.3s ease",
                        transform: hoveredBox === 'notice' ? "translateY(-5px)" : "translateY(0)",
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

                        <div
                        style={{
                            marginTop: "30px",
                            padding: "20px",
                            background: "#f1f7e6",
                            borderRadius: "10px",
                            border: "2px solid #c5d89d",
                        }}
                        >
                        <p style={{ fontSize: "16px", color: "#67932A", margin: 0, textAlign: "center" }}>
                            ✨ 클릭하여 확인하기
                        </p>
                        </div>

                        {hoveredBox === 'notice' && (
                        <div style={{ marginTop: "20px", position: "relative" }}>
                            <div
                            style={{
                                background: "#f1f7ad",
                                padding: "12px 16px",
                                borderRadius: "15px 15px 15px 0",
                                marginBottom: "8px",
                                animation: "chatPopup 0.3s ease-out",
                                boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
                            }}
                            >
                            <p style={{ margin: 0, fontSize: "13px", color: "#333" }}>
                                🎉 새로운 기능 업데이트
                            </p>
                            </div>
                            <div
                            style={{
                                background: "#b6be5c",
                                padding: "12px 16px",
                                borderRadius: "15px 15px 15px 0",
                                marginBottom: "8px",
                                animation: "chatPopup 0.3s ease-out",
                                animationDelay: "0.1s",
                                boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
                            }}
                            >
                            <p style={{ margin: 0, fontSize: "13px", color: "#fff" }}>
                                📅 서비스 점검 안내
                            </p>
                            </div>
                            <div
                            style={{
                                background: "#99a237",
                                padding: "12px 16px",
                                borderRadius: "15px 15px 15px 0",
                                animation: "chatPopup 0.3s ease-out",
                                animationDelay: "0.2s",
                                boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
                            }}
                            >
                            <p style={{ margin: 0, fontSize: "13px", color: "#fff" }}>
                                📣 이벤트 소식 확인
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