package com.fom.boot.domain.mypage.model.service.impl;

import java.time.LocalDate;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.fom.boot.app.mypage.dto.Allergy;
import com.fom.boot.app.mypage.dto.FavoriteIngredientSummaryDTO;
import com.fom.boot.app.mypage.dto.MealPlanSummaryDTO;
import com.fom.boot.app.mypage.dto.MyPageDashboardDTO;
import com.fom.boot.app.pricehistory.dto.PriceTrendResponse;
import com.fom.boot.domain.member.model.vo.Member;
import com.fom.boot.domain.mypage.model.mapper.MyPageMapper;
import com.fom.boot.domain.mypage.model.service.MyPageService;
import com.fom.boot.domain.pricehistory.model.service.PriceHistoryService;
import com.fom.boot.domain.pricehistory.model.service.impl.PriceHistoryServiceImpl;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class MyPageServiceImpl implements MyPageService {
	
	private final MyPageMapper mMapper;
	private final PriceHistoryService priceHistoryService;

	@Override
	@Transactional
	public int logicalDeleteMealPlan(int planId) {
		return mMapper.logicalDeleteMealPlan(planId);
	}

//	@Override
//	public MyPageDashboardDTO getDashboardData(String memberId) {
//		MyPageDashboardDTO dto = new MyPageDashboardDTO();
//        dto.setMemberInfo(mMapper.getMemberInfo(memberId));
//        dto.setFavoriteIngredientCount(mMapper.getFavoriteIngredientCount(memberId));
//        dto.setFavoriteMealCount(mMapper.getFavoriteMealCount(memberId));
//        dto.setRecentMeals(mMapper.getRecentMeals(memberId));
//        return dto;
//	}
	
	@Transactional(readOnly = true)
    public MyPageDashboardDTO getDashboardData(String memberId) {
        
        MyPageDashboardDTO dashboard = new MyPageDashboardDTO();
        
        // 1. 회원 정보 조회
        Member memberInfo = mMapper.findMemberInfo(memberId);
        dashboard.setMemberInfo(memberInfo);
        
        // 2. 찜한 식자재 목록 조회 (상위 10개)
        List<FavoriteIngredientSummaryDTO> favoriteIngredients = 
        		mMapper.findFavoriteIngredientSummary(memberId, 10);
        dashboard.setFavoriteIngredients(favoriteIngredients);
        dashboard.setFavoriteIngredientCount(
        		mMapper.countFavoriteIngredients(memberId)
        );
        
        // 3. 식단 목록 조회 (상위 10개)
        List<MealPlanSummaryDTO> mealPlans = 
        		mMapper.findMealPlanSummary(memberId, 10);
        dashboard.setMealPlans(mealPlans);
        dashboard.setFavoriteMealCount(
        		mMapper.countMealPlans(memberId)
        );
        
        // 4. 기본 표시할 물가 추이 그래프 (첫번째 찜한 식자재)
        // 기존 PriceHistoryService 재사용!
        if (!favoriteIngredients.isEmpty()) {
            try {
                int firstIngredientId = favoriteIngredients.get(0).getIngredientId().intValue();
                
                // 최근 30일 일별 데이터 조회
                LocalDate endDate = LocalDate.now();
                LocalDate startDate = endDate.minusDays(30);
                
                PriceTrendResponse priceChart = priceHistoryService.getPriceTrend(
                    firstIngredientId,
                    "DAILY",      // 일별 데이터
                    startDate,
                    endDate,
                    null,         // 모든 가격 유형
                    null          // 모든 지역
                );
                
                dashboard.setDefaultPriceChart(priceChart);
            } catch (Exception e) {
                // 가격 데이터가 없는 경우 null로 유지
                log.warn("첫번째 식자재의 가격 차트 조회 실패: {}", e.getMessage());
            }
        }
        
        return dashboard;
    }

	@Transactional(readOnly = true)
	public PriceTrendResponse getPriceChartData(int ingredientId, int days) {
		LocalDate endDate = LocalDate.now();
        LocalDate startDate = endDate.minusDays(days);
        
        // period를 일수에 따라 자동 결정
        String period;
        if (days <= 7) {
            period = "DAILY";
        } else if (days <= 60) {
            period = "DAILY";  // 2개월까지는 일별
        } else {
            period = "WEEKLY"; // 그 이상은 주별
        }
        
        return priceHistoryService.getPriceTrend(
            ingredientId,
            period,
            startDate,
            endDate,
            null,  // 모든 가격 유형
            null   // 모든 지역
        );
    }

	@Override
	public boolean updateMemberAllergies(String memberId, List<?> allergyIds) {
		// 기존 알레르기 전체 삭제
		mMapper.deleteMemberAllergies(memberId);

	    // 새 알레르기 입력
	    if (allergyIds != null && !allergyIds.isEmpty()) {
	    	mMapper.insertMemberAllergies(memberId, allergyIds);
	    }

	    return true;
	}

	@Override
	public List<Integer> getMemberAllergies(String memberId) {
		return mMapper.findMemberAllergies(memberId);
	}

	@Override
	public void saveUserAllergies(String memberId, List<Integer> allergyIds) {
		mMapper.deleteUserAllergies(memberId);

	    // 2) 새로운 알레르기 입력
	    if (allergyIds != null && !allergyIds.isEmpty()) {
	        for (Integer allergyId : allergyIds) {
	        	mMapper.insertUserAllergy(memberId, allergyId);
	        }
	    }
		
	}

	@Override
	public List<Integer> getUserAllergyIds(String memberId) {
		return mMapper.getUserAllergyIds(memberId);
	}

	@Override
	public List<Allergy> getAllAllergies() {
	    return mMapper.getAllAllergies();  // 그대로 반환
	}
}
