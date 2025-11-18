// API 기본 URL (실제 서버 주소로 변경 필요)
const API_BASE_URL = 'http://localhost:8080/api';

// DOM 요소
const heightInput = document.getElementById('height');
const weightInput = document.getElementById('weight');
const generateBtn = document.getElementById('generateBtn');
const chatMessages = document.getElementById('chatMessages');
const chatPlaceholder = document.getElementById('chatPlaceholder');
const chatInput = document.getElementById('chatInput');
const chatSendBtn = document.getElementById('chatSendBtn');
const loadingArea = document.getElementById('loadingArea');
const mealPlanArea = document.getElementById('mealPlanArea');
const emptyState = document.getElementById('emptyState');
const errorMessage = document.getElementById('errorMessage');

// 모달 요소
const saveModal = document.getElementById('saveModal');
const modalClose = document.querySelector('.modal-close');
const servingSizeInput = document.getElementById('servingSize');
const decreaseBtn = document.getElementById('decreaseBtn');
const increaseBtn = document.getElementById('increaseBtn');
const cancelSaveBtn = document.getElementById('cancelSaveBtn');
const confirmSaveBtn = document.getElementById('confirmSaveBtn');

// 알러지 정보 수집
function getAllergies() {
    const allergies = [];
    document.querySelectorAll('.checkbox-item input:checked').forEach(checkbox => {
        allergies.push(checkbox.value);
    });
    return allergies;
}

// 메시지 추가
function addMessage(text, type) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}`;
    messageDiv.textContent = text;
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// 식단 그룹 추가
function addMealPlanGroup(title, meals) {
    const groupDiv = document.createElement('div');
    groupDiv.className = 'meal-plan-group';

    const headerDiv = document.createElement('div');
    headerDiv.className = 'meal-plan-header';
    headerDiv.textContent = title;
    groupDiv.appendChild(headerDiv);

    meals.forEach(meal => {
        const mealItemDiv = document.createElement('div');
        mealItemDiv.className = 'meal-item';

        mealItemDiv.innerHTML = `
            <div class="meal-header">
                <span class="meal-name">${meal.name}</span>
                <div class="meal-buttons">
                    <button class="meal-btn">레시피</button>
                    <button class="meal-btn">대체식단</button>
                </div>
            </div>
            <div class="meal-info">
                <div><strong>탄수화물:</strong> <span>${meal.carbs || '0g'}</span></div>
                <div><strong>지방:</strong> <span>${meal.fat || '0g'}</span></div>
                <div><strong>칼로리:</strong> <span>${meal.calories || '0kcal'}</span></div>
                <div><strong>가격:</strong> <span>${meal.price || '0원'}</span></div>
            </div>
        `;

        groupDiv.appendChild(mealItemDiv);
    });

    // 저장 버튼 추가
    const saveBtn = document.createElement('button');
    saveBtn.className = 'save-btn';
    saveBtn.innerHTML = '<span>❤</span><span>저장하기</span>';
    saveBtn.addEventListener('click', () => {
        openSaveModal();
    });
    groupDiv.appendChild(saveBtn);

    mealPlanArea.appendChild(groupDiv);

    // 버튼 이벤트 다시 바인딩
    bindMealButtonEvents();
}

// 모달 열기
function openSaveModal() {
    servingSizeInput.value = 1;
    saveModal.classList.add('active');
}

// 모달 닫기
function closeSaveModal() {
    saveModal.classList.remove('active');
}

// 인분수 증가
function increaseServing() {
    const currentValue = parseInt(servingSizeInput.value);
    if (currentValue < 10) {
        servingSizeInput.value = currentValue + 1;
    }
}

// 인분수 감소
function decreaseServing() {
    const currentValue = parseInt(servingSizeInput.value);
    if (currentValue > 1) {
        servingSizeInput.value = currentValue - 1;
    }
}

// 저장 확인
function confirmSave() {
    const servingSize = servingSizeInput.value;
    alert(`${servingSize}인분 기준으로 식단이 저장되었습니다!`);
    // 실제로는 서버에 저장 API 호출
    closeSaveModal();
}

// 에러 표시
function showError(message) {
    errorMessage.textContent = message;
    errorMessage.classList.add('active');
    setTimeout(() => {
        errorMessage.classList.remove('active');
    }, 5000);
}

// 현재 식단 데이터 저장 (레시피 모달용)
let currentMealPlan = null;

// 식단 생성 (채팅 또는 버튼 클릭)
async function generateMeal(message) {
    const height = heightInput.value;
    const weight = weightInput.value;
    const allergies = getAllergies();

    // 유효성 검사
    if (!height || !weight) {
        showError('키와 몸무게를 입력해주세요.');
        return;
    }

    if (height < 100 || height > 250) {
        showError('키는 100cm ~ 250cm 사이로 입력해주세요.');
        return;
    }

    if (weight < 30 || weight > 200) {
        showError('몸무게는 30kg ~ 200kg 사이로 입력해주세요.');
        return;
    }

    // UI 초기화
    chatPlaceholder.style.display = 'none';
    chatMessages.classList.add('active');
    loadingArea.classList.add('active');
    emptyState.style.display = 'none';
    generateBtn.disabled = true;

    // 사용자 메시지 추가
    addMessage(message, 'user');

    try {
        // API 호출
        const response = await fetch(`${API_BASE_URL}/chat/meal-recommendation`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                height: parseInt(height),
                weight: parseInt(weight),
                servingSize: 1,
                allergies: allergies,
                message: message
            })
        });

        if (!response.ok) {
            throw new Error('API 호출 실패');
        }

        const data = await response.json();

        // 로딩 종료
        loadingArea.classList.remove('active');

        if (data.status === 'SUCCESS') {
            // AI 응답 메시지 추가
            addMessage(`${data.mealPlan.mealName}을(를) 추천해드렸습니다!`, 'ai');

            // 식단 카드 표시
            displayMealCard(data.mealPlan);
        } else {
            throw new Error(data.message || 'AI 응답 오류');
        }

    } catch (error) {
        console.error('Error:', error);
        loadingArea.classList.remove('active');
        emptyState.style.display = 'block';
        addMessage('죄송합니다. 식단 생성 중 오류가 발생했습니다.', 'ai');
        showError('식단 생성에 실패했습니다. 다시 시도해주세요.');
    } finally {
        generateBtn.disabled = false;
    }
}

// 식단 카드 표시
function displayMealCard(mealPlan) {
    mealPlanArea.classList.add('active');
    emptyState.style.display = 'none';

    const cardDiv = document.createElement('div');
    cardDiv.className = 'meal-card';

    cardDiv.innerHTML = `
        <div class="meal-card-header">
            <h3>${mealPlan.mealName}</h3>
            <span class="meal-type-badge">${mealPlan.mealType}</span>
        </div>
        <p class="meal-description">${mealPlan.description}</p>

        <div class="meal-info-grid">
            <div class="info-item">
                <span class="info-label">예상 가격</span>
                <span class="info-value">${mealPlan.calculatedPrice.toLocaleString()}원</span>
            </div>
            <div class="info-item">
                <span class="info-label">칼로리</span>
                <span class="info-value">${mealPlan.nutrition?.calories || '-'} kcal</span>
            </div>
            <div class="info-item">
                <span class="info-label">탄수화물</span>
                <span class="info-value">${mealPlan.nutrition?.carbs || '-'} g</span>
            </div>
            <div class="info-item">
                <span class="info-label">단백질</span>
                <span class="info-value">${mealPlan.nutrition?.protein || '-'} g</span>
            </div>
            <div class="info-item">
                <span class="info-label">지방</span>
                <span class="info-value">${mealPlan.nutrition?.fat || '-'} g</span>
            </div>
        </div>

        <div class="ingredients-section">
            <h4>재료</h4>
            <ul class="ingredients-list">
                ${mealPlan.ingredients.map(ing => `
                    <li>${ing.name} ${ing.amount}${ing.unit}</li>
                `).join('')}
            </ul>
        </div>

        <div class="meal-card-buttons">
            <button class="meal-btn recipe-btn">
                <span>📖</span> 레시피 보기
            </button>
            <button class="meal-btn save-btn-card">
                <span>❤</span> 저장하기
            </button>
        </div>
    `;

    mealPlanArea.appendChild(cardDiv);

    // 버튼 이벤트 리스너 추가 (각 카드의 mealPlan을 클로저로 캡처)
    const recipeBtn = cardDiv.querySelector('.recipe-btn');
    const saveBtn = cardDiv.querySelector('.save-btn-card');

    recipeBtn.addEventListener('click', () => {
        showRecipeModal(mealPlan);
    });

    saveBtn.addEventListener('click', () => {
        alert('저장 기능은 준비 중입니다');
    });
}

// 식단 생성 버튼 클릭
generateBtn.addEventListener('click', () => {
    generateMeal('건강한 식단을 추천해주세요');
});

// 버튼 이벤트 바인딩
function bindMealButtonEvents() {
    document.querySelectorAll('.meal-btn').forEach(btn => {
        btn.removeEventListener('click', handleMealButtonClick);
        btn.addEventListener('click', handleMealButtonClick);
    });
}

function handleMealButtonClick(e) {
    const btnText = e.target.textContent;
    const mealName = e.target.closest('.meal-item').querySelector('.meal-name').textContent;

    if (btnText === '레시피') {
        alert(`${mealName}의 레시피 페이지로 이동합니다.`);
        // 실제로는 레시피 페이지로 이동
        // window.location.href = '/recipe?meal=' + mealName;
    } else if (btnText === '대체식단') {
        alert(`${mealName}의 대체 식단을 찾고 있습니다.`);
        // 실제로는 대체 식단 API 호출
    }
}

// 레시피 모달 표시
function showRecipeModal(mealPlan) {
    if (!mealPlan || !mealPlan.recipe) {
        alert('레시피 정보가 없습니다.');
        return;
    }

    // 기존 모달이 있으면 제거
    const existingModal = document.getElementById('recipeModal');
    if (existingModal) {
        existingModal.remove();
    }

    // 레시피 모달 생성
    const modal = document.createElement('div');
    modal.id = 'recipeModal';
    modal.className = 'modal active';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h2>${mealPlan.mealName} 레시피</h2>
                <span class="modal-close" onclick="closeRecipeModal()">&times;</span>
            </div>
            <div class="modal-body">
                <h3>재료</h3>
                <ul class="recipe-ingredients">
                    ${mealPlan.ingredients.map(ing => `
                        <li>${ing.name} ${ing.amount}${ing.unit}</li>
                    `).join('')}
                </ul>

                <h3>조리법</h3>
                <ol class="recipe-steps">
                    ${mealPlan.recipe.map(step => `
                        <li>${step}</li>
                    `).join('')}
                </ol>
            </div>
            <div class="modal-footer">
                <button class="modal-btn cancel-btn" onclick="closeRecipeModal()">닫기</button>
            </div>
        </div>
    `;

    document.body.appendChild(modal);

    // 모달 바깥 클릭 시 닫기
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeRecipeModal();
        }
    });
}

// 레시피 모달 닫기
function closeRecipeModal() {
    const modal = document.getElementById('recipeModal');
    if (modal) {
        modal.remove();
    }
}

// 채팅 전송 함수 (활성화)
function sendChatMessage() {
    const message = chatInput.value.trim();

    if (!message) {
        return;
    }

    // 입력창 초기화
    chatInput.value = '';

    // 식단 생성 함수 호출
    generateMeal(message);
}

// 채팅 전송 버튼 클릭
chatSendBtn.addEventListener('click', sendChatMessage);

// Enter 키로 전송
chatInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        sendChatMessage();
    }
});

// 모달 이벤트 리스너
modalClose.addEventListener('click', closeSaveModal);
cancelSaveBtn.addEventListener('click', closeSaveModal);
confirmSaveBtn.addEventListener('click', confirmSave);
decreaseBtn.addEventListener('click', decreaseServing);
increaseBtn.addEventListener('click', increaseServing);

// 모달 바깥 클릭 시 닫기
saveModal.addEventListener('click', (e) => {
    if (e.target === saveModal) {
        closeSaveModal();
    }
});