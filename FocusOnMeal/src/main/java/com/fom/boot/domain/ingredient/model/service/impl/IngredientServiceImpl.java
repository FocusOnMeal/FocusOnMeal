package com.fom.boot.domain.ingredient.model.service.impl;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.fom.boot.app.ingredient.dto.IngredientDTO;
import com.fom.boot.domain.ingredient.model.mapper.IngredientMapper;
import com.fom.boot.domain.ingredient.model.mapper.IngredientPriceHistoryMapper;
import com.fom.boot.domain.ingredient.model.service.IngredientService;
import com.fom.boot.domain.ingredient.model.vo.FavoriteIngredient;
import com.fom.boot.domain.ingredient.model.vo.Ingredient;
import com.fom.boot.domain.ingredient.model.vo.PriceHistory;

@Service
@Transactional(readOnly = true) // 클래스 레벨에서 읽기 전용 트랜잭션 (성능 향상)
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
		// IngredientMapper.xml의 selectListWithLatestPrice 호출
		return iMapper.selectListWithLatestPrice();
	}

	@Override
	public Ingredient getIngredientById(int id) {
		// IngredientMapper.xml의 selectById 호출
		return iMapper.selectById(id);
	}

	@Override
	public List<PriceHistory> getPriceHistory(int id) {
		// IngredientPriceHistoryMapper.xml의 getPriceHistoryByIngredientId 호출
		return priceHistoryMapper.getPriceHistoryByIngredientId(id);
	}

}
