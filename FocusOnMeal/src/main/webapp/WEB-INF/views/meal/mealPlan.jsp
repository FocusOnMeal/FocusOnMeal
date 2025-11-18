<%@ page language="java" contentType="text/html; charset=UTF-8"
         pageEncoding="UTF-8"%>
<%@ taglib uri="http://java.sun.com/jsp/jstl/core" prefix="c" %>
<%@ taglib prefix="fmt" uri="http://java.sun.com/jsp/jstl/fmt" %>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport"
          content="width=device-width, user-scalable=no, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <title>AI 식단 추천</title>
    <link rel="stylesheet" href="/resources/css/meal/mealPlan.css">
</head>
<body>
<div class="container">
    <h1>맞춤 식단 추천</h1>
    <div class="divider"></div>

    <!-- 신체 정보 입력 -->
    <div class="input-section">
        <div class="info-group">
            <label>신체 정보 입력</label>
            <div class="input-row">
                <span>키 :</span>
                <input type="number" id="height" value="170" placeholder="170" min="100" max="250">
                <span>몸무게</span>
                <input type="number" id="weight" value="70" placeholder="70" min="30" max="200">
            </div>
        </div>
    </div>

    <!-- 알러지 정보 -->
    <div class="allergy-section">
        <label>알러지 정보</label>
        <div class="allergy-grid">
            <div class="checkbox-item">
                <input type="checkbox" id="allergy1" value="메밀">
                <label for="allergy1">메밀 없음</label>
            </div>
            <div class="checkbox-item">
                <input type="checkbox" id="allergy2" value="밀">
                <label for="allergy2">밀</label>
            </div>
            <div class="checkbox-item">
                <input type="checkbox" id="allergy3" value="대두">
                <label for="allergy3">대두(콩)</label>
            </div>
            <div class="checkbox-item">
                <input type="checkbox" id="allergy4" value="땅콩">
                <label for="allergy4">땅콩</label>
            </div>
            <div class="checkbox-item">
                <input type="checkbox" id="allergy5" value="호두">
                <label for="allergy5">호두</label>
            </div>
            <div class="checkbox-item">
                <input type="checkbox" id="allergy6" value="잣">
                <label for="allergy6">잣</label>
            </div>
            <div class="checkbox-item">
                <input type="checkbox" id="allergy7" value="고등어">
                <label for="allergy7">고등어</label>
            </div>
            <div class="checkbox-item">
                <input type="checkbox" id="allergy8" value="게">
                <label for="allergy8">게</label>
            </div>
            <div class="checkbox-item">
                <input type="checkbox" id="allergy9" value="새우">
                <label for="allergy9">새우</label>
            </div>
            <div class="checkbox-item">
                <input type="checkbox" id="allergy10" value="돼지고기">
                <label for="allergy10">돼지고기</label>
            </div>
            <div class="checkbox-item">
                <input type="checkbox" id="allergy11" value="복숭아">
                <label for="allergy11">복숭아</label>
            </div>
            <div class="checkbox-item">
                <input type="checkbox" id="allergy12" value="토마토">
                <label for="allergy12">토마토</label>
            </div>
            <div class="checkbox-item">
                <input type="checkbox" id="allergy13" value="아황산류">
                <label for="allergy13">아황산류</label>
            </div>
            <div class="checkbox-item">
                <input type="checkbox" id="allergy14" value="호두">
                <label for="allergy14">호두</label>
            </div>
            <div class="checkbox-item">
                <input type="checkbox" id="allergy15" value="닭고기">
                <label for="allergy15">닭고기</label>
            </div>
            <div class="checkbox-item">
                <input type="checkbox" id="allergy16" value="쇠고기">
                <label for="allergy16">쇠고기</label>
            </div>
            <div class="checkbox-item">
                <input type="checkbox" id="allergy17" value="오징어">
                <label for="allergy17">오징어</label>
            </div>
            <div class="checkbox-item">
                <input type="checkbox" id="allergy18" value="조개류">
                <label for="allergy18">조개류(전복, 홍합 포함)</label>
            </div>
        </div>
    </div>

    <!-- 메인 컨텐츠 -->
    <div class="main-content">
        <!-- AI 채팅 영역 -->
        <div class="chat-section">
            <div class="chat-title">채팅창</div>
            <div class="chat-box">
                <div id="chatPlaceholder">AI에게 식단 추천받기</div>
                <div id="chatMessages" class="chat-messages"></div>
                <div class="chat-input-area">
                    <input type="text" id="chatInput" class="chat-input" placeholder="ex) 건강한 한 끼 식사 추천해줘.">
                    <button id="chatSendBtn" class="chat-send-btn">전송</button>
                </div>
            </div>
            <button class="generate-btn" id="generateBtn" hidden="hidden"></button>
            <div id="errorMessage" class="error-message"></div>
        </div>

        <!-- 식단 결과 영역 -->
        <div class="result-section">
            <div class="result-header">
                <div>
                    <div class="result-title">식단 정보 보기</div>
                    <div class="result-subtitle"></div>
                </div>
            </div>
            <div class="result-box">
                <div id="loadingArea" class="loading">
                    <div class="spinner"></div>
                    <p>AI가 맞춤 식단을 생성하고 있습니다...</p>
                </div>

                <div id="mealPlanArea" class="meal-plan">
                    <!-- 여기에 JavaScript로 식단 그룹이 동적으로 추가됩니다 -->
                </div>

                <div style="text-align: center; color: #999; padding: 40px;" id="emptyState">
                    <p></p>
                    <p style="margin-top: 10px;"></p>
                </div>
            </div>
        </div>
    </div>
</div>

<!-- 저장 모달 -->
<div id="saveModal" class="modal">
    <div class="modal-content">
        <div class="modal-header">
            <h2>식단 저장하기</h2>
            <span class="modal-close">&times;</span>
        </div>
        <div class="modal-body">
            <div class="serving-input-group">
                <label for="servingSize">몇 인분 기준으로 저장하시겠습니까?</label>
                <div class="serving-controls">
                    <button class="serving-btn" id="decreaseBtn">-</button>
                    <input type="number" id="servingSize" value="1" min="1" max="10">
                    <button class="serving-btn" id="increaseBtn">+</button>
                    <span class="serving-label">인분</span>
                </div>
            </div>
            <div class="modal-info">
                <p>선택한 인분수에 맞춰 가격이 계산됩니다.</p>
            </div>
        </div>
        <div class="modal-footer">
            <button class="modal-btn cancel-btn" id="cancelSaveBtn">취소</button>
            <button class="modal-btn save-confirm-btn" id="confirmSaveBtn">저장</button>
        </div>
    </div>
</div>

<script src="/resources/js/meal/mealPlan.js"></script>
</body>
</html>