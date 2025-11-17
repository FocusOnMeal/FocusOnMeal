package com.fom.boot.domain.notice.model.mapper;

import java.util.List;

import org.apache.ibatis.annotations.Mapper;

import com.fom.boot.domain.notice.model.vo.Notice;

@Mapper
public interface NoticeMapper {

	// 공지사항 목록 조회용
	List<Notice> selectAllNotices();

	// 공지사항 수정용
	int modifyNotice(Notice notice);

}
