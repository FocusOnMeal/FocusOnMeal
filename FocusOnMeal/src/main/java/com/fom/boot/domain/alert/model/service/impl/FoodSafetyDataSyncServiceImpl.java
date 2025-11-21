package com.fom.boot.domain.alert.model.service.impl;

import java.util.ArrayList;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.fom.boot.domain.alert.model.mapper.AlertMapper;
import com.fom.boot.domain.alert.model.service.AlertService;
import com.fom.boot.domain.alert.model.service.FoodSafetyApiService;
import com.fom.boot.domain.alert.model.service.FoodSafetyDataSyncService;
import com.fom.boot.domain.alert.model.vo.SafetyAlert;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * 식품안전정보원 API 데이터 동기화 서비스 구현체
 * KAMIS 패턴을 따라 구현
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class FoodSafetyDataSyncServiceImpl implements FoodSafetyDataSyncService {
	
	private final FoodSafetyApiService foodSafetyApiService;
    private final AlertMapper alertMapper;
    private final AlertService alertService; // 알림 발송 서비스
    
    // API 최대 조회 건수 (전체 동기화 시 페이징을 위해 필요)
    private static final int MAX_PER_PAGE = 100;
    
    @Override
    @Transactional
    public int syncRecentAlerts() {
        log.info("최근 식품안전정보 동기화 시작 (최근 7일)");
        
        try {
            // FoodSafetyApiService의 fetchRecentSafetyAlerts(7)이 최대 100건을 가져온다고 가정
            List<SafetyAlert> alerts = foodSafetyApiService.fetchRecentSafetyAlerts(7);
            
            // API에서 가져온 데이터 처리 및 DB 저장
            return saveAlerts(alerts);
            
        } catch (Exception e) {
            log.error("최근 식품안전정보 동기화 실패", e);
            // 트랜잭션 롤백 유도
            throw new RuntimeException("Recent alert sync failed", e);
        }
    }
    
    @Override
    @Transactional
    public int syncAllAlerts() {
        log.warn("전체 식품안전정보 동기화 시작 (주의: API 전체 페이지를 순회해야 함)");
        
        // **TODO: API 총 건수를 조회하여 페이지를 순회하는 로직 추가 필요**
        // 현재는 일단 1페이지 (100건)만 조회하도록 유지 (2.A 문제 해결을 위한 임시 조치)
        try {
            List<SafetyAlert> alerts = foodSafetyApiService.fetchSafetyAlerts(1, MAX_PER_PAGE);
            return saveAlerts(alerts);
            
        } catch (Exception e) {
            log.error("전체 식품안전정보 동기화 실패", e);
            throw new RuntimeException("All alert sync failed", e);
        }
    }
    
    @Override
    @Transactional
    public String syncAndGetResult() {
        log.info("식품안전정보 동기화 테스트 시작");
        
        try {
            List<SafetyAlert> alerts = foodSafetyApiService.fetchRecentSafetyAlerts(7);
            
            if (alerts.isEmpty()) {
                return "API에서 가져온 데이터 없음";
            }
            
            int savedCount = saveAlerts(alerts);
            
            return String.format("동기화 완료 - 조회: %d 건, 저장: %d 건", alerts.size(), savedCount);
            
        } catch (Exception e) {
            log.error("식품안전정보 동기화 테스트 실패", e);
            // RuntimeException을 던져서 상위에서 트랜잭션이 롤백되도록 유도
            throw new RuntimeException("Sync test failed: " + e.getMessage(), e);
        }
    }
    
    @Override
    @Transactional
    public int syncAlertsByRange(int startIdx, int endIdx) {
        log.info("식품안전정보 동기화 - startIdx: {}, endIdx: {}", startIdx, endIdx);
        
        try {
            List<SafetyAlert> alerts = foodSafetyApiService.fetchSafetyAlerts(startIdx, endIdx);
            return saveAlerts(alerts);
            
        } catch (Exception e) {
            log.error("범위별 식품안전정보 동기화 실패", e);
            throw new RuntimeException("Range sync failed", e);
        }
    }
    
    /**
     * SafetyAlert 리스트를 DB에 저장하고 알림 발송 (배치 처리)
     */
    private int saveAlerts(List<SafetyAlert> alerts) {
        if (alerts == null || alerts.isEmpty()) {
            return 0;
        }
        
        // 1. 식재료 매칭 및 중복 필터링을 위한 임시 리스트
        List<SafetyAlert> alertsToInsert = new ArrayList<>();
        
        // 2. 현재 DB에 존재하는 중복 데이터를 미리 조회 (제목 + 발행일 + 국가 복합 키)
        // DTO에 해당 복합 키를 확인할 수 있는 필드가 없으므로, 일단 모든 Alert를 매핑 후 체크해야 함.
        
        for (SafetyAlert alert : alerts) {
            try {
                // 1. INGREDIENT_ID 매핑 (제목/내용에서 식재료 찾기)
                int ingredientId = findIngredientIdFromContent(alert);
                alert.setIngredientId(ingredientId); // 매칭 실패 시 0으로 저장
                
                // 2. 중복 체크 (제목 + 공표일 + 국가)
                if (isDuplicate(alert)) { // 복합 키로 변경
                    log.debug("중복 데이터 스킵 - title: {}", alert.getTitle());
                    continue; // 중복이면 스킵
                }
                
                alertsToInsert.add(alert);
                
            } catch (Exception e) {
                log.error("Alert 전처리 중 오류 발생 - title: {}", alert.getTitle(), e);
            }
        }
        
        if (alertsToInsert.isEmpty()) {
            log.info("동기화 대상 데이터 없음. 총 조회 건수: {}", alerts.size());
            return 0;
        }
        
        // 3. 배치 삽입 (insertBatchSafetyAlert)
        int savedCount = 0;
        try {
            // MyBatis의 selectKey 대신, Service에서 미리 PK를 생성하지 않고, Mapper에서 시퀀스를 사용하도록 처리
            savedCount = alertMapper.insertBatchSafetyAlert(alertsToInsert);
            
            // 4. 알림 발송 (Batch 삽입 후, DB에 실제로 저장된 데이터에 대해서만 발송)
            for (SafetyAlert savedAlert : alertsToInsert) {
                // 식재료가 매핑되었고 (ingredientId > 0), DB에 성공적으로 저장된 경우에만 알림 발송
                // **주의: 현재 배치 삽입 후 alertId가 VO에 다시 담기는 로직이 없으므로, 알림 발송은 제한적으로만 가능함**
                // (일단 알림 발송은 alertId가 필요한 alertService.createSafetyAlertNotifications(alertId) 대신 로그만 남기는 것으로 대체)
                if (savedAlert.getIngredientId() > 0) {
                     // TODO: Batch INSERT 후 생성된 Alert ID를 가져오는 추가 쿼리 또는 로직이 필요함.
                     // 현재는 임시로 로그만 남기거나, 단일 건 삽입으로 되돌리는 것을 고려해야 함.
                     // (일단 알림 발송 로직은 주석 처리하고, DB 저장 건수만 반환합니다.)
                     // alertService.createSafetyAlertNotifications(savedAlert.getAlertId()); 
                     log.debug("알림 발송 대상 확인 - title: {}", savedAlert.getTitle());
                }
            }
            
        } catch (Exception e) {
            log.error("위험 공표 배치 저장 실패", e);
            // Batch 실패 시 트랜잭션 롤백
            throw new RuntimeException("Batch insert failed", e);
        }
        
        log.info("식품안전정보 동기화 완료 - 조회: {}, 저장: {}, 중복 스킵: {}", 
                alerts.size(), savedCount, alerts.size() - alertsToInsert.size());
        
        return savedCount;
    }
    
    /**
     * 제목/내용에서 식재료 ID 찾기
     */
    private int findIngredientIdFromContent(SafetyAlert alert) {
        String title = alert.getTitle();
        String content = alert.getDescription();
        
        // 제목과 내용에서 키워드 추출
        String searchText = (title + " " + content).toLowerCase();
        
        // INGREDIENT_MASTER에서 이름으로 검색
        // 이 메서드는 AlertMapper.xml에 구현되어야 함
        Integer ingredientId = alertMapper.findIngredientIdByKeyword(searchText);
        
        return ingredientId != null ? ingredientId : 0;
    }
    
    /**
     * 중복 체크 (제목 + 공표일 + 국가 복합 키 사용)
     * 이 메서드는 현재 AlertMapper.xml에 구현되어야 함
     */
    private boolean isDuplicate(SafetyAlert alert) {
        int count = alertMapper.countByComplexKey(alert); // 복합 키를 사용하는 새로운 Mapper 메서드
        return count > 0;
    }
}
