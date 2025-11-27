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
	 * @param nationFilter 국가 초성 필터
	 * @param hazardFilter 위험 유형 필터
	 * @return 안전 정보 목록 + 페이징 정보
	 */
	@GetMapping("/list")
	public ResponseEntity<Map<String, Object>> getAlertList(
			@RequestParam(value = "page", defaultValue = "1") int page,
			@RequestParam(value = "type", required = false) String type,
			@RequestParam(value = "keyword", required = false) String keyword,
			@RequestParam(value = "sortColumn", defaultValue = "alertId") String sortColumn,
			@RequestParam(value = "sortOrder", defaultValue = "desc") String sortOrder,
			@RequestParam(value = "nationFilter", required = false) String nationFilter,
			@RequestParam(value = "hazardFilter", required = false) String hazardFilter) {

		log.info("안전 정보 목록 조회 - page: {}, type: {}, keyword: {}, sortColumn: {}, sortOrder: {}, nationFilter: {}, hazardFilter: {}", 
				page, type, keyword, sortColumn, sortOrder, nationFilter, hazardFilter);

		try {
			// **수정: Map<String, Object>으로 변경**
			Map<String, Object> searchMap = new HashMap<>();
			
			if (keyword != null && !keyword.trim().isEmpty()) {
				searchMap.put("type", type);
				searchMap.put("keyword", keyword);
			}
			
			// 필터 조건 추가
			if (nationFilter != null && !nationFilter.trim().isEmpty()) {
				searchMap.put("nationFilter", nationFilter);
			}
			if (hazardFilter != null && !hazardFilter.trim().isEmpty()) {
				searchMap.put("hazardFilter", hazardFilter);
			}
			
			searchMap.put("sortColumn", sortColumn);
			searchMap.put("sortOrder", sortOrder);

			// 전체 게시글 수 조회 (searchMap이 Map<String, Object>을 전달하도록 Service/Mapper도 변경됨)
			int totalCount = safetyService.selectAlertListCount(searchMap);

			// 페이징 정보 생성
			PageInfo pi = Pagination.getPageInfo(page, totalCount);

			// 목록 조회 (searchMap이 Map<String, Object>을 전달하도록 변경됨)
			List<SafetyAlert> list = safetyService.selectAlertList(pi, searchMap);

			// 응답 데이터 구성
			Map<String, Object> response = new HashMap<>();
			response.put("list", list);
			response.put("pi", pi);

			return ResponseEntity.ok(response);

		} catch (Exception e) {
			log.error("안전 정보 목록 조회 실패", e);
			// 기존 에러 로그는 MybatisSystemException을 보여주었지만,
			// 수정 후에도 500 에러를 반환하는 방식으로 유지
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
					.body(Map.of("error", "안전 정보 목록을 불러오는 데 실패했습니다."));
		}
	}

	// ... 나머지 getAlertDetail, getNavigateAlerts 메소드는 변경 없음
    
    // 안전 정보 상세 조회
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

	// 이전/다음 글 조회
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
