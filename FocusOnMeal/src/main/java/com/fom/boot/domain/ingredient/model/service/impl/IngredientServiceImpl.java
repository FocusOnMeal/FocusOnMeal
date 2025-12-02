package com.fom.boot.domain.ingredient.model.service.impl;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.fom.boot.app.admin.dto.AdminIngredientDTO;
import com.fom.boot.app.ingredient.dto.IngredientDTO;
import com.fom.boot.app.mypage.dto.FavoriteIngredientSummaryDTO;
import com.fom.boot.common.pagination.PageInfo;
import com.fom.boot.domain.ingredient.model.mapper.IngredientMapper;
import com.fom.boot.domain.ingredient.model.mapper.IngredientPriceHistoryMapper;
import com.fom.boot.domain.ingredient.model.service.IngredientService;
import com.fom.boot.domain.ingredient.model.vo.FavoriteIngredient;
import com.fom.boot.domain.ingredient.model.vo.Ingredient;
import com.fom.boot.domain.ingredient.model.vo.NutritionMaster;
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
	
	// 찜 등록
	@Override
    @Transactional
    public int insertFavorite(FavoriteIngredient favorite) {
        return iMapper.insertFavorite(favorite);
    }
    
	// 찜 해제
    @Override
    @Transactional
    public int deleteFavorite(String memberId, int ingredientId) {
        return iMapper.deleteFavorite(memberId, ingredientId);
    }
    
	// 찜 여부 확인
    @Override
    public boolean checkFavoriteExists(String memberId, int ingredientId) {
        int count = iMapper.checkFavoriteExists(memberId, ingredientId);
        return count > 0;
    }
	
    @Override
    public List<IngredientDTO> getIngredientListWithPrice() {
        /*
         * [수정 전]
         * 1. 리스트 조회
         * 2. 자바 for문 돌면서 '어제' 날짜 계산
         * 3. DB에 한번 더 쿼리 날려서 어제 가격 조회 (N+1 문제 발생)
         * 4. 자바에서 변동률 계산
         * * [수정 후]
         * 1. Mapper(오라클 쿼리)에서 LEAD 함수를 사용해 '최신가', '직전가', '변동률'을 한 방에 조회
         * 2. 그대로 반환
         */
        
        return iMapper.getIngredientList(); 
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

	@Override
	public int getTotalIngredientsBySearch(String type, String keyword) {
		return iMapper.selectAdminTotalCount(type, keyword);
	}

	@Override
	public List<AdminIngredientDTO> selectAdminIngredients(PageInfo pageInfo, String type, String keyword,
			String sortColumn, String sortOrder) {
		
		// 페이징 계산: 시작 위치(offset) 계산
		// 예: 1페이지 -> 0, 2페이지 -> 10 (limit이 10일 경우)
		int offset = (pageInfo.getCurrentPage() - 1) * pageInfo.getBoardLimit();
		int limit = pageInfo.getBoardLimit();
		
		return iMapper.selectAdminList(type, keyword, sortColumn, sortOrder, offset, limit);
	}

	@Override
	@Transactional // 데이터 변경이 일어나므로 readOnly=false (기본값) 적용
	public int updateNutrition(NutritionMaster nutrition) {
		// 1. nutritionId가 존재하면(0보다 크면) -> 이미 있는 데이터 수정 (UPDATE)
		if (nutrition.getNutritionId() > 0) {
			return iMapper.updateNutrition(nutrition);
		} 
		// 2. nutritionId가 없으면 -> 새로운 데이터 등록 (INSERT)
		else {
			// (단, ingredientId는 필수)
			return iMapper.insertNutrition(nutrition);
		}
	}

	@Override
	public NutritionMaster getNutritionByIngredientId(int id) {
		return iMapper.selectNutritionByIngredientId(id);
	}

	@Override
	public String getSafetyStatus(int ingredientId) {
		String status = iMapper.selectSafetyStatus(ingredientId);
		return status != null ? status : "safe";
	}
}