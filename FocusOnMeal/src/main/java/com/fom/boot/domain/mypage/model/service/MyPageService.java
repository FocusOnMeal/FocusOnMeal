package com.fom.boot.domain.mypage.model.service;

import com.fom.boot.app.mypage.dto.MyPageDashboardDTO;
import com.fom.boot.app.pricehistory.dto.PriceTrendResponse;

public interface MyPageService {

	int logicalDeleteMealPlan(int planId);

	MyPageDashboardDTO getDashboardData(String memberId);

	PriceTrendResponse getPriceChartData(int ingredientId, int days);

}
