import { useState, useEffect, useRef } from "react";
import "./MealPlan.css";
import Footer from "../../components/common/Footer" 

const MealPlan = () => {
    // 상태 관리
    const [height, setHeight] = useState(170);
    const [weight, setWeight] = useState(70);
    const [allergies, setAllergies] = useState([]);
    const [allergyList, setAllergyList] = useState([]); // DB에서 가져올 알레르기 목록
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

    // DB에서 알레르기 목록 가져오기
    useEffect(() => {
        const fetchAllergyList = async () => {
            try {
                const response = await fetch("http://localhost:8080/api/mypage/allergy/list");
                if (response.ok) {
                    const data = await response.json();
                    // API 응답을 화면에 맞게 변환 (allergyId, allergyName, category)
                    const formattedList = data.map(allergy => ({
                        id: allergy.allergyId,
                        value: allergy.allergyName,
                        label: allergy.allergyName
                    }));
                    setAllergyList(formattedList);
                } else {
                    console.error("알레르기 목록 조회 실패");
                }
            } catch (error) {
                console.error("알레르기 목록 조회 오류:", error);
            }
        };

        fetchAllergyList();
    }, []);

    // 사용자가 저장한 알레르기 정보 가져오기 (로그인 시)
    useEffect(() => {
        const fetchUserAllergies = async () => {
            const token = sessionStorage.getItem("token"); // ✅ localStorage → sessionStorage
            console.log("🔑 Token:", token ? "있음" : "없음");
            if (!token) return; // 로그인 안 했으면 skip

            try {
                const response = await fetch("http://localhost:8080/api/mypage/allergies", {
                    headers: {
                        "Authorization": `Bearer ${token}`
                    }
                });

                console.log("📥 사용자 알레르기 조회 응답 상태:", response.status);

                if (response.ok) {
                    const data = await response.json();
                    console.log("📥 사용자 알레르기 데이터:", data);
                    const allergyIds = data.allergies || [];
                    console.log("✅ 사용자 알레르기 ID 목록:", allergyIds);
                    console.log("📋 전체 알레르기 목록:", allergyList);

                    // allergyIds를 allergyName으로 변환
                    if (allergyList.length > 0 && allergyIds.length > 0) {
                        const selectedAllergies = allergyList
                            .filter(allergy => {
                                console.log(`체크: allergy.id=${allergy.id}, 포함여부=${allergyIds.includes(allergy.id)}`);
                                return allergyIds.includes(allergy.id);
                            })
                            .map(allergy => allergy.value);
                        console.log("✅ 선택된 알레르기:", selectedAllergies);
                        setAllergies(selectedAllergies);
                    }
                } else {
                    console.error("❌ 사용자 알레르기 조회 실패:", response.status);
                }
            } catch (error) {
                console.error("❌ 사용자 알레르기 조회 오류:", error);
            }
        };

        // allergyList가 로드된 후에만 실행
        console.log("📋 allergyList 길이:", allergyList.length);
        if (allergyList.length > 0) {
            fetchUserAllergies();
        }
    }, [allergyList]); // allergyList가 변경될 때마다 실행

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
        const token = sessionStorage.getItem("token"); // ✅ localStorage → sessionStorage
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
            // 재료 정보를 JSON 문자열로 변환
            const ingredientsJson = JSON.stringify(mealPlanToSave.ingredients);

            const requestBody = {
                planName: editablePlanName.trim(),
                servingSize: 1,
                mealType: mealPlanToSave.mealType,
                totalCost: mealPlanToSave.calculatedPrice,
                nutrition: mealPlanToSave.nutrition,
                recipe: recipeJson,
                ingredients: ingredientsJson
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
                <div className="page-header-center">
                <div className="page-title-wrapper">
                <div className="page-title">
                    <h1>맞춤 식단 추천</h1>
                </div>
                </div>
                </div>
                {/* <div className="divider">🌱</div> */}
                {/* <div className="hr-wave"></div> */}

                {/* 신체 정보 입력 */}
                <div className="input-section">
                    <div className="info-group">
                        <label> 신체 정보 설정</label>
                        <div className="input-row-styled">
                            
                            {/* 키 입력 카드 */}
                            <div className="input-card">
                                <div className="icon-wrapper">
                                    {/* 자(Ruler) 아이콘 */}
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M2 12h20M2 12l2-2m-2 2l2 2M22 12l-2-2m2 2l-2 2M6 10v4M10 10v4M14 10v4M18 10v4" />
                                    </svg>
                                </div>
                                
                                <div className="input-content">
                                    {/* 윗줄: 라벨과 숫자 입력 */}
                                    <div className="input-top-row">
                                        <span className="input-label">키 (Height)</span>
                                        <div className="input-value-box">
                                            <input
                                                type="number"
                                                value={height}
                                                onChange={(e) => setHeight(e.target.value)}
                                            />
                                            <span className="unit">cm</span>
                                        </div>
                                    </div>
                                    
                                    {/* 아랫줄: 슬라이더 */}
                                    <input 
                                        type="range" 
                                        min="100" 
                                        max="250" 
                                        value={height} 
                                        onChange={(e) => setHeight(e.target.value)} 
                                        className="range-slider"
                                    />
                                </div>
                            </div>

                            {/* 몸무게 입력 카드 */}
                            <div className="input-card">
                                <div className="icon-wrapper weight-icon">
                                    {/* 체중계 아이콘 */}
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M12 3a9 9 0 1 0 9 9 9 9 0 0 0-9-9z" />
                                        <path d="M12 7v5" />
                                        <path d="M12 16h.01" />
                                    </svg>
                                </div>

                                <div className="input-content">
                                    {/* 윗줄: 라벨과 숫자 입력 */}
                                    <div className="input-top-row">
                                        <span className="input-label">몸무게 (Weight)</span>
                                        <div className="input-value-box">
                                            <input
                                                type="number"
                                                value={weight}
                                                onChange={(e) => setWeight(e.target.value)}
                                            />
                                            <span className="unit">kg</span>
                                        </div>
                                    </div>
                                    
                                    {/* 아랫줄: 슬라이더 */}
                                    <input 
                                        type="range" 
                                        min="30" 
                                        max="200" 
                                        value={weight} 
                                        onChange={(e) => setWeight(e.target.value)} 
                                        className="range-slider"
                                    />
                                </div>
                            </div>

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
                                    <div className="robot-loader">
                                        <svg width="100" height="100" viewBox="0 0 100 100">
                                            {/* JSX에서는 class 대신 className 사용 */}
                                            <ellipse className="robot-shadow" cx="50" cy="90" rx="20" ry="4" fill="#ddd" />
                                            
                                            <g className="robot-body">
                                                {/* JSX에서는 stroke-width 대신 strokeWidth 사용 */}
                                                <path d="M30 35 C30 10, 70 10, 70 35 Z" fill="#fff" stroke="#67932A" strokeWidth="2"/>
                                                <line x1="30" y1="35" x2="70" y2="35" stroke="#67932A" strokeWidth="2"/>
                                                
                                                <rect x="30" y="35" width="40" height="35" rx="5" fill="#fff" stroke="#67932A" strokeWidth="2"/>
                                                
                                                <g className="robot-eyes">
                                                    <circle cx="43" cy="50" r="3" fill="#333"/>
                                                    <circle cx="57" cy="50" r="3" fill="#333"/>
                                                </g>
                                                
                                                {/* strokeLinecap 처럼 카멜케이스 적용됨 */}
                                                <path d="M45 60 Q50 63 55 60" fill="none" stroke="#333" strokeWidth="1.5" strokeLinecap="round"/>
                                                
                                                <rect x="25" y="45" width="5" height="10" rx="2" fill="#99A237"/>
                                                <rect x="70" y="45" width="5" height="10" rx="2" fill="#99A237"/>
                                                
                                                <line x1="50" y1="35" x2="50" y2="25" stroke="#67932A" strokeWidth="2"/>
                                                <circle cx="50" cy="22" r="3" fill="#ff6b6b" className="robot-antenna-light"/>
                                            </g>
                                        </svg>
                                    </div>
                                    
                                    <p className="loading-text">
                                        AI 셰프가 식단을 요리 중입니다
                                        <span className="dots">...</span>
                                    </p>
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
            <Footer/>
        </div>
    );
};

export default MealPlan;
