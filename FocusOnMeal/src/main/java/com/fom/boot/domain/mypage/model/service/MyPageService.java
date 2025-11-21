package com.fom.boot.domain.mypage.model.service;

import java.util.List;

import com.fom.boot.app.mypage.dto.Allergy;
import com.fom.boot.app.mypage.dto.MyPageDashboardDTO;
import com.fom.boot.app.pricehistory.dto.PriceTrendResponse;

public interface MyPageService {

	int logicalDeleteMealPlan(int planId);

	MyPageDashboardDTO getDashboardData(String memberId);

	PriceTrendResponse getPriceChartData(int ingredientId, int days);

	boolean updateMemberAllergies(String memberId, List<?> allergyIds);

	List<Integer> getMemberAllergies(String memberId);

	void saveUserAllergies(String memberId, List<Integer> allergyIds);

	List<Integer> getUserAllergyIds(String memberId);

	List<Allergy> getAllAllergies();

}
