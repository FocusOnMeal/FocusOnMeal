import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Footer from "../../components/common/Footer.jsx";
import useParallaxScroll from "../../components/main/ScrollIndicator.jsx";
import ParallaxEffects from "../../components/main/ParallaxSection.jsx";
import ContentSections from "../../components/main/ContentSection";

import useCarrotCursor from "../../components/hooks/useCarrotCursor.js";
import useStaticLeaves from "../../components/hooks/useStaticLeaves.js";

const ParallaxPage = () => {
    const navigate = useNavigate();

    const staticStyles = {
        wrapper: {
            position: "relative",
            width: "100%",
            height: "100vh",
            overflow: "hidden",
        },
        scrollContent: {
            width: "100%",
            height: "100%",
            overflowY: "scroll",
        },
    };

    const [hoveredBox, setHoveredBox] = useState(null);
    const [cursorParticles, setCursorParticles] = useState([]);
    const [ingredientList, setIngredientList] = useState([]);

    const containerRef = useRef(null);

    // 🔥 당근 커서 적용
    useCarrotCursor();

    // 🔥 전체 섹션 데이터
    const sections = useMemo(() => [
        {
            id: 1,
            title: "Focus on Meal",
            subtitle: "예산은 가볍게, 식단은 완벽하게 AI로 완성하는 <br> 스마트한 식생활 관리 솔루션, FOM",
            bgColor: "linear-gradient(180deg, #38A7DF 0%, #6AB9E2 100%)",
            height: 1.5,
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
        {
            id: 4,
            bgColor: "#ffffff",
            height: "auto",
            hasParallax: false,
            isFooter: true,
        },
    ], []);

    // 스크롤 로직 훅
    const { currentSection, snapToSection, getParallaxTransform } = useParallaxScroll({
        containerRef,
        sections,
    });

    // 🍃 정적 나뭇잎 훅
    const staticLeaves = useStaticLeaves(currentSection);

    // 🍀 식재료 API
    useEffect(() => {
        (async () => {
            try {
                const response = await axios.get("/ingredient/api/list");
                const sorted = response.data
                    .filter(v => v.priceChangePercent !== null)
                    .sort((a, b) => Math.abs(b.priceChangePercent) - Math.abs(a.priceChangePercent))
                    .slice(0, 5);
                setIngredientList(sorted);
            } catch (e) {
                console.error("식재료 불러오기 실패:", e);
            }
        })();
    }, []);

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

                    @keyframes flyLeafSlow {
                        0% { opacity: 0; left: -10%; top: var(--start-top); }
                        10% { opacity: 1; }
                        100% { opacity: 0; left: 110%; top: calc(var(--start-top) + 40vh); }
                    }

                    @keyframes floatIcon {
                        0%, 100% { transform: translateY(0px) rotate(0deg); }
                        50% { transform: translateY(-20px) rotate(5deg); }
                    }

                    @keyframes fadeInUp {
                        from {
                            opacity: 0;
                            transform: translateY(30px);
                        }
                        to {
                            opacity: 1;
                            transform: translateY(0);
                        }
                    }

                    ::-webkit-scrollbar { display: none; }
                `}
            </style>

            <div style={staticStyles.wrapper}>
                <div ref={containerRef} style={staticStyles.scrollContent}>
                    {sections.map((section, index) => (
                        <SectionBlock
                            key={section.id}
                            index={index}
                            section={section}
                            staticLeaves={staticLeaves}
                            hoveredBox={hoveredBox}
                            setHoveredBox={setHoveredBox}
                            ingredientList={ingredientList}
                            navigate={navigate}
                            currentSection={currentSection}
                            getParallaxTransform={getParallaxTransform}
                        />
                    ))}
                </div>

                <ScrollIndicator
                    sections={sections}
                    currentSection={currentSection}
                    snapToSection={snapToSection}
                />
            </div>
        </>
    );
};

// ------------------------------------------------------------
// 개별 섹션 블록 분리 → 렌더 비용 절감
// ------------------------------------------------------------

const SectionBlock = React.memo(({
    index,
    section,
    staticLeaves,
    hoveredBox,
    setHoveredBox,
    ingredientList,
    navigate,
    currentSection,
    getParallaxTransform
}) => {

    const handleNavigate = useCallback(
        (path) => navigate(path),
        [navigate]
    );

    return (
        <div
            data-section-index={index}
            style={{
                width: "100%",
                height: section.height === "auto" ? "auto" : `${section.height * 100}vh`,
                background: section.bgColor,
                position: "relative",
                overflow: "hidden",
            }}
        >
            {/* 정적 나뭇잎 */}
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

            {/* 텍스트 */}
            {index === 0 && (
                <div
                    style={{
                        position: "absolute",
                        top: "30%",
                        left: "10%",
                        color: "white",
                        zIndex: 10,
                        textAlign: "left",
                        animation: "fadeInUp 1s ease-out",
                    }}
                >
                    <h1 style={{ 
                        fontSize: "40px", 
                        marginBottom: "20px",
                        textShadow: "2px 2px 20px rgba(0,0,0,0.3)",
                    }}>
                        {section.title}
                    </h1>
                    <p
                        style={{ 
                            fontSize: "20px",
                            textShadow: "1px 1px 10px rgba(0,0,0,0.3)",
                        }}
                        dangerouslySetInnerHTML={{ __html: section.subtitle }}
                    />
                </div>
            )}



            {/* 패럴랙스 */}
            {index === 0 && section.hasParallax && (
                <ParallaxEffects
                    currentSection={currentSection}
                    getParallaxTransform={getParallaxTransform}
                />
            )}

            {/* 2, 3페이지 콘텐츠 */}
            {(index === 1 || index === 2) && (
                <ContentSections
                    index={index}
                    hoveredBox={hoveredBox}
                    setHoveredBox={setHoveredBox}
                    ingredientList={ingredientList}
                    navigate={handleNavigate}
                />
            )}

            {/* Footer */}
            {section.isFooter && <Footer />}
        </div>
    );
});


// ------------------------------------------------------------
// 스크롤 인디케이터
// ------------------------------------------------------------

const ScrollIndicator = React.memo(({ sections, currentSection, snapToSection }) => {
    const handleClick = useCallback((index) => {
        snapToSection(index);
    }, [snapToSection]);

    return (
        <div
            style={{
                position: "fixed",
                right: "30px",
                top: "50%",
                transform: "translateY(-50%)",
                zIndex: 2000,
            }}
        >
            {sections.filter(s => !s.isFooter).map((_, index) => (
                <div
                    key={index}
                    style={{
                        width: "12px",
                        height: "12px",
                        margin: "10px 0",
                        borderRadius: "50%",
                        background: currentSection === index ? "white" : "rgba(255,255,255,0.3)",
                        cursor: "pointer",
                        transition: "all 0.3s ease",
                        border: currentSection === index ? "2px solid white" : "2px solid transparent",
                        transform: currentSection === index ? "scale(1.3)" : "scale(1)",
                    }}
                    onClick={() => handleClick(index)}
                />
            ))}
        </div>
    );
});


export default ParallaxPage;