package com.fom.boot.app.meal.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

import java.util.List;

/**
 * 식단 저장 요청 DTO
 */
@Getter
@Setter
@ToString
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SaveMealPlanRequest {
    private String planName;           // 사용자가 입력한 식단 명칭
    private int servingSize;           // 인분 수
    private String mealType;           // 식사 타입 (아침, 점심, 저녁)
    private int totalCost;             // 총 비용
    private MealNutrition nutrition;   // 영양 정보
    private String recipe;             // AI 레시피 (JSON 문자열)
}