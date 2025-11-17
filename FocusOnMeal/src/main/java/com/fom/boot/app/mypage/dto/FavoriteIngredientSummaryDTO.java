package com.fom.boot.app.mypage.dto;

import java.math.BigDecimal;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class FavoriteIngredientSummaryDTO {
	private Long favoriteId;
    private Long ingredientId;
    private String name;
    private String isCustom; 		// 'Y' or 'N'
    private BigDecimal currentPrice; 	// 최신 가격 (int로 변경)
    private String standardUnit;
}
