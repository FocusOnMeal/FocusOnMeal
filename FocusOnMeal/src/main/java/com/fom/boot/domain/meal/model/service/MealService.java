package com.fom.boot.domain.meal.model.service;

import com.fom.boot.domain.meal.model.vo.MealPlan;

public interface MealService {

    /**
     * 식단 저장
     * @param mealPlan 저장할 식단 정보
     * @return 저장 성공 여부
     */
    boolean saveMealPlan(MealPlan mealPlan);
}
