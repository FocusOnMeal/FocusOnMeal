package com.fom.boot.app.mypage.dto;

import java.util.List;

import com.fom.boot.app.pricehistory.dto.PriceTrendResponse;
import com.fom.boot.domain.meal.model.vo.MealPlan;
import com.fom.boot.domain.member.model.vo.Member;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class MyPageDashboardDTO {
	
	private Member memberInfo;
    private int favoriteIngredientCount;
    private int favoriteMealCount;
    private List<MealPlan> recentMeals;
	
    private List<FavoriteIngredientSummaryDTO> favoriteIngredients;
    private List<MealPlanSummaryDTO> mealPlans;
    private PriceTrendResponse defaultPriceChart;
}
