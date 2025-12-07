import React, { useMemo } from "react";

/* ------------------------------
    공통 Style 상수
--------------------------------*/
const wrapperStyle = {
    position: "absolute",
    top: "0",
    left: "0",
    width: "100%",
    height: "100%",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
    pointerEvents: "none",
};

const innerContainerStyle = {
    width: "90%",
    maxWidth: "1400px",
    display: "flex",
    gap: "40px",
    alignItems: "flex-start",
};

const cardBaseStyle = {
    flex: 1,
    background: "rgba(255, 255, 255, 0.95)",
    borderRadius: "20px",
    padding: "40px",
    position: "relative",
    transition: "all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)",
    pointerEvents: "auto",
};

const ingredientRowBase = {
    background: "#f1f7e6",
    borderRadius: "12px",
    padding: "14px 20px",
    border: "1px solid #c5d89d",
    transition: "transform 0.3s ease, box-shadow 0.3s ease",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
};

const bounceBox = (delay, bg, color = "#fff") => ({
    background: bg,
    padding: "12px 16px",
    borderRadius: "15px 15px 15px 0",
    marginBottom: "8px",
    animation: `popIn 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) ${delay}s both`,
    boxShadow: "0 4px 15px rgba(0,0,0,0.15)",
    color,
});

/* ===================================================================
                    메인 컴포넌트
=================================================================== */
const ContentSections = ({ index, hoveredBox, setHoveredBox, ingredientList, navigate }) => {

    /* ================================================================
                        2 페이지 콘텐츠
    ================================================================ */
    if (index === 1) {
        return (
            <>
                <style>
                    {`
                        @keyframes popIn {
                            0% {
                                opacity: 0;
                                transform: translateY(20px) scale(0.8);
                            }
                            50% {
                                transform: translateY(-5px) scale(1.05);
                            }
                            100% {
                                opacity: 1;
                                transform: translateY(0) scale(1);
                            }
                        }

                        @keyframes wiggle {
                            0%, 100% { transform: translateX(-50%) rotate(0deg); }
                            25% { transform: translateX(-50%) rotate(-5deg); }
                            75% { transform: translateX(-50%) rotate(5deg); }
                        }
                    `}
                </style>
                <div style={wrapperStyle}>
                    <div style={innerContainerStyle}>

                        {/* ------------------------- Left : AI 식단 추천 ------------------------- */}
                        <div
                            onMouseEnter={() => setHoveredBox("ai")}
                            onMouseLeave={() => setHoveredBox(null)}
                            onClick={() => navigate("/meal/mealAI")}
                            style={{
                                ...cardBaseStyle,
                                cursor: "pointer",
                                boxShadow:
                                    hoveredBox === "ai"
                                        ? "0 25px 70px rgba(103, 147, 42, 0.5)"
                                        : "0 10px 30px rgba(0, 0, 0, 0.1)",
                                transform: hoveredBox === "ai" ? "translateY(-10px) scale(1.03)" : "scale(1)",
                            }}
                        >
                            <div style={{ 
                                position: "absolute", 
                                top: "-30px", 
                                left: "50%", 
                                transform: "translateX(-50%)", 
                                fontSize: "60px",
                                animation: hoveredBox === "ai" ? "wiggle 0.5s ease-in-out infinite" : "none",
                            }}>
                                🍽️
                            </div>

                            <h2 style={{
                                fontSize: "32px", fontWeight: "bold",
                                color: "#67932A", marginTop: "40px",
                                marginBottom: "20px", textAlign: "center"
                            }}>
                                AI 식단 추천
                            </h2>

                            <p style={{ fontSize: "18px", color: "#666", textAlign: "center", lineHeight: 1.6 }}>
                                나만의 맞춤형 식단을<br />AI가 추천해드립니다
                            </p>

                            <div style={{ 
                                marginTop: "30px", 
                                padding: "20px", 
                                background: "#f1f7e6", 
                                borderRadius: "10px", 
                                border: "2px solid #c5d89d", 
                                textAlign: "center", 
                                color: "#67932A", 
                                fontWeight: "bold",
                                transition: "all 0.3s ease",
                                ...(hoveredBox === "ai" && {
                                    background: "#e8f5d0",
                                    transform: "scale(1.05)",
                                })
                            }}>
                                ✨ 클릭하여 시작하기
                            </div>

                            {hoveredBox === "ai" && (
                                <div style={{ marginTop: "20px" }}>
                                    <div style={bounceBox(0, "#f1f7ad", "#333")}>🥗 건강한 식단 추천받기</div>
                                    <div style={bounceBox(0.15, "#b6be5c")}>💰 예산에 맞는 식단 구성</div>
                                    <div style={bounceBox(0.3, "#99a237")}>📊 영양 성분 자동 계산</div>
                                </div>
                            )}
                        </div>

                        {/* ---------------------------- Right : 식재료 가격 ---------------------------- */}
                        <div
                            onMouseEnter={() => setHoveredBox("price")}
                            onMouseLeave={() => setHoveredBox(null)}
                            style={{
                                ...cardBaseStyle,
                                boxShadow:
                                    hoveredBox === "price"
                                        ? "0 25px 70px rgba(103, 147, 42, 0.5)"
                                        : "0 10px 30px rgba(0, 0, 0, 0.1)",
                                transform: hoveredBox === "price" ? "translateY(-10px) scale(1.03)" : "scale(1)",
                                display: "flex",
                                flexDirection: "column",
                            }}
                        >
                            <div style={{ 
                                position: "absolute", 
                                top: "-30px", 
                                left: "50%", 
                                transform: "translateX(-50%)", 
                                fontSize: "60px",
                                animation: hoveredBox === "price" ? "wiggle 0.5s ease-in-out infinite" : "none",
                            }}>
                                📈
                            </div>

                            <h2 style={{
                                fontSize: "28px", color: "#67932A",
                                textAlign: "center", marginTop: "30px",
                                marginBottom: "20px", fontWeight: "bold",
                            }}>
                                오늘의 식재료 가격
                            </h2>

                            {/* 리스트 */}
                            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                                {ingredientList.map((item) => {
                                    const isUp = item.priceChangePercent > 0;

                                    return (
                                        <div
                                            key={item.ingredientId}
                                            onClick={() => navigate(`/ingredient/detail/${item.ingredientId}`)}
                                            style={ingredientRowBase}
                                            onMouseEnter={(e) => {
                                                e.currentTarget.style.transform = "translateX(8px)";
                                                e.currentTarget.style.boxShadow = "0 4px 20px rgba(103,147,42,0.3)";
                                            }}
                                            onMouseLeave={(e) => {
                                                e.currentTarget.style.transform = "translateX(0)";
                                                e.currentTarget.style.boxShadow = "none";
                                            }}
                                        >
                                            {/* 이름 */}
                                            <div style={{ display: "flex", alignItems: "center", gap: "12px", flex: 1 }}>
                                                <div style={{ fontSize: "18px", fontWeight: "bold", color: "#67932A" }}>
                                                    {item.name}
                                                </div>
                                                <div style={{
                                                    fontSize: "11px", color: "#67932A",
                                                    padding: "2px 8px", background: "rgba(103,147,42,0.15)",
                                                    borderRadius: "15px"
                                                }}>
                                                    {item.standardUnit || "1kg"}
                                                </div>
                                            </div>

                                            {/* 가격 */}
                                            <div style={{ fontSize: "20px", fontWeight: "bold", color: "#333" }}>
                                                {item.currentPrice ? `${item.currentPrice.toLocaleString()}원` : "-"}
                                            </div>

                                            {/* 변동률 */}
                                            <div style={{
                                                display: "flex", alignItems: "center", gap: "5px",
                                                minWidth: "90px", justifyContent: "flex-end"
                                            }}>
                                                <span style={{ fontSize: "16px", fontWeight: "bold", color: isUp ? "#d32f2f" : "#1976d2" }}>
                                                    {isUp ? "▲" : "▼"}
                                                </span>
                                                <div style={{ display: "flex", flexDirection: "column" }}>
                                                    <span style={{ fontSize: "14px", fontWeight: "bold", color: isUp ? "#d32f2f" : "#1976d2" }}>
                                                        {isUp ? "+" : ""}{item.priceChangePercent?.toFixed(1)}%
                                                    </span>
                                                    <span style={{ fontSize: "9px", color: "#999" }}>전일 대비</span>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            <div style={{ display: "flex", justifyContent: "center", marginTop: "20px" }}>
                                <button
                                    onClick={() => navigate("/ingredient/list")}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.transform = "translateY(-2px)";
                                        e.currentTarget.style.boxShadow = "0 6px 20px rgba(103,147,42,0.4)";
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.transform = "translateY(0)";
                                        e.currentTarget.style.boxShadow = "0 4px 15px rgba(103,147,42,0.3)";
                                    }}
                                    style={{
                                        padding: "12px 30px", fontSize: "14px",
                                        fontWeight: "bold", color: "white",
                                        background: "linear-gradient(135deg, #67932A 0%, #99A237 100%)",
                                        border: "none", borderRadius: "25px",
                                        cursor: "pointer", boxShadow: "0 4px 15px rgba(103,147,42,0.3)",
                                        transition: "all 0.3s ease",
                                    }}
                                >
                                    더 많은 식재료 보기 →
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </>
        );
    }

    /* ================================================================
                        3 페이지 콘텐츠
    ================================================================ */
    if (index === 2) {
        return (
            <>
                <style>
                    {`
                        @keyframes popIn {
                            0% {
                                opacity: 0;
                                transform: translateY(20px) scale(0.8);
                            }
                            50% {
                                transform: translateY(-5px) scale(1.05);
                            }
                            100% {
                                opacity: 1;
                                transform: translateY(0) scale(1);
                            }
                        }

                        @keyframes wiggle {
                            0%, 100% { transform: translateX(-50%) rotate(0deg); }
                            25% { transform: translateX(-50%) rotate(-5deg); }
                            75% { transform: translateX(-50%) rotate(5deg); }
                        }
                    `}
                </style>
                <div style={wrapperStyle}>
                    <div style={innerContainerStyle}>

                        {/* ------------------------- Left : 위해 식품 정보 ------------------------- */}
                        <div
                            onClick={() => navigate("/board/safety/list")}
                            onMouseEnter={() => setHoveredBox("warning")}
                            onMouseLeave={() => setHoveredBox(null)}
                            style={{
                                ...cardBaseStyle,
                                cursor: "pointer",
                                boxShadow:
                                    hoveredBox === "warning"
                                        ? "0 25px 70px rgba(211, 47, 47, 0.5)"
                                        : "0 10px 30px rgba(0, 0, 0, 0.1)",
                                transform: hoveredBox === "warning" ? "translateY(-10px) scale(1.03)" : "scale(1)",
                            }}
                        >
                            <div style={{ 
                                position: "absolute", 
                                top: "-30px", 
                                left: "50%", 
                                transform: "translateX(-50%)", 
                                fontSize: "60px",
                                animation: hoveredBox === "warning" ? "wiggle 0.5s ease-in-out infinite" : "none",
                            }}>
                                🚨
                            </div>

                            <h2 style={{ fontSize: "32px", fontWeight: "bold", color: "#d32f2f", textAlign: "center", marginTop: "40px", marginBottom: "20px" }}>
                                위해 식품 정보
                            </h2>

                            <p style={{ fontSize: "18px", color: "#666", textAlign: "center", lineHeight: "1.6" }}>
                                최신 위해 식품 정보를 확인하고<br />안전한 식생활을 유지하세요
                            </p>

                            <div style={{
                                marginTop: "30px", padding: "20px", background: "#fff3f3",
                                borderRadius: "10px", border: "2px solid #ffcdd2", textAlign: "center",
                                transition: "all 0.3s ease",
                                ...(hoveredBox === "warning" && {
                                    background: "#ffe0e0",
                                    transform: "scale(1.05)",
                                })
                            }}>
                                <p style={{ margin: 0, fontSize: "16px", color: "#d32f2f" }}>⚠️ 클릭하여 확인하기</p>
                            </div>

                            {hoveredBox === "warning" && (
                                <div style={{ marginTop: "20px" }}>
                                    <div style={bounceBox(0, "#ffebee", "#333")}>🔍 리콜 식품 정보 확인</div>
                                    <div style={bounceBox(0.15, "#ef9a9a")}>📋 부적합 식품 목록 조회</div>
                                    <div style={bounceBox(0.3, "#d32f2f")}>🛡️ 안전 알림 설정하기</div>
                                </div>
                            )}
                        </div>

                        {/* ------------------------- Right : 공지사항 ------------------------- */}
                        <div
                            onClick={() => navigate("/board/notice/list")}
                            onMouseEnter={() => setHoveredBox("notice")}
                            onMouseLeave={() => setHoveredBox(null)}
                            style={{
                                ...cardBaseStyle,
                                cursor: "pointer",
                                boxShadow:
                                    hoveredBox === "notice"
                                        ? "0 25px 70px rgba(103, 147, 42, 0.5)"
                                        : "0 10px 30px rgba(0, 0, 0, 0.1)",
                                transform: hoveredBox === "notice" ? "translateY(-10px) scale(1.03)" : "scale(1)",
                            }}
                        >
                            <div style={{ 
                                position: "absolute", 
                                top: "-30px", 
                                left: "50%", 
                                transform: "translateX(-50%)", 
                                fontSize: "60px",
                                animation: hoveredBox === "notice" ? "wiggle 0.5s ease-in-out infinite" : "none",
                            }}>
                                📢
                            </div>

                            <h2 style={{ fontSize: "32px", fontWeight: "bold", color: "#67932A", textAlign: "center", marginTop: "40px", marginBottom: "20px" }}>
                                공지사항
                            </h2>

                            <p style={{ fontSize: "18px", color: "#666", textAlign: "center", lineHeight: "1.6" }}>
                                새로운 소식과 업데이트를<br />확인해보세요
                            </p>

                            <div style={{
                                marginTop: "30px", padding: "20px", background: "#f1f7e6",
                                borderRadius: "10px", border: "2px solid #c5d89d", textAlign: "center",
                                transition: "all 0.3s ease",
                                ...(hoveredBox === "notice" && {
                                    background: "#e8f5d0",
                                    transform: "scale(1.05)",
                                })
                            }}>
                                <p style={{ margin: 0, fontSize: "16px", color: "#67932A" }}>✨ 클릭하여 확인하기</p>
                            </div>

                            {hoveredBox === "notice" && (
                                <div style={{ marginTop: "20px" }}>
                                    <div style={bounceBox(0, "#f1f7ad", "#333")}>🎉 새로운 기능 업데이트</div>
                                    <div style={bounceBox(0.15, "#b6be5c")}>📅 서비스 점검 안내</div>
                                    <div style={bounceBox(0.3, "#99a237")}>📣 이벤트 소식 확인</div>
                                </div>
                            )}
                        </div>

                    </div>
                </div>
            </>
        );
    }

    return null;
};

export default ContentSections;