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

	// 내 식단 페이지 (페이지네이션)
	List<MealPlan> selectMyMealPlans(@Param("memberId") String memberId,
									 @Param("startRow") int startRow,
									 @Param("endRow") int endRow);

	// 식단 상세 조회
	MealPlan selectMealPlanById(@Param("planId") int planId);

	// ====== 휴지통 기능 ======
	// 삭제된 식단 목록 조회
	List<MealPlan> selectDeletedMealPlans(@Param("memberId") String memberId);

	// 삭제된 식단 개수
	int countDeletedMealPlans(@Param("memberId") String memberId);

	// 식단 복원 (IS_DELETED = 'N')
	int restoreMealPlan(@Param("planId") int planId);

	// 식단 영구 삭제
	int permanentDeleteMealPlan(@Param("planId") int planId);

	// 휴지통 비우기 (일괄 영구 삭제)
	int permanentDeleteAllDeletedMeals(@Param("memberId") String memberId);

	// 30일 경과 식단 자동 영구 삭제
	int permanentDeleteExpiredMeals();

	List<Integer> getUserAllergyIds(String memberId);

}
