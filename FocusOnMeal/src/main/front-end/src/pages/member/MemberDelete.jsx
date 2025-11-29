import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const MemberDelete = () => {
    const [password, setPassword] = useState('');
    const [confirmText, setConfirmText] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const API_BASE_URL = "http://localhost:8080";

    const handleDelete = async () => {
        // 유효성 검사
        if (!password) {
            alert('비밀번호를 입력해주세요.');
            return;
        }

        if (confirmText !== '회원탈퇴') {
            alert('"회원탈퇴"를 정확히 입력해주세요.');
            return;
        }

        // 최종 확인
        if (!window.confirm('정말로 탈퇴하시겠습니까?\n\n모든 데이터가 영구적으로 삭제되며 복구할 수 없습니다.')) {
            return;
        }

        try {
            setLoading(true);
            const token = sessionStorage.getItem('token');

            // 토큰 확인 로그 추가 (디버깅용)
            console.log('Token:', token);
            console.log('Token 존재 여부:', token ? '존재함' : '없음');
            console.log('Authorization Header:', `Bearer ${token}`);

            if (!token) {
                alert('로그인 정보가 없습니다. 다시 로그인해주세요.');
                navigate('/login');
                return;
            }

            const response = await axios.delete(`${API_BASE_URL}/api/member/delete`, {
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                data: { password: password }
            });

            console.log('삭제 성공:', response);

            // 로그아웃 처리
            sessionStorage.removeItem('token');
            sessionStorage.removeItem('memberId');
            sessionStorage.removeItem('memberName');
            sessionStorage.removeItem('memberNickname');
            sessionStorage.removeItem('adminYn');

            // 헤더 업데이트를 위한 이벤트 발생 (로그인 컴포넌트와 동일)
            window.dispatchEvent(new Event("loginStateChange"));

            alert('회원 탈퇴가 완료되었습니다.');
            navigate('/');
        } catch (error) {
            console.error('회원 탈퇴 오류:', error);
            console.error('에러 상세:', error.response);
            alert(error.response?.data?.message || '회원 탈퇴에 실패했습니다.');
        } finally {
            setLoading(false);
        }
    };

    const styles = {
        container: {
            minHeight: '100vh',
            backgroundColor: '#f9fafb',
            padding: '40px 20px',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center'
        },
        card: {
            maxWidth: '600px',
            width: '100%',
            backgroundColor: 'white',
            borderRadius: '12px',
            border: '3px solid #ef4444',
            padding: '40px',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
            boxSizing: 'border-box'
        },
        title: {
            fontSize: '28px',
            fontWeight: 'bold',
            color: '#dc2626',
            marginBottom: '20px',
            textAlign: 'center'
        },
        warningBox: {
            backgroundColor: '#fef2f2',
            border: '2px solid #fecaca',
            borderRadius: '8px',
            padding: '20px',
            marginBottom: '30px'
        },
        warningTitle: {
            fontSize: '16px',
            fontWeight: '600',
            color: '#dc2626',
            marginBottom: '10px'
        },
        warningList: {
            listStyle: 'disc',
            paddingLeft: '20px',
            color: '#991b1b',
            fontSize: '14px',
            lineHeight: '1.8',
            margin: 0
        },
        formGroup: {
            marginBottom: '25px'
        },
        label: {
            display: 'block',
            fontSize: '14px',
            fontWeight: '600',
            color: '#374151',
            marginBottom: '8px'
        },
        required: {
            color: '#dc2626'
        },
        input: {
            width: '100%',
            padding: '12px',
            border: '2px solid #d1d5db',
            borderRadius: '8px',
            fontSize: '15px',
            outline: 'none',
            boxSizing: 'border-box'
        },
        helpText: {
            fontSize: '12px',
            color: '#6b7280',
            marginTop: '5px'
        },
        buttonGroup: {
            display: 'flex',
            gap: '10px'
        },
        cancelButton: {
            flex: 1,
            padding: '14px',
            backgroundColor: '#6b7280',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '16px',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'background-color 0.2s'
        },
        deleteButton: {
            flex: 1,
            padding: '14px',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '16px',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'background-color 0.2s'
        }
    };

    return (
        <div style={styles.container}>
            <div style={styles.card}>
                <h2 style={styles.title}>회원 탈퇴</h2>

                {/* 경고 메시지 */}
                <div style={styles.warningBox}>
                    <h3 style={styles.warningTitle}>
                        ⚠️ 회원 탈퇴 시 유의사항
                    </h3>
                    <ul style={styles.warningList}>
                        <li>회원 정보가 영구적으로 삭제됩니다.</li>
                        <li>작성한 식단, 찜한 식재료 등 모든 데이터가 삭제됩니다.</li>
                        <li>탈퇴 후에는 데이터를 복구할 수 없습니다.</li>
                        <li>동일한 아이디로 재가입이 불가능할 수 있습니다.</li>
                    </ul>
                </div>

                {/* 비밀번호 입력 */}
                <div style={styles.formGroup}>
                    <label style={styles.label}>
                        비밀번호 확인 <span style={styles.required}>*</span>
                    </label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="비밀번호를 입력하세요"
                        style={styles.input}
                        disabled={loading}
                    />
                </div>

                {/* 확인 문구 입력 */}
                <div style={styles.formGroup}>
                    <label style={styles.label}>
                        "회원탈퇴" 입력 <span style={styles.required}>*</span>
                    </label>
                    <input
                        type="text"
                        value={confirmText}
                        onChange={(e) => setConfirmText(e.target.value)}
                        placeholder="회원탈퇴"
                        style={styles.input}
                        disabled={loading}
                    />
                    <p style={styles.helpText}>
                        탈퇴를 원하시면 위 입력란에 "회원탈퇴"를 정확히 입력해주세요.
                    </p>
                </div>

                {/* 버튼 영역 */}
                <div style={styles.buttonGroup}>
                    <button
                        onClick={() => navigate(-1)}
                        style={styles.cancelButton}
                        disabled={loading}
                    >
                        취소
                    </button>
                    <button
                        onClick={handleDelete}
                        disabled={loading}
                        style={{
                            ...styles.deleteButton,
                            backgroundColor: loading ? '#9ca3af' : '#dc2626',
                            cursor: loading ? 'not-allowed' : 'pointer'
                        }}
                    >
                        {loading ? '처리 중...' : '탈퇴하기'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default MemberDelete;