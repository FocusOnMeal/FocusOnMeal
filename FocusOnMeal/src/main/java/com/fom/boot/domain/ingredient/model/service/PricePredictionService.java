package com.fom.boot.domain.ingredient.model.service;

import com.fom.boot.app.ingredient.dto.PricePredictionDTO;

/**
 * 가격 예측 서비스 인터페이스
 */
public interface PricePredictionService {

    /**
     * 식재료의 미래 가격 예측
     * @param ingredientId 식재료 ID
     * @param days 예측할 일수 (기본 3일)
     * @param isAuthenticated 로그인 여부
     * @return 가격 예측 결과
     */
    PricePredictionDTO predictPrice(int ingredientId, int days, boolean isAuthenticated);
}