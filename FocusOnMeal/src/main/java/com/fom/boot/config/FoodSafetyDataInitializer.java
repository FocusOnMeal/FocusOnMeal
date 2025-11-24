package com.fom.boot.config;

import com.fom.boot.domain.alert.model.service.FoodSafetyDataSyncService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;

/**
 * 서버 시작 시 식품안전정보 자동 동기화
 * 최근 3일 안전정보 데이터가 없으면 자동으로 동기화
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class FoodSafetyDataInitializer implements ApplicationRunner {

    private final FoodSafetyDataSyncService foodSafetyDataSyncService;

    @Override
    public void run(ApplicationArguments args) throws Exception {
        log.info("========== Server startup: Food Safety data auto sync started ==========");

        try {
            // 최근 3일치 동기화 (평상시 운영용)
            int savedCount = foodSafetyDataSyncService.syncRecentAlerts();
            log.info("Food Safety data sync result: {} alerts saved (3 days)", savedCount);
        } catch (Exception e) {
            log.error("Food Safety data auto sync failed", e);
            // 동기화 실패해도 서버는 정상 구동
        }

        log.info("========== Food Safety data auto sync completed ==========");
    }
}