package com.fom.boot.app.ingredient.dto;

import com.fom.boot.domain.ingredient.model.vo.Ingredient;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
public class IngredientDTO extends Ingredient {
    
	// 현재 가격 정보
    private Integer currentPrice;        // 최신 가격
    private LocalDateTime collectedDate; // 최신 수집일

    private Integer previousPrice;          // 직전 가격 (날짜 무관, 바로 이전 데이터)
    private LocalDateTime previousCollectedDate; // 직전 가격 수집일
    
    private Double priceChangePercent;      // 가격 변동률 (%)
}