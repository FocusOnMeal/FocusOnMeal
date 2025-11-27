package com.fom.boot.app.notice.controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
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
import lombok.extern.slf4j.Slf4j;

@Slf4j  // ✅ 로깅 추가
@CrossOrigin(origins = "http://localhost:5173")  // ✅ CORS 설정
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
		
		int totalCount = nService.getTotalNoticesBySearch(type, keyword);
        PageInfo pageInfo = Pagination.getPageInfo(page, totalCount);
		
        List<Notice> importantList = nService.selectImportantNotices();
		List<Notice> list = nService.selectPublicNotices(pageInfo, type, keyword, sortColumn, sortOrder);
		
		Map<String, Object> data = new HashMap<>();
		data.put("pi", pageInfo);
		data.put("importantList", importantList);
		data.put("list", list);
		return ResponseEntity.ok(data);
	}
	
	// ✅ 기존 detail 엔드포인트 (조회수 증가 포함)
	@GetMapping("/detail/{noticeNo}")
    public ResponseEntity<?> selectNoticeDetail(@PathVariable int noticeNo) {
        Notice notice = nService.selectNoticeDetail(noticeNo);
        if (notice == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(notice);
    }
	 
	// ✅ 새로운 엔드포인트 (이전/다음 포함 + 조회수 증가)
	@GetMapping("/view/{noticeNo}")
	public ResponseEntity<?> getNoticeWithNavigation(@PathVariable int noticeNo) {

	    // 1. 공지사항 조회 (조회수 증가 포함)
	    Notice notice = nService.getNoticeForView(noticeNo); // 단일 호출

	    if (notice == null) {
	        return ResponseEntity.notFound().build();
	    }

	    // 2. 이전/다음 글 조회
	    Map<String, Object> prev = nService.selectPrevNotice(noticeNo);
	    Map<String, Object> next = nService.selectNextNotice(noticeNo);

	    // 3. 응답 구성
	    Map<String, Object> response = new HashMap<>();
	    response.put("notice", notice);
	    response.put("prev", prev);
	    response.put("next", next);

	    return ResponseEntity.ok(response);
	}

}