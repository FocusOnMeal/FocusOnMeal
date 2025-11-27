package com.fom.boot.domain.notice.model.service.impl;

import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.fom.boot.common.pagination.PageInfo;
import com.fom.boot.domain.notice.model.mapper.NoticeMapper;
import com.fom.boot.domain.notice.model.service.NoticeService;
import com.fom.boot.domain.notice.model.vo.Notice;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class NoticeServiceImpl implements NoticeService {

	private final NoticeMapper mapper;
	
	// 관리자 공지사항 목록 조회용
	@Override
	public List<Notice> selectAllNotices(PageInfo pageInfo, String type ,String keyword, 
										String sortColumn, String sortOrder, String filterType) {
		return mapper.selectAllNotices(pageInfo.getStartRow(),
	            pageInfo.getEndRow(),
	            type,
	            keyword,
	            sortColumn,
	            sortOrder,
	            filterType);
	}

	// 관리자 공지사항 수정
	@Override
	public int modifyNotice(Notice notice) {	
		return mapper.modifyNotice(notice);
	}
	
	// 관리자 공지사항 삭제
	@Override
	public void deleteNotice(int noticeNo) {
		int result = mapper.deleteNotice(noticeNo);

        if (result == 0) {
            throw new RuntimeException("해당 공지사항이 존재하지 않습니다.");
        }
		
	}

	// 일반 공지사항 조회
	@Override
	public List<Notice> selectPublicNotices(PageInfo pageInfo, String type ,String keyword, String sortColumn, String sortOrder) {
		return mapper.selectPublicNotices(pageInfo.getStartRow(),
	            pageInfo.getEndRow(),
	            type,
	            keyword,
	            sortColumn,
	            sortOrder);
	}

	// 일반 공지사항 상세 조회
	@Override
	public Notice selectNoticeDetail(int noticeNo) {
		return mapper.selectNoticeDetail(noticeNo);
	}

	// 일반 공지사항 총 검색 수
	@Override
	public int getTotalNoticesBySearch(String type, String keyword) {
		// TODO Auto-generated method stub
		return mapper.getTotalNoticesBySearch(type, keyword);
	}

	// 필독 공지 조회
	@Override
	public List<Notice> selectImportantNotices() {
		return mapper.selectImportantNotices();
	}
	

	
	// 공지사항 이전, 다음글 조회
	@Override
    public Map<String, Object> selectPrevNotice(int noticeNo) {
        Map<String, Object> result = mapper.selectPrevNotice(noticeNo);
        
        // ✅ null 체크 및 빈 Map 반환 방지
        if (result == null || result.isEmpty() || !result.containsKey("noticeNo")) {
            return null;  // null 반환으로 통일
        }
        
        return result;
    }

	
	@Override
    public Map<String, Object> selectNextNotice(int noticeNo) {
        Map<String, Object> result = mapper.selectNextNotice(noticeNo);
        
        // ✅ null 체크 및 빈 Map 반환 방지
        if (result == null || result.isEmpty() || !result.containsKey("noticeNo")) {
            return null;  // null 반환으로 통일
        }
        
        return result;
    }

	@Override
	@Transactional
	public Notice getNoticeForView(int noticeNo) {
	    // 1) 조회수 증가
		mapper.increaseViewCount(noticeNo);

	    // 2) 상세 조회
	    Notice notice = mapper.getNoticeForView(noticeNo);

	    return notice;
	}


	

}
