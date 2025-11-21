package com.fom.boot.domain.ingredient.model.service.impl;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.fom.boot.app.ingredient.dto.IngredientDTO;
import com.fom.boot.app.mypage.dto.FavoriteIngredientSummaryDTO;
import com.fom.boot.domain.ingredient.model.mapper.IngredientMapper;
import com.fom.boot.domain.ingredient.model.mapper.IngredientPriceHistoryMapper;
import com.fom.boot.domain.ingredient.model.service.IngredientService;
import com.fom.boot.domain.ingredient.model.vo.FavoriteIngredient;
import com.fom.boot.domain.ingredient.model.vo.Ingredient;
import com.fom.boot.domain.ingredient.model.vo.PriceHistory;

@Service
@Transactional(readOnly = true)
public class IngredientServiceImpl implements IngredientService {
	
	private final IngredientMapper iMapper;
	private final IngredientPriceHistoryMapper priceHistoryMapper;
	
	@Autowired
	public IngredientServiceImpl(IngredientMapper iMapper,
			 					 IngredientPriceHistoryMapper priceHistoryMapper) {
		this.iMapper = iMapper;
		this.priceHistoryMapper = priceHistoryMapper;
	}
	
	// 찜 등록 및 해제
	@Override
    @Transactional
    public int insertFavorite(FavoriteIngredient favorite) {
        return iMapper.insertFavorite(favorite);
    }
    
    @Override
    @Transactional
    public int deleteFavorite(String memberId, int ingredientId) {
        return iMapper.deleteFavorite(memberId, ingredientId);
    }
    
    @Override
    public boolean checkFavoriteExists(String memberId, int ingredientId) {
        int count = iMapper.checkFavoriteExists(memberId, ingredientId);
        return count > 0;
    }
	
    @Override
    public List<IngredientDTO> getIngredientListWithPrice() {
        // 모든 식재료 조회 (최신 가격 포함)
        List<IngredientDTO> ingredients = iMapper.selectListWithLatestPrice();
        
        // 각 식재료에 대해 가격 변동률 계산
        return ingredients.stream().map(dto -> {
            
            // 현재 가격의 수집 날짜가 있는 경우만 처리
            if (dto.getCollectedDate() != null) {
                LocalDateTime currentDate = dto.getCollectedDate();
                
                // 현재 날짜의 시작 시간
                LocalDateTime currentDayStart = currentDate.toLocalDate().atStartOfDay();
                
                // 전날 범위 설정 (현재 데이터 수집일 기준 -1일)
                LocalDateTime previousDayStart = currentDayStart.minusDays(1);
                LocalDateTime previousDayEnd = currentDayStart;
                
                // 전날 가격 조회
                PriceHistory previousPrice = priceHistoryMapper.findLatestPriceByIngredientAndDateRange(
                    dto.getIngredientId(), previousDayStart, previousDayEnd);
                
                if (previousPrice != null) {
                    dto.setYesterdayPrice(previousPrice.getPriceValue());
                    dto.setYesterdayCollectedDate(previousPrice.getCollectedDate());
                    
                    // 가격 변동률 계산
                    if (dto.getCurrentPrice() != null && dto.getYesterdayPrice() > 0) {
                        double changePercent = ((dto.getCurrentPrice() - dto.getYesterdayPrice()) 
                                               / (double) dto.getYesterdayPrice()) * 100;
                        dto.setPriceChangePercent(Math.round(changePercent * 10) / 10.0);
                    }
                }
            }
            
            return dto;
        }).collect(Collectors.toList());
    }
	
	@Override
	public Ingredient getIngredientById(int id) {
		return iMapper.selectById(id);
	}
	
	@Override
	public List<PriceHistory> getPriceHistory(int id) {
		return priceHistoryMapper.getPriceHistoryByIngredientId(id);
	}

	@Override
	public List<FavoriteIngredientSummaryDTO> getFavoritesByMemberId(String memberId) {
		return iMapper.selectFavoritesByMemberId(memberId);
	}
}