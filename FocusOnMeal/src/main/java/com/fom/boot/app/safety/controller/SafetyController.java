package com.fom.boot.app.safety.controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.fom.boot.common.pagination.PageInfo;
import com.fom.boot.common.pagination.Pagination;
import com.fom.boot.domain.alert.model.vo.SafetyAlert;
import com.fom.boot.domain.safety.model.service.SafetyService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@RestController
@RequestMapping("/api/board/safety")
@RequiredArgsConstructor
public class SafetyController {
	
	private final SafetyService safetyService;
	
	/**
     * 안전 정보 목록 조회
     * @param page 현재 페이지
     * @param type 검색 타입 (all, title, nation, hazardType)
     * @param keyword 검색 키워드
     * @param sortColumn 정렬 컬럼
     * @param sortOrder 정렬 방향 (asc, desc)
     * @return 안전 정보 목록 + 페이징 정보
     */
    @GetMapping("/list")
    public ResponseEntity<Map<String, Object>> getAlertList(
            @RequestParam(value = "page", defaultValue = "1") int page,
            @RequestParam(value = "type", required = false) String type,
            @RequestParam(value = "keyword", required = false) String keyword,
            @RequestParam(value = "sortColumn", defaultValue = "alertId") String sortColumn,
            @RequestParam(value = "sortOrder", defaultValue = "desc") String sortOrder) {

        log.info("안전 정보 목록 조회 - page: {}, type: {}, keyword: {}, sortColumn: {}, sortOrder: {}", 
                 page, type, keyword, sortColumn, sortOrder);

        try {
            // 검색 조건 Map
            Map<String, String> searchMap = new HashMap<>();
            if (keyword != null && !keyword.trim().isEmpty()) {
                searchMap.put("type", type);
                searchMap.put("keyword", keyword);
            }
            searchMap.put("sortColumn", sortColumn);
            searchMap.put("sortOrder", sortOrder);

            // 전체 게시글 수 조회
            int totalCount = safetyService.selectAlertListCount(searchMap);

            // 페이징 정보 생성
            PageInfo pi = Pagination.getPageInfo(page, totalCount);

            // 목록 조회
            List<SafetyAlert> list = safetyService.selectAlertList(pi, searchMap);

            // 응답 데이터 구성
            Map<String, Object> response = new HashMap<>();
            response.put("list", list);
            response.put("pi", pi);

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("안전 정보 목록 조회 실패", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "안전 정보 목록을 불러오는 데 실패했습니다."));
        }
    }

    /**
     * 안전 정보 상세 조회
     * @param alertId 안전 정보 ID
     * @return 안전 정보 상세 정보
     */
    @GetMapping("/detail/{alertId}")
    public ResponseEntity<?> getAlertDetail(@PathVariable("alertId") int alertId) {
        
        log.info("안전 정보 상세 조회 - alertId: {}", alertId);

        try {
            SafetyAlert alert = safetyService.selectAlertDetail(alertId);

            if (alert == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("error", "해당 안전 정보를 찾을 수 없습니다."));
            }

            return ResponseEntity.ok(alert);

        } catch (Exception e) {
            log.error("안전 정보 상세 조회 실패 - alertId: {}", alertId, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "안전 정보를 불러오는 데 실패했습니다."));
        }
    }

    /**
     * 이전/다음 글 조회
     * @param alertId 현재 안전 정보 ID
     * @return 이전글, 다음글 정보
     */
    @GetMapping("/navigate/{alertId}")
    public ResponseEntity<Map<String, SafetyAlert>> getNavigateAlerts(@PathVariable("alertId") int alertId) {
        
        log.info("이전/다음 글 조회 - alertId: {}", alertId);

        try {
            SafetyAlert prevAlert = safetyService.selectPrevAlert(alertId);
            SafetyAlert nextAlert = safetyService.selectNextAlert(alertId);

            Map<String, SafetyAlert> response = new HashMap<>();
            response.put("prev", prevAlert);
            response.put("next", nextAlert);

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("이전/다음 글 조회 실패", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}
