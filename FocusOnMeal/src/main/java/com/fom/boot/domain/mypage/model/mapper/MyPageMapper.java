package com.fom.boot.domain.mypage.model.mapper;

import java.util.List;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import com.fom.boot.domain.meal.model.vo.MealPlan;
import com.fom.boot.domain.member.model.vo.Member;

@Mapper
public interface MyPageMapper {

	int logicalDeleteMealPlan(@Param("planId") int planId);

	// 대시보드
	Member getMemberInfo(String memberId);
	int getFavoriteIngredientCount(String memberId);
	int getFavoriteMealCount(String memberId);
	List<MealPlan> getRecentMeals(String memberId);

}
