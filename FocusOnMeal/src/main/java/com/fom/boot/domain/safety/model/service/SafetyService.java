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
    int selectAlertListCount(Map<String, String> searchMap);

    /**
     * 안전 정보 목록 조회
     * @param pi 페이징 정보
     * @param searchMap 검색 조건 (type, keyword, sortColumn, sortOrder)
     * @return 안전 정보 목록
     */
    List<SafetyAlert> selectAlertList(PageInfo pi, Map<String, String> searchMap);

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
}
