package com.fom.boot.domain.ingredient.model.vo;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

@Getter
@Setter
@ToString
@NoArgsConstructor
@AllArgsConstructor
public class Ingredient {
	private int 	ingredientId;      	// 식자재 아이디 	(PK)
    private String 	name;            	// 표준 품목명
    private String 	category;        	// 분류			(예: 곡류, 육류, 난류)
    private String 	standardUnit;    	// 기준 단위 		(예: kg 등)
    private String 	kamisItemCode;   	// KAMIS 품목코드 	(예: 213)
    private String 	kamisKindCode;   	// KAMIS 품종코드 	(예: 00)
    private String 	kamisItemCategoryCode; // KAMIS 부류코드 (예: 200)
}
