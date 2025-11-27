package com.fom.boot.domain.notice.model.mapper;

import java.util.List;
import java.util.Map;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import com.fom.boot.domain.notice.model.vo.Notice;

@Mapper
public interface NoticeMapper {

	// 관리자 공지사항 목록 조회용
	List<Notice> selectAllNotices();

	// 관리자 공지사항 수정용
	int modifyNotice(Notice notice);
	
	// 일반 공지사항 조회
	List<Notice> selectPublicNotices(@Param("startRow") int startRow,
			@Param("endRow") int endRow,
			@Param("type") String type,
			@Param("keyword") String keyword,
			@Param("sortColumn") String sortColumn,
			@Param("sortOrder") String sortOrder);
	
	// 일반 공지사항 상세 조회
    Notice selectNoticeDetail(int noticeNo);

    // 일반 공지사항 총검색수
	int getTotalNoticesBySearch(String type, String keyword);

	// 필독 공지사항 조회
	List<Notice> selectImportantNotices();

	// 공지사항 이전, 다음글 조회
	Map<String, Object> selectPrevNotice(int noticeNo);

	Map<String, Object> selectNextNotice(int noticeNo);

	void increaseViewCount(int noticeNo);

	Notice getNoticeForView(int noticeNo);



	
}
