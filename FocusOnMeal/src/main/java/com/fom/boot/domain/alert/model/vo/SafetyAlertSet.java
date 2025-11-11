package com.fom.boot.domain.alert.model.vo;

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
public class SafetyAlertSet {
    // 공표 알림
    private int settingId; 					// 공표 설정 아이디 (PK)
    private String memberId; 				// 회원 아이디 (FK)
    private String notificationEnabled; 	// 알림 수신 여부
}