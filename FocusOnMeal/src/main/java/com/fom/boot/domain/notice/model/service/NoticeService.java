package com.fom.boot.domain.notice.model.service;

import java.util.List;
import java.util.Map;

import com.fom.boot.common.pagination.PageInfo;
import com.fom.boot.domain.notice.model.vo.Notice;

public interface NoticeService {

	// 관리자공지사항 목록 조회용
	List<Notice> selectAllNotices();

	// 관리자 공지사항 수정
	int modifyNotice(Notice notice);

	// 일반 공지사항 목록 조회
	List<Notice> selectPublicNotices(PageInfo pageInfo, String type ,String keyword, String sortColumn, String sortOrderr);

	// 일반 공지사항 상제 목록 조회
	Notice selectNoticeDetail(int noticeNo);
	
	// 일반 공지사항 총 검색수
	int getTotalNoticesBySearch(String type, String keyword);

	// 필독 공지사항 목록
	List<Notice> selectImportantNotices();

	// 공지사항 이전, 다음 페이지 조회
	Map<String, Object> selectPrevNotice(int noticeNo);

	Map<String, Object> selectNextNotice(int noticeNo);

	Notice getNoticeForView(int noticeNo);



	

}
