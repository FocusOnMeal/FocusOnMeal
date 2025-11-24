package com.fom.boot.domain.alert.model.service.impl;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.fom.boot.domain.alert.model.mapper.AlertMapper; // 기존 알림 매퍼
import com.fom.boot.domain.alert.model.mapper.PriceAlertMapper; // 신규 매퍼
import com.fom.boot.domain.alert.model.service.PriceAlertService;
import com.fom.boot.domain.alert.model.vo.PriceAlert;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class PriceAlertServiceImpl implements PriceAlertService {

    private final PriceAlertMapper priceAlertMapper;
    private final AlertMapper alertMapper; // NotificationLog 쌓기용

    // 모달 띄울 때 조회
    @Override
    public PriceAlert getMyPriceAlert(String memberId, int ingredientId) {
        return priceAlertMapper.selectMySetting(memberId, ingredientId);
    }

    // 모달 저장 (신규/수정)
    @Override
    @Transactional
    public void setPriceAlert(String memberId, int ingredientId, BigDecimal targetPrice) {
        // 1. 기존 설정 조회
        PriceAlert existing = priceAlertMapper.selectMySetting(memberId, ingredientId);

        if (existing == null) {
            // [신규]
            PriceAlert newAlert = new PriceAlert();
            newAlert.setMemberId(memberId);
            newAlert.setIngredientId(ingredientId);
            newAlert.setThresholdPrice(targetPrice);
            // notificationEnabled는 쿼리에서 'Y'로 고정 입력됨
            
            priceAlertMapper.insertPriceAlert(newAlert);
        } else {
            // [수정]
            existing.setThresholdPrice(targetPrice);
            priceAlertMapper.updatePriceAlert(existing);
        }
    }

    // [배치/크롤러용] 가격 변동 체크 및 알림 발송
    @Override
    @Transactional
    public void checkAndNotifyPrice(int ingredientId, String ingredientName, BigDecimal currentPrice) {
        // 1. 알림 받아야 할 멤버들 조회 (쿼리에서 가격 비교 완료)
        List<String> targets = priceAlertMapper.selectTargetMemberIds(ingredientId, currentPrice);

        if (targets == null || targets.isEmpty()) {
            return;
        }

        log.info("가격 알림 대상 발견: 재료={}, 현재가={}, 대상자수={}", ingredientName, currentPrice, targets.size());

        // 2. 알림 로그 테이블(NOTIFICATION_LOG)에 Insert
        String message = String.format("[%s] 가격이 %s원으로 내려갔어요! 지금 확인해보세요.", 
                                     ingredientName, currentPrice.toString());
        
        for (String memberId : targets) {
            // TYPE: '가격변동' (DB에 맞게 조정하세요)
            // alertId는 FK가 없으므로 null 처리하거나 0
            alertMapper.insertNotificationLog(memberId, "가격변동", message, null);
        }
    }
}