package com.fom.boot.domain.notice.model.vo;

import java.time.LocalDateTime;

import com.fasterxml.jackson.annotation.JsonFormat;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

@Getter
@Setter
@ToString
@NoArgsConstructor
@AllArgsConstructor
public class Notice {
	private int 			noticeNo;              	// 공지사항 번호 	(PK)
    private String 			memberId;            	// 회원 아이디 		(FK)
    private String 			noticeSubject;       	// 공지사항 제목
    private String 			noticeContent;       	// 공지사항 내용
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd")
    private LocalDateTime 	noticeCreateAt; 		// 공지일자 		(SYSTIMESTAMP)
    private int 			viewCount;             	// 조회수
    private String 			noticeIsNew;         	// NEW 뱃지 		(Y/N)
    private String 			noticeImportant;     	// 필독 뱃지 		(Y/N)
    private String 			isDeleted;           	// 논리삭제 		(Y/N)
    
    // 추가
    private String 			nickname; 				// 공지사항 작성자용 닉네임
}
