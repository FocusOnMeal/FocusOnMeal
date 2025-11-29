import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import styles from './Login.module.css';

const Login = () => {
    const [memberId, setMemberId] = useState('');
    const [memberPw, setMemberPw] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const location = useLocation();

    // 이전 페이지 정보 가져오기
    const from = location.state?.from || '/';

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        try {
            const response = await fetch('/api/member/login', {  // ✅ /api 추가
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    memberId: memberId,
                    memberPw: memberPw
                })
            });

            if (response.ok) {
                const result = await response.json();
                const data = result.data;

                // ✅ 수정: localStorage → sessionStorage (브라우저 닫으면 자동 로그아웃)
                sessionStorage.setItem('token', data.token);
                sessionStorage.setItem('memberId', data.memberId);
                sessionStorage.setItem('memberName', data.memberName);
                sessionStorage.setItem('memberNickname', data.memberNickname);
                sessionStorage.setItem('adminYn', data.adminYn);

                window.dispatchEvent(new Event("loginStateChange"));

                if (data.adminYn === 'Y') {
                    navigate('/admin');
                } else {
                    // 이전 페이지로 리다이렉트 (저장된 위치가 없으면 홈으로)
                    navigate(from, { replace: true });
                    console.log("로그인 응답:", result);
                    console.log("닉네임:", result.data.memberNickname);
                    console.log("리다이렉트:", from);
                }
            } else {
                const errorText = await response.text();
                setError(errorText || '로그인에 실패했습니다.');
            }
        } catch (err) {
            console.error('로그인 오류:', err);
            setError('서버와의 통신 중 오류가 발생했습니다.');
        }
    };

    return (
        <div className={styles.container}>
            <main className={styles.main}>
                <div className={styles.loginContainer}>
                    <div className={styles.loginTitle}>
                        <h2>로그인</h2>
                    </div>
                    <form className={styles.loginForm} onSubmit={handleSubmit}>
                        {error && <div className={styles.errorMessage}>{error}</div>}
                        <div className={styles.formGroup}>
                            <label htmlFor="memberIdInput">아이디</label>
                            <input
                                type="text"
                                name="memberId"
                                id="memberIdInput"
                                placeholder="아이디를 입력하세요."
                                value={memberId}
                                onChange={(e) => setMemberId(e.target.value)}
                                required />
                        </div>
                        <div className={styles.formGroup}>
                            <label htmlFor="memberPwInput">비밀번호</label>
                            <input
                                type="password"
                                name="memberPw"
                                id="memberPwInput"
                                placeholder="비밀번호를 입력하세요."
                                value={memberPw}
                                onChange={(e) => setMemberPw(e.target.value)}
                                required />
                        </div>
                        <button type="submit" className={styles.submitButton}>로그인</button>
                    </form>
                    <div className={styles.loginLinks}>
                        <a href="/member/findId">아이디 찾기</a>
                        <a href="/member/findPassword">비밀번호 찾기</a>
                        <a href="/member/form">회원가입</a>
                    </div>
                </div>
            </main>
        </div>
    )
}

export default Login;