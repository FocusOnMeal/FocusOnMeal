package com.fom.boot.domain.safety.model.mapper;

import java.util.List;
import java.util.Map;

import org.apache.ibatis.annotations.Mapper;

import com.fom.boot.domain.alert.model.vo.SafetyAlert;

@Mapper
public interface SafetyMapper {
	
	/**
     * 안전 정보 전체 개수 조회 (검색 조건 포함)
     * @param searchMap 검색 조건
     * @return 전체 개수
     */
    int selectAlertListCount(Map<String, String> searchMap);

    /**
     * 안전 정보 목록 조회 (페이징, 검색, 정렬)
     * @param searchMap 검색 및 정렬 조건 (startRow, endRow 포함)
     * @return 안전 정보 목록
     */
    List<SafetyAlert> selectAlertList(Map<String, String> searchMap);

    /**
     * 안전 정보 상세 조회
     * @param alertId 안전 정보 ID
     * @return 안전 정보 상세
     */
    SafetyAlert selectAlertDetail(int alertId);

    /**
     * 이전 글 조회 (현재 글보다 작은 ID 중 가장 큰 것)
     * @param alertId 현재 안전 정보 ID
     * @return 이전 안전 정보
     */
    SafetyAlert selectPrevAlert(int alertId);

    /**
     * 다음 글 조회 (현재 글보다 큰 ID 중 가장 작은 것)
     * @param alertId 현재 안전 정보 ID
     * @return 다음 안전 정보
     */
    SafetyAlert selectNextAlert(int alertId);

}
