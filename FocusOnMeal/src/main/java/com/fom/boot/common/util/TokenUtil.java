package com.fom.boot.common.util;

import java.sql.Timestamp;
import java.util.UUID;

public class TokenUtil {
	/**
     * 비밀번호 재설정용 랜덤 토큰 생성
     * UUID를 사용하여 추측 불가능한 토큰 생성
     * 
     * @return UUID 형식의 토큰 문자열
     * 예시: "a1b2c3d4-e5f6-7890-abcd-ef1234567890"
     */
    public static String generatePasswordResetToken() {
        return UUID.randomUUID().toString();
    }
    
    /**
     * 토큰 만료 시간 생성 (현재 시간 + 지정된 시간)
     * 
     * @param hours 만료까지 시간 (시간 단위)
     * @return 만료 시간 Timestamp
     */
    public static Timestamp getTokenExpiryTime(int hours) {
        long currentTime = System.currentTimeMillis();
        long expiryTime = currentTime + (hours * 60 * 60 * 1000L);
        return new Timestamp(expiryTime);
    }
    
    /**
     * 기본 1시간 후 만료 시간 생성
     * 
     * @return 1시간 후 Timestamp
     */
    public static Timestamp getDefaultTokenExpiryTime() {
        return getTokenExpiryTime(1);
    }
    
    /**
     * 토큰이 만료되었는지 확인
     * 
     * @param expireDate 만료 시간
     * @return true: 만료됨, false: 유효함
     */
    public static boolean isTokenExpired(Timestamp expireDate) {
        if (expireDate == null) {
            return true;
        }
        return expireDate.before(new Timestamp(System.currentTimeMillis()));
    }
    
    /**
     * 토큰 값을 보안상 안전하게 마스킹
     * 예: "a1b2c3d4-e5f6-7890-abcd-ef1234567890" → "a1b2c3d4****"
     * 
     * @param token 원본 토큰
     * @return 마스킹된 토큰
     */
    public static String maskToken(String token) {
        if (token == null || token.isEmpty()) {
            return "****";
        }
        
        int visibleLength = Math.min(8, token.length() / 3);
        if (token.length() <= visibleLength) {
            return "****";
        }
        
        return token.substring(0, visibleLength) + "****";
    }
    
    /**
     * 토큰 유효 시간(분) 계산
     * 
     * @param expireDate 만료 시간
     * @return 남은 시간(분), 만료되었으면 0
     */
    public static long getRemainingMinutes(Timestamp expireDate) {
        if (expireDate == null || isTokenExpired(expireDate)) {
            return 0;
        }
        
        long currentTime = System.currentTimeMillis();
        long expiryTime = expireDate.getTime();
        long diff = expiryTime - currentTime;
        
        return diff / (60 * 1000);
    }
}

/**
 * 사용 예시:
 * 
 * // 1. 토큰 생성
 * String token = TokenUtil.generatePasswordResetToken();
 * System.out.println(token); // "a1b2c3d4-e5f6-7890-abcd-ef1234567890"
 * 
 * // 2. 만료 시간 설정 (1시간 후)
 * Timestamp expireTime = TokenUtil.getDefaultTokenExpiryTime();
 * 
 * // 3. 만료 확인
 * boolean expired = TokenUtil.isTokenExpired(expireTime);
 * 
 * // 4. 토큰 마스킹 (로그 출력용)
 * String masked = TokenUtil.maskToken(token);
 * System.out.println(masked); // "a1b2c3d4****"
 * 
 * // 5. 남은 시간 확인
 * long minutes = TokenUtil.getRemainingMinutes(expireTime);
 * System.out.println("남은 시간: " + minutes + "분");
 */