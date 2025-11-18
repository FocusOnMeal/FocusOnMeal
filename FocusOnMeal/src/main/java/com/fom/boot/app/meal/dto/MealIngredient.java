package com.fom.boot.app.meal.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * 식단 재료 DTO
 */
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MealIngredient {
    private String name;             // 재료명
    private String amount;           // 수량
    private String unit;             // 단위
    private Integer price;           // DB에서 조회한 가격 (원/kg 또는 원/개)
    private Integer calculatedPrice; // 실제 계산된 가격 (해당 수량 기준)
}
