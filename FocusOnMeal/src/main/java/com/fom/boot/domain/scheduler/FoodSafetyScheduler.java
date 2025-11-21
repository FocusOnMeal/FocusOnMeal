package com.fom.boot.domain.scheduler;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import com.fom.boot.domain.alert.model.service.FoodSafetyDataSyncService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Component
@RequiredArgsConstructor
public class FoodSafetyScheduler {

	private final FoodSafetyDataSyncService foodSafetyDataSyncService;
    
    /**
     * 매일 오전 9시에 자동 실행
     * cron: 초 분 시 일 월 요일
     */
    @Scheduled(cron = "${food.safety.batch.cron:0 0 9 * * ?}")
    public void scheduledFetchSafetyAlerts() {
        log.info("=== 식품안전정보 자동 배치 시작 ===");
        
        try {
            int savedCount = foodSafetyDataSyncService.syncRecentAlerts();
            
            log.info("=== 식품안전정보 자동 배치 완료: {} 건 저장 ===", savedCount);
            
        } catch (Exception e) {
            log.error("=== 식품안전정보 자동 배치 실패 ===", e);
        }
    }
    
    /**
     * 매 6시간마다 실행 (테스트용)
     */
    // @Scheduled(fixedRate = 21600000) // 6시간 = 21600000ms
    public void periodicFetchSafetyAlerts() {
        log.info("식품안전정보 주기적 배치 실행 (6시간마다)");
        foodSafetyDataSyncService.syncRecentAlerts();
    }
}
