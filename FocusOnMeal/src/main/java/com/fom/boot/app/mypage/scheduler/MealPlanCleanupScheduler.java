package com.fom.boot.app.mypage.scheduler;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import com.fom.boot.domain.mypage.model.service.MyPageService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * 30일 경과 식단 자동 영구 삭제 스케줄러
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class MealPlanCleanupScheduler {

    private final MyPageService myPageService;

    /**
     * 매일 자정(00:00)에 실행
     * 삭제된지 30일이 지난 식단을 영구 삭제
     */
    @Scheduled(cron = "0 0 0 * * *")
    public void cleanupExpiredMealPlans() {
        log.info("=== 30일 경과 식단 자동 삭제 스케줄러 시작 ===");
        try {
            int deletedCount = myPageService.deleteExpiredMeals();
            log.info("=== 자동 삭제 완료: {}건 삭제됨 ===", deletedCount);
        } catch (Exception e) {
            log.error("자동 삭제 중 오류 발생: {}", e.getMessage(), e);
        }
    }
}