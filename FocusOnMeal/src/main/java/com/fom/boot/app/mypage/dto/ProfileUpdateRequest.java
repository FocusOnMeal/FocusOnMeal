package com.fom.boot.app.mypage.dto;

import lombok.Data;

@Data
public class ProfileUpdateRequest {
    private String nickname;
    private String phone;
    private String currentPassword;  // 비밀번호 변경 시에만
    private String newPassword;      // 비밀번호 변경 시에만
}
