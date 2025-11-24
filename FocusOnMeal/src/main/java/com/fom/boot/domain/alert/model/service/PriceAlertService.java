package com.fom.boot.domain.alert.model.service;

import java.math.BigDecimal;

import com.fom.boot.domain.alert.model.vo.PriceAlert;

public interface PriceAlertService {

	PriceAlert getMyPriceAlert(String name, int ingredientId);

	void setPriceAlert(String name, int ingredientId, BigDecimal targetPrice);

	void checkAndNotifyPrice(int ingredientId, String ingredientName, BigDecimal currentPrice);

}
