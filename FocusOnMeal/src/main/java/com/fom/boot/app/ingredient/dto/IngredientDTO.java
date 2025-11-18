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
    
    // DB에서 JOIN해서 가져올 추가 필드
    private Integer currentPrice;       // 최신 가격 (PRICE_VALUE)
    private LocalDateTime collectedDate; // 수집 날짜 (COLLECTED_DATE)
}