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
public class MealPlanSummaryDTO {
	private Long planId;
    private String planName;
    private BigDecimal totalCost;
    private Integer servingSize;
}
