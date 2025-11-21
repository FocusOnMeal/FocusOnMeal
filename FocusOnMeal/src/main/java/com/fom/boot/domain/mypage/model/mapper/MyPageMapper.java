package com.fom.boot.domain.mypage.model.mapper;

import java.util.List;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import com.fom.boot.app.mypage.dto.Allergy;
import com.fom.boot.app.mypage.dto.FavoriteIngredientSummaryDTO;
import com.fom.boot.app.mypage.dto.MealPlanSummaryDTO;
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

	// 대시보드 2
	Member findMemberInfo(String memberId);
	List<FavoriteIngredientSummaryDTO> findFavoriteIngredientSummary(@Param("memberId") String memberId, @Param("limit") int limit);
	int countFavoriteIngredients(@Param("memberId") String memberId);
	List<MealPlanSummaryDTO> findMealPlanSummary(@Param("memberId") String memberId, @Param("limit") int limit);
	int countMealPlans(@Param("memberId") String memberId);

	void deleteMemberAllergies(String memberId);

	void insertMemberAllergies(
		    @Param("memberId") String memberId,
		    @Param("list") List<?> allergyIds
		);

	List<Integer> findMemberAllergies(String memberId);

	List<Allergy> getAllAllergies();

	int insertUserAllergy(@Param("memberId") String memberId,
            					@Param("allergyId") int allergyId);

	void deleteUserAllergies(String memberId);

	List<Integer> getUserAllergyIds(String memberId);

}
