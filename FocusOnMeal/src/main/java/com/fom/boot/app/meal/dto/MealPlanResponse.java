package com.fom.boot.app.meal.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * 식단 추천 응답 DTO
 */
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MealPlanResponse {
    private String mealName;           // 식단 이름
    private String mealType;           // 아침/점심/저녁
    private String description;        // 식단 설명
    private List<MealIngredient> ingredients;  // 재료 목록
    private List<String> recipe;       // 조리법
    private MealNutrition nutrition;   // 영양 정보
    private Integer calculatedPrice;   // DB 기반 계산된 가격
    private Integer estimatedPrice;    // AI 예상 가격
}
