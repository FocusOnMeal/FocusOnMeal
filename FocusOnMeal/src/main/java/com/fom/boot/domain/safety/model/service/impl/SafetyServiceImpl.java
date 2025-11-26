package com.fom.boot.domain.safety.model.service.impl;

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
    public int selectAlertListCount(Map<String, String> searchMap) {
        log.debug("안전 정보 개수 조회 - searchMap: {}", searchMap);
        return safetyMapper.selectAlertListCount(searchMap);
    }

    @Override
    public List<SafetyAlert> selectAlertList(PageInfo pi, Map<String, String> searchMap) {
        log.debug("안전 정보 목록 조회 - pi: {}, searchMap: {}", pi, searchMap);
        
        // sortColumn validation (SQL Injection 방지)
        String sortColumn = searchMap.getOrDefault("sortColumn", "alertId");
        String sortOrder = searchMap.getOrDefault("sortOrder", "desc");

        // 허용된 정렬 컬럼만 사용
        if (!isValidSortColumn(sortColumn)) {
            sortColumn = "alertId";
        }

        // 정렬 방향 검증
        if (!sortOrder.equalsIgnoreCase("asc") && !sortOrder.equalsIgnoreCase("desc")) {
            sortOrder = "desc";
        }

        searchMap.put("sortColumn", sortColumn);
        searchMap.put("sortOrder", sortOrder);
        searchMap.put("startRow", String.valueOf(pi.getStartRow()));
        searchMap.put("endRow", String.valueOf(pi.getEndRow()));

        return safetyMapper.selectAlertList(searchMap);
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
}
