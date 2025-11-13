package com.fom.boot.domain.mypage.model.service.impl;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.fom.boot.app.mypage.dto.MyPageDashboardDTO;
import com.fom.boot.domain.mypage.model.mapper.MyPageMapper;
import com.fom.boot.domain.mypage.model.service.MyPageService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class MyPageServiceImpl implements MyPageService {
	
	private final MyPageMapper mMapper;

	@Override
	@Transactional
	public int logicalDeleteMealPlan(int planId) {
		return mMapper.logicalDeleteMealPlan(planId);
	}

	@Override
	public MyPageDashboardDTO getDashboardData(String memberId) {
		MyPageDashboardDTO dto = new MyPageDashboardDTO();
        dto.setMemberInfo(mMapper.getMemberInfo(memberId));
        dto.setFavoriteIngredientCount(mMapper.getFavoriteIngredientCount(memberId));
        dto.setFavoriteMealCount(mMapper.getFavoriteMealCount(memberId));
        dto.setRecentMeals(mMapper.getRecentMeals(memberId));
        return dto;
	}
}
