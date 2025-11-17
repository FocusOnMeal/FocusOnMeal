package com.fom.boot.domain.notice.model.service.impl;

import java.util.List;

import org.springframework.stereotype.Service;

import com.fom.boot.domain.notice.model.mapper.NoticeMapper;
import com.fom.boot.domain.notice.model.service.NoticeService;
import com.fom.boot.domain.notice.model.vo.Notice;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class NoticeServiceImpl implements NoticeService {

	private final NoticeMapper mapper;
	
	// 공지사항 목록 조회용
	@Override
	public List<Notice> selectAllNotices() {
		return mapper.selectAllNotices();
	}

	@Override
	public int modifyNotice(Notice notice) {	
		return mapper.modifyNotice(notice);
	}

}
