package com.fom.boot.app.notice.controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.fom.boot.common.pagination.PageInfo;
import com.fom.boot.common.pagination.Pagination;
import com.fom.boot.domain.notice.model.service.NoticeService;
import com.fom.boot.domain.notice.model.vo.Notice;

import lombok.RequiredArgsConstructor;

@RequestMapping("/api/board/notice")
@RestController
@RequiredArgsConstructor
public class NoticeController {
	
	private final NoticeService nService;
	
	@GetMapping("/list")
	public ResponseEntity<?> selectPublicNotices(
			@RequestParam(defaultValue ="1") int page
			,@RequestParam(defaultValue = "all") String type
	        ,@RequestParam(defaultValue = "") String keyword
	        ,@RequestParam(required = false) String sortColumn
	        ,@RequestParam(required = false) String sortOrder){
		
		// 검색포함 총 데이터 개수 조회
        int totalCount =nService.getTotalNoticesBySearch(type, keyword);

        // Pagination
        PageInfo pageInfo= Pagination.getPageInfo(page, totalCount);
		
        // 1. 필독 공지사항 조회 (페이징 X, 검색조건은 선택사항이나 보통 필독은 검색 무관하게 띄움)
        List<Notice> importantList = nService.selectImportantNotices();
        
        // 전체 공지사항 목록 조회
		List<Notice> list = nService.selectPublicNotices(pageInfo, type, keyword, sortColumn, sortOrder);
		
		Map<String, Object> data = new HashMap<>();
		data.put("pi", pageInfo);
		data.put("importantList", importantList);
		data.put("list", list);

		return ResponseEntity.ok(data);
	}
	
	 @GetMapping("/detail/{noticeNo}")
	    public ResponseEntity<?> selectNoticeDetail(@PathVariable int noticeNo) {
	        Notice notice = nService.selectNoticeDetail(noticeNo);

	        if (notice == null) {
	            return ResponseEntity.notFound().build();
	        }

	        return ResponseEntity.ok(notice);
	    }

}
