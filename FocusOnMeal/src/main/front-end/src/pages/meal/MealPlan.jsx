import { useState, useEffect, useRef } from "react";
import "./MealPlan.css";

const MealPlan = () => {
    // 상태 관리
    const [height, setHeight] = useState(170);
    const [weight, setWeight] = useState(70);
    const [allergies, setAllergies] = useState([]);
    const [chatMessages, setChatMessages] = useState([]);
    const [chatInput, setChatInput] = useState("");
    const [mealPlans, setMealPlans] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [showSaveModal, setShowSaveModal] = useState(false);
    const [showRecipeModal, setShowRecipeModal] = useState(false);
    const [selectedRecipe, setSelectedRecipe] = useState(null);
    const [mealPlanToSave, setMealPlanToSave] = useState(null);
    const [editablePlanName, setEditablePlanName] = useState("");

    // Refs
    const resultBoxRef = useRef(null);
    const lastMealCardRef = useRef(null);

    // 새로운 식단 카드가 추가되면 자동 스크롤
    useEffect(() => {
        if (mealPlans.length > 0 && lastMealCardRef.current) {
            // 부드러운 스크롤 애니메이션과 함께 마지막 카드로 이동
            setTimeout(() => {
                lastMealCardRef.current?.scrollIntoView({
                    behavior: 'smooth',
                    block: 'nearest'
                });
            }, 100); // 카드 렌더링 후 스크롤
        }
    }, [mealPlans]);

    // 알러지 목록
    const allergyList = [
        { id: 1, value: "메밀", label: "메밀 없음" },
        { id: 2, value: "밀", label: "밀" },
        { id: 3, value: "대두", label: "대두(콩)" },
        { id: 4, value: "땅콩", label: "땅콩" },
        { id: 5, value: "호두", label: "호두" },
        { id: 6, value: "잣", label: "잣" },
        { id: 7, value: "고등어", label: "고등어" },
        { id: 8, value: "게", label: "게" },
        { id: 9, value: "새우", label: "새우" },
        { id: 10, value: "돼지고기", label: "돼지고기" },
        { id: 11, value: "복숭아", label: "복숭아" },
        { id: 12, value: "토마토", label: "토마토" },
        { id: 13, value: "아황산류", label: "아황산류" },
        { id: 14, value: "호두", label: "호두" },
        { id: 15, value: "닭고기", label: "닭고기" },
        { id: 16, value: "쇠고기", label: "쇠고기" },
        { id: 17, value: "오징어", label: "오징어" },
        { id: 18, value: "조개류", label: "조개류(전복, 홍합 포함)" }
    ];

    // 알러지 체크박스 핸들러
    const handleAllergyChange = (value) => {
        setAllergies(prev =>
            prev.includes(value)
                ? prev.filter(a => a !== value)
                : [...prev, value]
        );
    };

    // 에러 표시
    const showError = (message) => {
        setError(message);
        setTimeout(() => setError(""), 5000);
    };

    // 메시지 추가
    const addMessage = (text, type) => {
        setChatMessages(prev => [...prev, { text, type }]);
    };

    // 식단 생성
    const generateMeal = async (message) => {
        // 유효성 검사
        if (!height || !weight) {
            showError("키와 몸무게를 입력해주세요.");
            return;
        }

        if (height < 100 || height > 250) {
            showError("키는 100cm ~ 250cm 사이로 입력해주세요.");
            return;
        }

        if (weight < 30 || weight > 200) {
            showError("몸무게는 30kg ~ 200kg 사이로 입력해주세요.");
            return;
        }

        setLoading(true);
        addMessage(message, "user");

        // 이전 가격 확인 (더 저렴한 식단 요청 시 사용)
        const priceKeywords = ["더 싼", "저렴한", "싸게", "싼", "가성비", "경제적", "저가"];
        const needsCheaperMeal = priceKeywords.some(keyword => message.includes(keyword));
        const lastPrice = mealPlans.length > 0 ? mealPlans[mealPlans.length - 1].calculatedPrice : null;

        try {
            const requestBody = {
                height: parseInt(height),
                weight: parseInt(weight),
                servingSize: 1,
                allergies: allergies,
                message: message
            };

            // 저렴한 식단을 요청하고 이전 식단이 있으면 previousPrice 추가
            if (needsCheaperMeal && lastPrice) {
                requestBody.previousPrice = lastPrice;
            }

            const response = await fetch("http://localhost:8080/api/chat/meal-recommendation", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(requestBody)
            });

            if (!response.ok) {
                throw new Error("API 호출 실패");
            }

            const data = await response.json();

            if (data.status === "SUCCESS") {
                addMessage(`${data.mealPlan.mealName}을(를) 추천해드렸습니다!`, "ai");
                setMealPlans(prev => [...prev, data.mealPlan]);
            } else {
                throw new Error(data.message || "AI 응답 오류");
            }

        } catch (error) {
            console.error("Error:", error);
            addMessage("죄송합니다. 식단 생성 중 오류가 발생했습니다.", "ai");
            showError("식단 생성에 실패했습니다. 다시 시도해주세요.");
        } finally {
            setLoading(false);
        }
    };

    // 채팅 전송
    const sendChatMessage = () => {
        const message = chatInput.trim();
        if (!message) return;

        setChatInput("");
        generateMeal(message);
    };

    // Enter 키 핸들러
    const handleKeyPress = (e) => {
        if (e.key === "Enter") {
            sendChatMessage();
        }
    };

    // 레시피 모달 열기
    const openRecipeModal = (mealPlan) => {
        if (!mealPlan || !mealPlan.recipe) {
            alert("레시피 정보가 없습니다.");
            return;
        }
        setSelectedRecipe(mealPlan);
        setShowRecipeModal(true);
    };

    // 저장 모달
    const openSaveModal = (mealPlan) => {
        if (!mealPlan) {
            alert("저장할 식단 정보가 없습니다.");
            return;
        }
        setMealPlanToSave(mealPlan);
        setEditablePlanName(mealPlan.mealName); // 기본값으로 추천된 식단 이름 설정
        setShowSaveModal(true);
    };

    const confirmSave = async () => {
        // 식단명 유효성 검사
        if (!editablePlanName.trim()) {
            alert("식단 명칭을 입력해주세요.");
            return;
        }

        // 로그인 확인
        const token = localStorage.getItem("token");
        console.log("🔑 Token check:", token ? "토큰 있음" : "토큰 없음");
        console.log("🔑 Token value:", token);

        if (!token) {
            alert("로그인이 필요합니다.");
            setShowSaveModal(false);
            return;
        }

        try {
            // 레시피를 JSON 문자열로 변환
            const recipeJson = JSON.stringify(mealPlanToSave.recipe);

            const requestBody = {
                planName: editablePlanName.trim(),
                servingSize: 1,
                mealType: mealPlanToSave.mealType,
                totalCost: mealPlanToSave.calculatedPrice,
                nutrition: mealPlanToSave.nutrition,
                recipe: recipeJson
            };

            console.log("📤 Sending save request:", requestBody);

            const response = await fetch("http://localhost:8080/api/chat/save-meal", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify(requestBody)
            });

            console.log("📥 Response status:", response.status);
            const data = await response.json();
            console.log("📥 Response data:", data);

            if (response.ok && data.status === "SUCCESS") {
                alert(`"${editablePlanName}" 식단이 저장되었습니다!`);
                setShowSaveModal(false);
            } else {
                alert(data.message || "식단 저장에 실패했습니다.");
            }

        } catch (error) {
            console.error("❌ Error saving meal plan:", error);
            alert("식단 저장 중 오류가 발생했습니다: " + error.message);
        }
    };

    return (
        <div>
            <div className="container">
                <h1>맞춤 식단 추천</h1>
                <div className="divider"></div>

                {/* 신체 정보 입력 */}
                <div className="input-section">
                    <div className="info-group">
                        <label>신체 정보 입력</label>
                        <div className="input-row">
                            <span>키 :</span>
                            <input
                                type="number"
                                value={height}
                                onChange={(e) => setHeight(e.target.value)}
                                placeholder="170"
                                min="100"
                                max="250"
                            />
                            <span>몸무게</span>
                            <input
                                type="number"
                                value={weight}
                                onChange={(e) => setWeight(e.target.value)}
                                placeholder="70"
                                min="30"
                                max="200"
                            />
                        </div>
                    </div>
                </div>

                {/* 알러지 정보 */}
                <div className="allergy-section">
                    <label>알러지 정보</label>
                    <div className="allergy-grid">
                        {allergyList.map(allergy => (
                            <div key={allergy.id} className="checkbox-item">
                                <input
                                    type="checkbox"
                                    id={`allergy${allergy.id}`}
                                    value={allergy.value}
                                    checked={allergies.includes(allergy.value)}
                                    onChange={() => handleAllergyChange(allergy.value)}
                                />
                                <label htmlFor={`allergy${allergy.id}`}>{allergy.label}</label>
                            </div>
                        ))}
                    </div>
                </div>

                {/* 메인 컨텐츠 */}
                <div className="main-content">
                    {/* AI 채팅 영역 */}
                    <div className="chat-section">
                        <div className="chat-title">채팅창</div>
                        <div className="chat-box">
                            {chatMessages.length === 0 && (
                                <div id="chatPlaceholder">AI에게 식단 추천받기</div>
                            )}
                            <div className={`chat-messages ${chatMessages.length > 0 ? 'active' : ''}`}>
                                {chatMessages.map((msg, index) => (
                                    <div key={index} className={`message ${msg.type}`}>
                                        {msg.text}
                                    </div>
                                ))}
                            </div>
                            <div className="chat-input-area">
                                <input
                                    type="text"
                                    className="chat-input"
                                    placeholder="ex) 건강한 한 끼 식사 추천해줘."
                                    value={chatInput}
                                    onChange={(e) => setChatInput(e.target.value)}
                                    onKeyPress={handleKeyPress}
                                />
                                <button className="chat-send-btn" onClick={sendChatMessage}>
                                    전송
                                </button>
                            </div>
                        </div>
                        {error && <div className="error-message active">{error}</div>}
                    </div>

                    {/* 식단 결과 영역 */}
                    <div className="result-section">
                        <div className="result-header">
                            <div>
                                <div className="result-title">식단 정보 보기</div>
                                <div className="result-subtitle"></div>
                            </div>
                        </div>
                        <div className="result-box" ref={resultBoxRef}>
                            {loading && (
                                <div className="loading active">
                                    <div className="spinner"></div>
                                    <p>AI가 맞춤 식단을 생성하고 있습니다...</p>
                                </div>
                            )}

                            <div className={`meal-plan ${mealPlans.length > 0 ? 'active' : ''}`}>
                                {mealPlans.map((mealPlan, index) => (
                                    <div
                                        key={index}
                                        className="meal-card"
                                        ref={index === mealPlans.length - 1 ? lastMealCardRef : null}
                                    >
                                        <div className="meal-card-header">
                                            <h3>{mealPlan.mealName}</h3>
                                            <span className="meal-type-badge">{mealPlan.mealType}</span>
                                        </div>
                                        <p className="meal-description">{mealPlan.description}</p>

                                        <div className="meal-info-grid">
                                            <div className="info-item">
                                                <span className="info-label">예상 가격</span>
                                                <span className="info-value">{mealPlan.calculatedPrice.toLocaleString()}원</span>
                                            </div>
                                            <div className="info-item">
                                                <span className="info-label">칼로리</span>
                                                <span className="info-value">{mealPlan.nutrition?.calories || '-'} kcal</span>
                                            </div>
                                            <div className="info-item">
                                                <span className="info-label">탄수화물</span>
                                                <span className="info-value">{mealPlan.nutrition?.carbs || '-'} g</span>
                                            </div>
                                            <div className="info-item">
                                                <span className="info-label">단백질</span>
                                                <span className="info-value">{mealPlan.nutrition?.protein || '-'} g</span>
                                            </div>
                                            <div className="info-item">
                                                <span className="info-label">지방</span>
                                                <span className="info-value">{mealPlan.nutrition?.fat || '-'} g</span>
                                            </div>
                                        </div>

                                        <div className="ingredients-section">
                                            <h4>재료</h4>
                                            <ul className="ingredients-list">
                                                {mealPlan.ingredients.map((ing, i) => (
                                                    <li key={i}>{ing.name} {ing.amount}{ing.unit}</li>
                                                ))}
                                            </ul>
                                        </div>

                                        <div className="meal-card-buttons">
                                            <button className="meal-btn recipe-btn" onClick={() => openRecipeModal(mealPlan)}>
                                                <span>📖</span> 레시피 보기
                                            </button>
                                            <button className="meal-btn save-btn-card" onClick={() => openSaveModal(mealPlan)}>
                                                <span>❤</span> 저장하기
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {!loading && mealPlans.length === 0 && (
                                <div style={{textAlign: 'center', color: '#999', padding: '40px'}}>
                                    <p></p>
                                    <p style={{marginTop: '10px'}}></p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* 저장 모달 */}
            {showSaveModal && (
                <div className="modal active" onClick={(e) => e.target.className === 'modal active' && setShowSaveModal(false)}>
                    <div className="modal-content">
                        <div className="modal-header">
                            <h2>식단 저장하기</h2>
                            <span className="modal-close" onClick={() => setShowSaveModal(false)}>&times;</span>
                        </div>
                        <div className="modal-body">
                            <div className="plan-name-section">
                                <label htmlFor="planName">식단 명칭</label>
                                <input
                                    type="text"
                                    id="planName"
                                    className="plan-name-input"
                                    value={editablePlanName}
                                    onChange={(e) => setEditablePlanName(e.target.value)}
                                    placeholder="식단 이름을 입력하세요"
                                    maxLength="50"
                                />
                            </div>
                            {mealPlanToSave && (
                                <div className="modal-info">
                                    <p className="info-text">💰 예상 비용: <strong>{mealPlanToSave.calculatedPrice.toLocaleString()}원</strong> (1인분 기준)</p>
                                </div>
                            )}
                        </div>
                        <div className="modal-footer">
                            <button className="modal-btn cancel-btn" onClick={() => setShowSaveModal(false)}>취소</button>
                            <button className="modal-btn save-confirm-btn" onClick={confirmSave}>저장</button>
                        </div>
                    </div>
                </div>
            )}

            {/* 레시피 모달 */}
            {showRecipeModal && selectedRecipe && (
                <div className="modal active" onClick={(e) => e.target.className === 'modal active' && setShowRecipeModal(false)}>
                    <div className="modal-content">
                        <div className="modal-header">
                            <h2>{selectedRecipe.mealName} 레시피</h2>
                            <span className="modal-close" onClick={() => setShowRecipeModal(false)}>&times;</span>
                        </div>
                        <div className="modal-body">
                            <h3>재료</h3>
                            <ul className="recipe-ingredients">
                                {selectedRecipe.ingredients.map((ing, i) => (
                                    <li key={i}>
                                        <span className="ingredient-name">{ing.name} {ing.amount}{ing.unit}</span>
                                        {ing.calculatedPrice !== null && ing.calculatedPrice !== undefined ? (
                                            <span className="ingredient-price">({ing.calculatedPrice.toLocaleString()}원)</span>
                                        ) : (
                                            <span className="ingredient-price-na">(가격 정보 없음)</span>
                                        )}
                                    </li>
                                ))}
                            </ul>
                            <div className="ingredients-total">
                                <strong>총 재료비: {selectedRecipe.calculatedPrice.toLocaleString()}원</strong>
                            </div>

                            <h3>조리법</h3>
                            <ol className="recipe-steps">
                                {selectedRecipe.recipe.map((step, i) => (
                                    <li key={i}>{step}</li>
                                ))}
                            </ol>
                        </div>
                        <div className="modal-footer">
                            <button className="modal-btn cancel-btn" onClick={() => setShowRecipeModal(false)}>닫기</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MealPlan;
