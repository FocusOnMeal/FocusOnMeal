package com.fom.boot.domain.notice.model.service;

import java.util.List;

import com.fom.boot.domain.notice.model.vo.Notice;

public interface NoticeService {

	// 공지사항 목록 조회용
	List<Notice> selectAllNotices();

}
