import React, { useState, useEffect, useRef } from "react";

const MainPage = () => {
    const [scrollProgress, setScrollProgress] = useState(0);
    const [currentSection, setCurrentSection] = useState(0);
    const [staticLeaves, setStaticLeaves] = useState([]);
    const [cursorParticles, setCursorParticles] = useState([]);
    const containerRef = useRef(null);
    const scrollTimeoutRef = useRef(null);

    /* --------------------------
        💚 첫 장 정적 나뭇잎
        (기존 로직 그대로, interval cleanup 포함)
    --------------------------- */
    useEffect(() => {
        const leafColors = ["#F1F7AD", "#B6BE5C", "#99A237"];

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
        // no cleanup needed when not created
        return undefined;
    }, [currentSection]);

    /* --------------------------
        📌 스크롤 핸들러
        (기본 구조 유지, passive true, cleanup)
    --------------------------- */
    useEffect(() => {
        const handleScroll = () => {
        const container = containerRef.current;
        if (!container) return;

        const scrollTop = container.scrollTop;
        const scrollHeight = container.scrollHeight - container.clientHeight;

        setScrollProgress((scrollTop / scrollHeight) * 100);
        setCurrentSection(Math.floor(scrollTop / container.clientHeight));

        if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
        scrollTimeoutRef.current = setTimeout(() => {}, 150);
        };

        const c = containerRef.current;
        c?.addEventListener("scroll", handleScroll, { passive: true });

        return () => {
        c?.removeEventListener("scroll", handleScroll);
        if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
        };
    }, []);

    /* ------------------------------------
        🥕 커스텀 당근 커서 (변경 없음)
    ------------------------------------ */
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

    /* --------------------------
        ✨ 커서 파티클 (수정된 안정 버전)
        - 문제 원인: setTimeout per-particle + setState flood
        - 해결: particlesRef 에 보관, rAF 단일 루프에서 정리 & 상태 동기화 (throttle)
    --------------------------- */
    useEffect(() => {
        const particlesRef = { current: [] }; // plain object ref-like
        const lastSpawnRef = { current: 0 };
        const rafRef = { current: null };
        const lastUpdateRef = { current: 0 };
        const FRAME_INTERVAL = 1000 / 30; // 30 fps state updates

        // pointer move handler: only push to particlesRef, no timers
        const handleMove = (e) => {
        const now = Date.now();
        if (now - lastSpawnRef.current < 40) return; // throttle spawn
        lastSpawnRef.current = now;

        const p = {
            id: now + Math.random(),
            x: e.clientX,
            y: e.clientY,
            size: 6 + Math.random() * 10,
            created: now,
            lifespan: 700 + Math.random() * 400,
        };

        particlesRef.current.push(p);

        // ensure rAF loop is running
        if (!rafRef.current) {
            rafRef.current = requestAnimationFrame(loop);
        }
        };

        const loop = () => {
        const now = Date.now();

        // remove expired particles in-place
        particlesRef.current = particlesRef.current.filter(
            (p) => now - p.created < p.lifespan
        );

        // throttle setState updates to FRAME_INTERVAL (30fps)
        if (now - lastUpdateRef.current >= FRAME_INTERVAL) {
            // snapshot for render
            setCursorParticles(particlesRef.current.slice());
            lastUpdateRef.current = now;
        }

        // continue loop only if particles remain
        if (particlesRef.current.length > 0) {
            rafRef.current = requestAnimationFrame(loop);
        } else {
            // stop loop
            cancelAnimationFrame(rafRef.current || 0);
            rafRef.current = null;
        }
        };

        window.addEventListener("pointermove", handleMove);

        return () => {
        window.removeEventListener("pointermove", handleMove);
        if (rafRef.current) cancelAnimationFrame(rafRef.current);
        };
    }, []); // mount once

    /* --------------------------
        🌈 섹션 데이터 (변경 없음)
    --------------------------- */
    const sections = [
        {
        id: 1,
        title: "Focus on Meal",
        subtitle: "메인에 들어가는 내용 왼쪽 상단에 들어갈 예정 제목이랑 내용 크기 줄일 것.",
        bgColor: "linear-gradient(180deg, #38A7DF 0%, #6AB9E2 100%)",
        direction: "up",
        },
        {
        id: 2,
        bgColor: "linear-gradient(180deg, #67932A 0%, #99A237 100%)",
        direction: "left",
        },
        {
        id: 3,
        bgColor: "linear-gradient(180deg, #99A237 0%, #B6BE5C 100%)",
        direction: "right",
        },
    ];

    /* 🔥 Parallax 로직 (밀림 해결) -- 유지된 코드 */
    const getTransform = (index, direction) => {
        const container = containerRef.current;
        if (!container) return {};

        // 📌 이 섹션의 top 기준점
        const sectionTop = index * container.clientHeight;

        // 📌 이 섹션 내부에서 스크롤된 양
        const localScroll = container.scrollTop - sectionTop;

        // 섹션 범위를 벗어나면 이동하지 않음
        if (localScroll < 0 || localScroll > container.clientHeight) {
        return {};
        }

        // 0 ~ 100% 섹션 내부 진행도
        const localProgress = (localScroll / container.clientHeight) * 100;

        switch (direction) {
        case "left":
            return { transform: `translateX(${localProgress * 0.5}px)` };
        case "right":
            return { transform: `translateX(${-localProgress * 0.5}px)` };
        case "up":
            return { transform: `translateY(${localProgress * 0.3}px)` };
        default:
            return {};
        }
    };

    /* --------------------------
        JSX
        (onWheel removed to prevent forced scroll changes which caused infinite loops)
    --------------------------- */
    return (
        <>
        <style>
            {`
            body, html {
                cursor: none !important;
                margin: 0;
                height: 100%;
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

            ::-webkit-scrollbar { display: none; }
            `}
        </style>

        {/* ✨ 커서 파티클 (render from state snapshot) */}
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

        {/* ------------------------------------
                📌 전체 레이아웃 컨테이너
        ------------------------------------ */}
        <div
            style={{
            width: "100vw",
            height: "100vh",
            position: "relative",
            overflow: "hidden",
            }}
        >
            <div
            ref={containerRef}
            style={{
                width: "100%",
                height: "100vh",
                overflowY: "scroll",

                /* ⭐ scroll-snap 유지, but NO manual wheel scroll manipulation */
                scrollSnapType: "y mandatory",
                scrollBehavior: "smooth",
            }}
            >
            {sections.map((section, index) => (
                <div
                key={section.id}
                style={{
                    width: "100%",
                    height: "100vh",
                    scrollSnapAlign: "start",
                    background: section.bgColor,
                    position: "relative",
                    overflow: "hidden",

                    /* Parallax 적용 (localProgress 기반) */
                    ...getTransform(index, section.direction),
                    transition: "transform 0.3s ease-out",
                }}
                >
                {/* 🌿 나뭇잎 */}
                {index === 0 &&
                    staticLeaves.map((leaf) => (
                    <div
                        key={leaf.id}
                        style={{
                        position: "absolute",
                        left: `${leaf.left}%`,
                        top: `${leaf.top}%`,
                        width: `${leaf.size * 2}px`,
                        height: `${leaf.size}px`,
                        "--start-top": `${leaf.top}%`,
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
                        top: "50%",
                        left: "50%",
                        transform: "translate(-50%, -50%)",
                        textAlign: "center",
                        color: "white",
                        zIndex: 10,
                    }}
                    >
                    <h1 style={{ fontSize: "64px", marginBottom: "20px" }}>
                        {sections[0].title}
                    </h1>
                    <p style={{ fontSize: "28px" }}>{sections[0].subtitle}</p>
                    </div>
                )}
                </div>
            ))}
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
                    currentSection === index ? "white" : "rgba(255,255,255,0.3)",
                    cursor: "pointer",
                    transition: "0.3s",
                }}
                onClick={() =>
                    containerRef.current.scrollTo({
                    top: index * window.innerHeight,
                    behavior: "smooth",
                    })
                }
                />
            ))}
            </div>
        </div>
        </>
    );
    };

export default MainPage;
