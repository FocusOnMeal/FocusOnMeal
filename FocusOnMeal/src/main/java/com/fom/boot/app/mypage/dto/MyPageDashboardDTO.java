package com.fom.boot.app.mypage.dto;

import java.util.List;

import com.fom.boot.domain.meal.model.vo.MealPlan;
import com.fom.boot.domain.member.model.vo.Member;

import lombok.Data;

@Data
public class MyPageDashboardDTO {
	
	private Member memberInfo;
    private int favoriteIngredientCount;
    private int favoriteMealCount;
    private List<MealPlan> recentMeals;
	
}
