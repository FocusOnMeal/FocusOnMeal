package com.fom.boot.domain.alert.model.service;

import java.math.BigDecimal;
import java.util.List;

import com.fom.boot.domain.alert.model.vo.PriceAlert;

public interface PriceAlertService {

	PriceAlert getMyPriceAlert(String name, int ingredientId);

	void setPriceAlert(String name, int ingredientId, BigDecimal targetPrice);

	void checkAndNotifyPrice(int ingredientId, String ingredientName, BigDecimal currentPrice);

	List<PriceAlert> getAllPriceAlerts(String name, int ingredientId);

	void addPriceAlert(String name, int ingredientId, BigDecimal targetPrice, String alertType);

	void deletePriceAlert(String name, int ingredientId, int alertId);

	void deleteAllPriceAlerts(String name, int ingredientId);

}
