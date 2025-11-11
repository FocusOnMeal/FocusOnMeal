package com.fom.boot.domain.alert.model.vo;

import java.sql.Date;

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
public class NotificationLog {
    // 모든 알림 기록
    private int notificationId;		// 알림 기록 아이디 (PK)
    private String memberId;		// 회원 아이디 (FK)
    private String type;			// 알림 유형
    private String message;			// 알림 내용
    private String isRead;			// 사용자 확인 여부
    private Date sentAt;			// 알림 발송 시각
}