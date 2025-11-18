package com.fom.boot.app.meal.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * 식단 영양 정보 DTO
 */
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MealNutrition {
    private String calories;  // 칼로리 (kcal)
    private String carbs;     // 탄수화물 (g)
    private String protein;   // 단백질 (g)
    private String fat;       // 지방 (g)
}