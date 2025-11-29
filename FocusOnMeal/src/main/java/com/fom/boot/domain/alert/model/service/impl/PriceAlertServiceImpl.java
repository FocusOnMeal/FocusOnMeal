package com.fom.boot.domain.alert.model.service.impl;

import java.math.BigDecimal;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.fom.boot.domain.alert.model.mapper.AlertMapper;
import com.fom.boot.domain.alert.model.mapper.PriceAlertMapper;
import com.fom.boot.domain.alert.model.service.PriceAlertService;
import com.fom.boot.domain.alert.model.vo.PriceAlert;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class PriceAlertServiceImpl implements PriceAlertService {
    
    private final PriceAlertMapper priceAlertMapper;
    private final AlertMapper alertMapper;

    // 모달 띄울 때 조회 (기존 - 단일 알림용, 필요시 유지)
    @Override
    public PriceAlert getMyPriceAlert(String memberId, int ingredientId) {
        return priceAlertMapper.selectMySetting(memberId, ingredientId);
    }

    // 모달 저장 (기존 - 단일 알림용, 필요시 유지)
    @Override
    @Transactional
    public void setPriceAlert(String memberId, int ingredientId, BigDecimal targetPrice) {
        PriceAlert existing = priceAlertMapper.selectMySetting(memberId, ingredientId);
        if (existing == null) {
            PriceAlert newAlert = new PriceAlert();
            newAlert.setMemberId(memberId);
            newAlert.setIngredientId(ingredientId);
            newAlert.setThresholdPrice(targetPrice);
            priceAlertMapper.insertPriceAlert(newAlert);
        } else {
            existing.setThresholdPrice(targetPrice);
            priceAlertMapper.updatePriceAlert(existing);
        }
    }

    // ===== 새로운 다중 알림 기능 =====
    
    /**
     * 특정 재료에 대한 모든 알림 조회
     */
    @Override
    public List<PriceAlert> getAllPriceAlerts(String memberId, int ingredientId) {
        return priceAlertMapper.selectAllAlerts(memberId, ingredientId);
    }

    /**
     * 알림 추가
     * alertType은 프론트에서 받지만 DB에 저장하지 않음 (컬럼 없음)
     * 조회 시 thresholdPrice와 currentPrice 비교로 하락/상승 판단
     */
    @Override
    @Transactional
    public void addPriceAlert(String memberId, int ingredientId, BigDecimal targetPrice, String alertType) {
        PriceAlert alert = new PriceAlert();
        alert.setMemberId(memberId);
        alert.setIngredientId(ingredientId);
        alert.setThresholdPrice(targetPrice);
        alert.setNotificationEnabled("Y"); // 기본값 'Y'
        
        priceAlertMapper.insertPriceAlertNew(alert);
        
        log.info("가격 알림 추가: 회원={}, 재료ID={}, 목표가={}, 타입(참고용)={}", 
                 memberId, ingredientId, targetPrice, alertType);
    }

    /**
     * 개별 알림 삭제
     */
    @Override
    @Transactional
    public void deletePriceAlert(String memberId, int ingredientId, int alertId) {
        priceAlertMapper.deleteAlertById(memberId, ingredientId, alertId);
        
        log.info("가격 알림 삭제: 회원={}, 재료ID={}, 알림ID={}", memberId, ingredientId, alertId);
    }

    /**
     * 특정 재료의 모든 알림 삭제
     */
    @Override
    @Transactional
    public void deleteAllPriceAlerts(String memberId, int ingredientId) {
        priceAlertMapper.deleteAllAlerts(memberId, ingredientId);
        
        log.info("가격 알림 전체 삭제: 회원={}, 재료ID={}", memberId, ingredientId);
    }

    // ===== 배치/크롤러용 =====
    
    /**
     * 가격 변동 체크 및 알림 발송
     */
    @Override
    @Transactional
    public void checkAndNotifyPrice(int ingredientId, String ingredientName, BigDecimal currentPrice) {
        List<String> targets = priceAlertMapper.selectTargetMemberIds(ingredientId, currentPrice);
        
        if (targets == null || targets.isEmpty()) {
            return;
        }
        
        log.info("가격 알림 대상 발견: 재료={}, 현재가={}, 대상자수={}", 
                 ingredientName, currentPrice, targets.size());
        
        String message = String.format("[%s] 가격이 %s원으로 변동되었습니다!", 
                                     ingredientName, currentPrice.toString());
        
        for (String memberId : targets) {
            alertMapper.insertNotificationLog(memberId, "가격변동", message, null);
        }
    }
}