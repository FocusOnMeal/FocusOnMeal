package com.fom.boot.domain.safety.model.service;

import java.util.List;
import java.util.Map;

import com.fom.boot.common.pagination.PageInfo;
import com.fom.boot.domain.alert.model.vo.SafetyAlert;

public interface SafetyService {
	/**
	 * 안전 정보 전체 개수 조회 (검색 조건 포함)
	 * @param searchMap 검색 조건
	 * @return 전체 개수
	 */
	// **수정: Map<String, Object>로 변경**
	int selectAlertListCount(Map<String, Object> searchMap);

	/**
	 * 안전 정보 목록 조회
	 * @param pi 페이징 정보 (Service 내부에서 처리)
	 * @param searchMap 검색 조건 (type, keyword, sortColumn, sortOrder, nationFilter, hazardFilter)
	 * @return 안전 정보 목록
	 */
	// **수정: Map<String, Object>로 변경 (searchMap에 모든 정보 포함 예정)**
	List<SafetyAlert> selectAlertList(PageInfo pi, Map<String, Object> searchMap); 

	/**
	 * 안전 정보 상세 조회
	 * @param alertId 안전 정보 ID
	 * @return 안전 정보 상세
	 */
	SafetyAlert selectAlertDetail(int alertId);

	/**
	 * 이전 글 조회
	 * @param alertId 현재 안전 정보 ID
	 * @return 이전 안전 정보
	 */
	SafetyAlert selectPrevAlert(int alertId);

	/**
	 * 다음 글 조회
	 * @param alertId 현재 안전 정보 ID
	 * @return 다음 안전 정보
	 */
	SafetyAlert selectNextAlert(int alertId);
	
	/**
	 * 상세페이지 이전 글 조회
	 */
	SafetyAlert getPreviousAlert(int currentAlertId);

	/**
	 * 상세페이지 다음 글 조회
	 */
	SafetyAlert getNextAlert(int currentAlertId);
}
