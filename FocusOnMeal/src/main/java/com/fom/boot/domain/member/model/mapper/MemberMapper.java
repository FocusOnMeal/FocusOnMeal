package com.fom.boot.domain.member.model.mapper;

import java.util.List;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import com.fom.boot.app.member.dto.LoginRequest;
import com.fom.boot.domain.member.model.vo.Member;

@Mapper
public interface MemberMapper {

    Member selectOneByLogin(LoginRequest member);

    Member findByMemberId(@Param("memberId") String memberId);

    int insertMember(Member member);

    List<Member> selectAllMembers();

    int updateAdminYn(@Param("memberId") String memberId,
                      @Param("adminYn") String adminYn);

    int updateStatusYn(@Param("memberId") String memberId,
                       @Param("statusYn") String statusYn);

    Member selectOneById(@Param("memberId") String memberId);

    int updateMemberPassword(@Param("memberId") String memberId,
                             @Param("encodedPw") String encodedPw);

    String searchMemberId(@Param("memberName") String memberName,
                          @Param("email") String email);

    int checkEmailExists(@Param("email") String email);
}
