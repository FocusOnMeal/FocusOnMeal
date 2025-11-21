import React, { useState, useEffect } from "react";
import axios from "axios";
import styles from "./MyMeal.module.css";
import Sidebar from "../../components/mypage/Sidebar";
import Pagination from "../../components/common/Pagination";

const MyMeal = () => {
    const [mealList, setMealList] = useState([]);
    const [pageInfo, setPageInfo] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [loading, setLoading] = useState(true);

    // 레시피 모달
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedMeal, setSelectedMeal] = useState(null);

    // 식단 목록 조회
    useEffect(() => {
        const fetchMealPlans = async () => {
            const token = localStorage.getItem("token");
            if (!token) {
                console.error("JWT 토큰이 없습니다.");
                setLoading(false);
                return;
            }

            try {
                const response = await axios.get("/api/mypage/myMeals", {
                    params: { page: currentPage },
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });

                console.log("[API 성공] 받은 데이터:", response.data);
                setMealList(response.data.mealList);
                setPageInfo(response.data.pageInfo);
            } catch (err) {
                console.error("[API 실패] 에러 발생:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchMealPlans();
    }, [currentPage]);

    // 레시피 모달 열기
    const openRecipeModal = (meal) => {
        setSelectedMeal(meal);
        setIsModalOpen(true);
    };

    // 레시피 모달 닫기
    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedMeal(null);
    };

    // 식단 삭제
    const handleDelete = async (planId) => {
        if (!window.confirm("정말 삭제하시겠습니까?")) return;

        const token = localStorage.getItem("token");

        try {
            await axios.put(`/api/mypage/mealDelete/${planId}`, null, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            alert("식단이 삭제되었습니다.");
            // 목록 새로고침 - API 다시 호출
            const response = await axios.get("/api/mypage/myMeals", {
                params: { page: currentPage },
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            setMealList(response.data.mealList);
            setPageInfo(response.data.pageInfo);
        } catch (err) {
            console.error("삭제 실패:", err);
            alert("삭제에 실패했습니다.");
        }
    };

    // 식사 시간 뱃지 색상
    const getMealTypeBadge = (whenEat) => {
        switch (whenEat) {
            case "아침":
                return styles.badgeMorning;
            case "점심":
                return styles.badgeLunch;
            case "저녁":
                return styles.badgeDinner;
            default:
                return styles.badgeDefault;
        }
    };

    // 레시피 파싱 (JSON 문자열 -> 배열)
    const parseRecipe = (aiRecipe) => {
        if (!aiRecipe) return [];
        try {
            return JSON.parse(aiRecipe);
        } catch {
            return aiRecipe.split('\n').filter(step => step.trim());
        }
    };

    // 재료 파싱 (JSON 문자열 -> 배열)
    const parseIngredients = (ingredientsJson) => {
        if (!ingredientsJson) return [];
        try {
            return JSON.parse(ingredientsJson);
        } catch {
            return [];
        }
    };

    if (loading) return <div className={styles.loading}>Loading...</div>;

    return (
        <div className={styles.container}>
            <Sidebar />
            <main className={styles.main}>
                <h2 className={styles.title}>내 식단</h2>

                <table className={styles.mealTable}>
                    <thead>
                        <tr>
                            <th>번호</th>
                            <th className={styles.nameCol}>식단명</th>
                            <th>식사 시간</th>
                            <th>예상 가격</th>
                            <th>칼로리</th>
                            <th>저장일</th>
                            <th>관리</th>
                        </tr>
                    </thead>

                    <tbody>
                        {mealList?.length === 0 ? (
                            <tr>
                                <td colSpan="7" style={{ textAlign: "center", padding: "40px" }}>
                                    저장된 식단이 없습니다.
                                </td>
                            </tr>
                        ) : (
                            mealList.map((meal, index) => (
                                <tr key={meal.planId}>
                                    <td>{pageInfo ? (pageInfo.currentPage - 1) * pageInfo.boardLimit + index + 1 : index + 1}</td>
                                    <td className={styles.nameCol}>
                                        <span
                                            className={styles.mealNameLink}
                                            onClick={() => openRecipeModal(meal)}
                                        >
                                            {meal.planName}
                                        </span>
                                    </td>
                                    <td>
                                        <span className={`${styles.badge} ${getMealTypeBadge(meal.whenEat)}`}>
                                            {meal.whenEat || "-"}
                                        </span>
                                    </td>
                                    <td>{meal.totalCost?.toLocaleString()}원</td>
                                    <td>{meal.calories ? `${meal.calories}kcal` : "-"}</td>
                                    <td>
                                        {meal.createdAt
                                            ? new Date(meal.createdAt).toLocaleDateString("ko-KR")
                                            : "-"}
                                    </td>
                                    <td>
                                        <div className={styles.btnGroup}>
                                            <button
                                                className={styles.viewBtn}
                                                onClick={() => openRecipeModal(meal)}
                                            >
                                                레시피
                                            </button>
                                            <button
                                                className={styles.deleteBtn}
                                                onClick={() => handleDelete(meal.planId)}
                                            >
                                                삭제
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>

                <Pagination
                    pageInfo={pageInfo}
                    currentPage={currentPage}
                    changePage={(page) => setCurrentPage(page)}
                />
            </main>

            {/* 레시피 상세 모달 */}
            {isModalOpen && selectedMeal && (
                <div className={styles.modalOverlay} onClick={closeModal}>
                    <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                        <div className={styles.modalHeader}>
                            <h2>{selectedMeal.planName}</h2>
                            <span className={styles.modalClose} onClick={closeModal}>&times;</span>
                        </div>
                        <div className={styles.modalBody}>
                            {/* 기본 정보 */}
                            <div className={styles.mealInfoGrid}>
                                <div className={styles.infoItem}>
                                    <span className={styles.infoLabel}>식사 시간</span>
                                    <span className={styles.infoValue}>{selectedMeal.whenEat || "-"}</span>
                                </div>
                                <div className={styles.infoItem}>
                                    <span className={styles.infoLabel}>예상 가격</span>
                                    <span className={styles.infoValue}>{selectedMeal.totalCost?.toLocaleString()}원</span>
                                </div>
                                <div className={styles.infoItem}>
                                    <span className={styles.infoLabel}>인분</span>
                                    <span className={styles.infoValue}>{selectedMeal.servingSize}인분</span>
                                </div>
                            </div>

                            {/* 영양 정보 */}
                            <div className={styles.nutritionSection}>
                                <h3>영양 정보</h3>
                                <div className={styles.nutritionGrid}>
                                    <div className={styles.nutritionItem}>
                                        <span className={styles.nutritionLabel}>칼로리</span>
                                        <span className={styles.nutritionValue}>{selectedMeal.calories || "-"} kcal</span>
                                    </div>
                                    <div className={styles.nutritionItem}>
                                        <span className={styles.nutritionLabel}>탄수화물</span>
                                        <span className={styles.nutritionValue}>{selectedMeal.carbsG || "-"} g</span>
                                    </div>
                                    <div className={styles.nutritionItem}>
                                        <span className={styles.nutritionLabel}>단백질</span>
                                        <span className={styles.nutritionValue}>{selectedMeal.proteinG || "-"} g</span>
                                    </div>
                                    <div className={styles.nutritionItem}>
                                        <span className={styles.nutritionLabel}>지방</span>
                                        <span className={styles.nutritionValue}>{selectedMeal.fatG || "-"} g</span>
                                    </div>
                                </div>
                            </div>

                            {/* 재료 정보 */}
                            {parseIngredients(selectedMeal.ingredientsJson).length > 0 && (
                                <div className={styles.ingredientsSection}>
                                    <h3>재료</h3>
                                    <ul className={styles.ingredientsList}>
                                        {parseIngredients(selectedMeal.ingredientsJson).map((ing, i) => (
                                            <li key={i} className={styles.ingredientItem}>
                                                <span className={styles.ingredientName}>
                                                    {ing.name} {ing.amount}{ing.unit}
                                                </span>
                                                {ing.calculatedPrice !== null && ing.calculatedPrice !== undefined ? (
                                                    <span className={styles.ingredientPrice}>
                                                        {ing.calculatedPrice.toLocaleString()}원
                                                    </span>
                                                ) : (
                                                    <span className={styles.ingredientPriceNa}>가격 정보 없음</span>
                                                )}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {/* 레시피 */}
                            <div className={styles.recipeSection}>
                                <h3>조리법</h3>
                                <ol className={styles.recipeSteps}>
                                    {parseRecipe(selectedMeal.aiRecipe).map((step, i) => (
                                        <li key={i}>{step}</li>
                                    ))}
                                </ol>
                            </div>
                        </div>
                        <div className={styles.modalFooter}>
                            <button className={styles.closeBtn} onClick={closeModal}>닫기</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MyMeal;