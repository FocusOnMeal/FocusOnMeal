package com.fom.boot.domain.mypage.model.service;

import com.fom.boot.app.mypage.dto.MyPageDashboardDTO;

public interface MyPageService {

	int logicalDeleteMealPlan(int planId);

	MyPageDashboardDTO getDashboardData(String memberId);

}
