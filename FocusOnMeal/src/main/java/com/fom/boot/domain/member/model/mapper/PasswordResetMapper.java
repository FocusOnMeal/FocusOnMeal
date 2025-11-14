package com.fom.boot.domain.member.model.mapper;

import java.util.List;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import com.fom.boot.domain.member.model.vo.PasswordResetToken;

@Mapper
public interface PasswordResetMapper {
	 /**
     * 비밀번호 재설정 토큰 저장
     * 
     * @param token 토큰 정보
     * @return 저장된 행 수
     */
    int insertPasswordResetToken(PasswordResetToken token);
    
    /**
     * 토큰으로 토큰 정보 조회
     * 
     * @param token 토큰 문자열
     * @return 토큰 정보 또는 null
     */
    PasswordResetToken selectTokenByToken(@Param("token") String token);
    
    /**
     * 토큰 유효성 검증 (만료되지 않고 미사용인 토큰 개수)
     * 
     * @param token 토큰 문자열
     * @return 유효한 토큰 개수 (0 또는 1)
     */
    int countValidToken(@Param("token") String token);
    
    /**
     * 토큰으로 회원 ID 조회 (유효한 토큰만)
     * 
     * @param token 토큰 문자열
     * @return 회원 ID 또는 null
     */
    String selectMemberIdByToken(@Param("token") String token);
    
    /**
     * 토큰 사용 처리 (USED_YN = 'Y', USED_DATE = 현재시간)
     * 
     * @param token 토큰 문자열
     * @return 업데이트된 행 수
     */
    int updateTokenAsUsed(@Param("token") String token);
    
    /**
     * 회원의 기존 미사용 토큰 모두 무효화
     * (새 토큰 발급 전 이전 토큰들을 사용 처리)
     * 
     * @param memberId 회원 ID
     * @return 업데이트된 행 수
     */
    int updateInvalidateOldTokens(@Param("memberId") String memberId);
    
    /**
     * 회원의 토큰 발급 이력 조회 (최근순)
     * 
     * @param memberId 회원 ID
     * @param limit 조회 개수
     * @return 토큰 이력 리스트
     */
    List<PasswordResetToken> selectTokenHistoryByMemberId(
        @Param("memberId") String memberId, 
        @Param("limit") int limit
    );
    
    /**
     * 특정 기간 내 회원의 토큰 요청 횟수 조회 (악용 방지)
     * 
     * @param memberId 회원 ID
     * @param hours 시간 (예: 24 = 최근 24시간)
     * @return 요청 횟수
     */
    int countTokenRequestsByMemberId(
        @Param("memberId") String memberId, 
        @Param("hours") int hours
    );
    
    /**
     * 특정 기간 내 IP의 토큰 요청 횟수 조회 (DDoS 방지)
     * 
     * @param ipAddress IP 주소
     * @param hours 시간
     * @return 요청 횟수
     */
    int countTokenRequestsByIp(
        @Param("ipAddress") String ipAddress, 
        @Param("hours") int hours
    );
    
    /**
     * 만료된 토큰 삭제 (배치 작업용)
     * 
     * @return 삭제된 행 수
     */
    int deleteExpiredTokens();
    
    /**
     * 사용 완료된 오래된 토큰 삭제 (배치 작업용)
     * 
     * @param days 보관 일수 (예: 7 = 7일 이전 것 삭제)
     * @return 삭제된 행 수
     */
    int deleteOldUsedTokens(@Param("days") int days);
}
