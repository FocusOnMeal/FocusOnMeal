import React, { useEffect, useState } from 'react';
import axios from 'axios';

const Allergies = () => {
    const [allergies, setAllergies] = useState([]);
    const [checked, setChecked] = useState([]);
    const [loading, setLoading] = useState(true);
    
    const API_BASE_URL = "http://localhost:8080";

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            await Promise.all([loadAllergyList(), loadUserAllergies()]);
        } catch (error) {
            console.error("데이터 로딩 오류:", error);
        } finally {
            setLoading(false);
        }
    };

    const loadAllergyList = async () => {
        try {
            console.log(`📤 요청: ${API_BASE_URL}/api/mypage/allergy/list`);
            
            const token = sessionStorage.getItem('token');
            const res = await axios.get(`${API_BASE_URL}/api/mypage/allergy/list`, {
                headers: token ? { Authorization: `Bearer ${token}` } : {}
            });
            
            console.log("📥 알레르기 응답:", res.data);
            setAllergies(res.data || []);
        } catch (error) {
            console.error("❌ 알레르기 목록 조회 오류:", error);
            console.error("상태:", error.response?.status);
            console.error("응답:", error.response?.data);
        }
    };

    const loadUserAllergies = async () => {
        try {
            console.log(`📤 요청: ${API_BASE_URL}/api/mypage/allergies`);
            
            const token = sessionStorage.getItem('token');
            if (!token) {
                console.warn("⚠️ 토큰 없음");
                setChecked([]);
                return;
            }
            
            const res = await axios.get(`${API_BASE_URL}/api/mypage/allergies`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            console.log("📥 사용자 알레르기 응답:", res.data);
            console.log("📥 응답 타입:", typeof res.data, Array.isArray(res.data));
            
            // 다양한 응답 형식 처리
            let allergyIds = [];
            if (Array.isArray(res.data)) {
                allergyIds = res.data;
            } else if (res.data && Array.isArray(res.data.allergies)) {
                allergyIds = res.data.allergies;
            } else if (res.data && Array.isArray(res.data.allergyIds)) {
                allergyIds = res.data.allergyIds;
            }
            
            // 숫자 배열로 변환 (문자열로 올 수도 있음)
            allergyIds = allergyIds.map(id => typeof id === 'number' ? id : parseInt(id)).filter(id => !isNaN(id));
            
            console.log("✅ 최종 체크될 알레르기 ID:", allergyIds);
            setChecked(allergyIds);
        } catch (error) {
            console.error("❌ 사용자 알레르기 조회 오류:", error);
            console.error("상태:", error.response?.status);
            console.error("응답:", error.response?.data);
            
            // 500 에러가 발생해도 빈 배열로 초기화 (백엔드 오류 대응)
            if (error.response?.status === 500) {
                console.warn("⚠️ 서버 오류로 인해 빈 배열로 초기화합니다.");
            }
            setChecked([]);
        }
    };

    const toggleCheck = (allergyId) => {
        setChecked((prev) => {
            if (allergyId === 1) {
                return prev.includes(1) ? [] : [1];
            }
            
            const filteredPrev = prev.filter(id => id !== 1);
            
            if (filteredPrev.includes(allergyId)) {
                return filteredPrev.filter(id => id !== allergyId);
            } else {
                return [...filteredPrev, allergyId];
            }
        });
    };

    const handleSave = async () => {
        try {
            const token = sessionStorage.getItem('token');
            if (!token) {
                alert("로그인이 필요합니다.");
                return;
            }
            
            console.log("📤 저장 요청:", checked);
            
            await axios.post(`${API_BASE_URL}/api/mypage/allergies`, 
                { allergyIds: checked },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            
            alert("알레르기 정보가 저장되었습니다!");
        } catch (error) {
            console.error("❌ 저장 오류:", error);
            alert(error.response?.data?.error || "저장에 실패했습니다.");
        }
    };

    if (loading) {
        return (
            <div style={{
                minHeight: '100vh',
                backgroundColor: '#f9fafb',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center'
            }}>
                <p style={{ fontSize: '18px', color: '#6b7280' }}>로딩 중...</p>
            </div>
        );
    }

    if (allergies.length === 0) {
        return (
            <div style={{
                minHeight: '100vh',
                backgroundColor: '#f9fafb',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center'
            }}>
                <div style={{ textAlign: 'center' }}>
                    <p style={{ fontSize: '18px', color: '#dc2626', marginBottom: '10px' }}>
                        알레르기 데이터가 없습니다.
                    </p>
                    <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '20px' }}>
                        브라우저 콘솔(F12)에서 오류를 확인해주세요.
                    </p>
                    <button
                        onClick={loadData}
                        style={{
                            padding: '10px 20px',
                            backgroundColor: '#3b82f6',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: 'pointer'
                        }}
                    >
                        새로고침
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div style={{
            minHeight: '100vh',
            backgroundColor: '#f9fafb',
            padding: '40px 20px',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center'
        }}>
            <div style={{
                maxWidth: '800px',
                width: '100%',
                backgroundColor: 'white',
                borderRadius: '12px',
                border: '3px solid #3b82f6',
                padding: '40px',
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
            }}>
                
                <h2 style={{
                    fontSize: '28px',
                    fontWeight: 'bold',
                    color: '#1f2937',
                    marginBottom: '30px'
                }}>
                    알레르기 정보
                </h2>

                <div style={{
                    backgroundColor: '#f3f4f6',
                    padding: '10px',
                    borderRadius: '6px',
                    marginBottom: '20px',
                    fontSize: '12px',
                    color: '#6b7280'
                }}>
                    <p>📊 총 알레르기: {allergies.length}개</p>
                    <p>✅ 선택됨: {checked.length}개</p>
                </div>

                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(5, 1fr)',
                    gap: '15px 20px',
                    marginBottom: '40px'
                }}>
                    {allergies.map((allergy) => {
                        const allergyId = allergy.allergyId;
                        const allergyName = allergy.allergyName;
                        
                        return (
                            <label
                                key={allergyId}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    cursor: 'pointer',
                                    fontSize: '15px',
                                    color: '#374151',
                                    userSelect: 'none',
                                    padding: '8px',
                                    borderRadius: '6px',
                                    backgroundColor: checked.includes(allergyId) ? '#dbeafe' : 'transparent',
                                    transition: 'background-color 0.2s'
                                }}
                            >
                                <input
                                    type="checkbox"
                                    checked={checked.includes(allergyId)}
                                    onChange={() => toggleCheck(allergyId)}
                                    style={{
                                        width: '18px',
                                        height: '18px',
                                        marginRight: '8px',
                                        cursor: 'pointer',
                                        accentColor: '#3b82f6',
                                        flexShrink: 0
                                    }}
                                />
                                <span style={{ lineHeight: '1.3' }}>{allergyName}</span>
                            </label>
                        );
                    })}
                </div>

                {checked.length > 0 && (
                    <div style={{
                        backgroundColor: '#f3f4f6',
                        padding: '15px',
                        borderRadius: '8px',
                        marginBottom: '30px'
                    }}>
                        <p style={{ 
                            fontSize: '14px', 
                            color: '#6b7280', 
                            marginBottom: '8px',
                            fontWeight: '600'
                        }}>
                            선택된 알레르기 ({checked.length}개):
                        </p>
                        <p style={{ 
                            fontSize: '14px', 
                            color: '#374151',
                            lineHeight: '1.6'
                        }}>
                            {allergies
                                .filter(a => checked.includes(a.allergyId))
                                .map(a => a.allergyName)
                                .join(', ')}
                        </p>
                    </div>
                )}

                <div style={{ textAlign: 'right' }}>
                    <button
                        onClick={handleSave}
                        style={{
                            padding: '12px 40px',
                            backgroundColor: '#84cc16',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            fontSize: '16px',
                            fontWeight: '600',
                            cursor: 'pointer',
                            transition: 'background-color 0.2s'
                        }}
                        onMouseEnter={(e) => e.target.style.backgroundColor = '#65a30d'}
                        onMouseLeave={(e) => e.target.style.backgroundColor = '#84cc16'}
                    >
                        확인
                    </button>
                </div>

            </div>
        </div>
    );
};

export default Allergies;