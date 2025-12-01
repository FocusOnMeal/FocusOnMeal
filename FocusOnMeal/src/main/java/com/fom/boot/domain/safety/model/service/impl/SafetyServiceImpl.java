package com.fom.boot.domain.safety.model.service.impl;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.apache.ibatis.session.RowBounds;
import org.springframework.stereotype.Service;

import com.fom.boot.common.pagination.PageInfo;
import com.fom.boot.domain.alert.model.vo.SafetyAlert;
import com.fom.boot.domain.safety.model.mapper.SafetyMapper;
import com.fom.boot.domain.safety.model.service.SafetyService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class SafetyServiceImpl implements SafetyService {
	
	private final SafetyMapper safetyMapper;
	
	@Override
	// **수정: Map<String, Object>로 변경**
	public int selectAlertListCount(Map<String, Object> searchMap) {
		log.debug("안전 정보 개수 조회 - searchMap: {}", searchMap);
		return safetyMapper.selectAlertListCount(searchMap);
	}

	@Override
	// **수정: searchMap의 타입을 Map<String, Object>로 변경**
	public List<SafetyAlert> selectAlertList(PageInfo pi, Map<String, Object> searchMap) {
		log.debug("안전 정보 목록 조회 - pi: {}, searchMap: {}", pi, searchMap);
		
		// Map<String, Object>으로 캐스팅하여 사용
		String sortColumn = (String) searchMap.getOrDefault("sortColumn", "alertId");
		String sortOrder = (String) searchMap.getOrDefault("sortOrder", "desc");

		// sortColumn validation (SQL Injection 방지)
		if (!isValidSortColumn(sortColumn)) {
			sortColumn = "alertId";
		}

		// 정렬 방향 검증
		if (!sortOrder.equalsIgnoreCase("asc") && !sortOrder.equalsIgnoreCase("desc")) {
			sortOrder = "desc";
		}

		// 새로운 Map 생성하여 모든 값을 안전하게 전달 (Map<String, Object> 사용)
		Map<String, Object> params = new HashMap<>();
		params.putAll(searchMap); // 기존 검색 조건 (String 타입) 복사
		
		// 유효성 검사를 거친 값으로 대체
		params.put("sortColumn", sortColumn);
		params.put("sortOrder", sortOrder);
		
		// **핵심 수정:** startRow와 endRow를 String이 아닌 Integer 타입으로 저장!
		params.put("startRow", pi.getStartRow()); // Integer
		params.put("endRow", pi.getEndRow());   // Integer

		return safetyMapper.selectAlertList(params);
	}

	@Override
	public SafetyAlert selectAlertDetail(int alertId) {
		log.debug("안전 정보 상세 조회 - alertId: {}", alertId);
		return safetyMapper.selectAlertDetail(alertId);
	}

	@Override
	public SafetyAlert selectPrevAlert(int alertId) {
		log.debug("이전 글 조회 - alertId: {}", alertId);
		return safetyMapper.selectPrevAlert(alertId);
	}

	@Override
	public SafetyAlert selectNextAlert(int alertId) {
		log.debug("다음 글 조회 - alertId: {}", alertId);
		return safetyMapper.selectNextAlert(alertId);
	}

	/**
	 * 정렬 컬럼 유효성 검사 (SQL Injection 방지)
	 */
	private boolean isValidSortColumn(String sortColumn) {
		return sortColumn.equals("alertId")	
			|| sortColumn.equals("nation")	
			|| sortColumn.equals("hazardType")	
			|| sortColumn.equals("title")	
			|| sortColumn.equals("publicationDate");
	}
	
	@Override
	public SafetyAlert getPreviousAlert(int currentAlertId) {
	    try {
	        return safetyMapper.getPreviousAlert(currentAlertId);
	    } catch (Exception e) {
	        log.error("이전 글 조회 실패: alertId={}", currentAlertId, e);
	        return null;
	    }
	}

	@Override
	public SafetyAlert getNextAlert(int currentAlertId) {
	    try {
	        return safetyMapper.getNextAlert(currentAlertId);
	    } catch (Exception e) {
	        log.error("다음 글 조회 실패: alertId={}", currentAlertId, e);
	        return null;
	    }
	}
	
	// ========== 관리자 기능 추가 ==========
	
	@Override
	public int insertAlert(SafetyAlert alert) {
		log.debug("안전 정보 등록 - alert: {}", alert);
		return safetyMapper.insertAlert(alert);
	}
	
	@Override
	public int updateAlert(SafetyAlert alert) {
		log.debug("안전 정보 수정 - alert: {}", alert);
		return safetyMapper.updateAlert(alert);
	}
	
	@Override
	public int deleteAlerts(List<Integer> alertIds) {
		log.debug("안전 정보 삭제 - alertIds: {}", alertIds);
		return safetyMapper.deleteAlerts(alertIds);
	}
}
