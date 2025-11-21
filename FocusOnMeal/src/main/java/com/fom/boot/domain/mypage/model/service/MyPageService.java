package com.fom.boot.domain.mypage.model.service;

import java.util.List;
import java.util.Map;

import com.fom.boot.app.mypage.dto.Allergy;
import com.fom.boot.app.mypage.dto.MyPageDashboardDTO;
import com.fom.boot.app.pricehistory.dto.PriceTrendResponse;
import com.fom.boot.common.pagination.PageInfo;
import com.fom.boot.domain.meal.model.vo.MealPlan;

public interface MyPageService {

	int logicalDeleteMealPlan(int planId);

	MyPageDashboardDTO getDashboardData(String memberId);

	PriceTrendResponse getPriceChartData(int ingredientId, int days);

	boolean updateMemberAllergies(String memberId, List<?> allergyIds);

	List<Integer> getMemberAllergies(String memberId);

	void saveUserAllergies(String memberId, List<Integer> allergyIds);

	List<Integer> getUserAllergyIds(String memberId);

	List<Allergy> getAllAllergies();

	// 내 식단 페이지
	Map<String, Object> getMyMealPlans(String memberId, int page);

	MealPlan getMealPlanDetail(int planId);

	// ====== 휴지통 기능 ======
	// 삭제된 식단 목록 조회
	List<MealPlan> getDeletedMealPlans(String memberId);

	// 삭제된 식단 개수
	int getDeletedMealCount(String memberId);

	// 식단 복원
	int restoreMealPlan(int planId);

	// 식단 영구 삭제
	int permanentDeleteMealPlan(int planId);

	// 휴지통 비우기 (일괄 영구 삭제)
	int emptyTrash(String memberId);

	// 30일 경과 식단 자동 영구 삭제
	int deleteExpiredMeals();

}
