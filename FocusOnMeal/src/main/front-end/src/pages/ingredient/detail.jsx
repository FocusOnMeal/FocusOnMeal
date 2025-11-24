import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import styles from './detail.module.css';

function IngredientDetail() {
    const { id } = useParams();
    const navigate = useNavigate(); 
    
    const [itemInfo, setItemInfo] = useState(null);
    const [priceHistory, setPriceHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isWished, setIsWished] = useState(false);
    const [isAlertEnabled, setIsAlertEnabled] = useState(false); // 안전 알림 상태
    const [isPriceAlertEnabled, setIsPriceAlertEnabled] = useState(false); // 가격 알림 상태 

    useEffect(() => {
        const fetchDetail = async () => {
            try {
                const response = await axios.get(`/ingredient/api/detail/${id}`);
                const info = response.data.info || null;
                const history = response.data.history || [];
                
                // 가격 정보 추가 처리
                if (info && history.length > 0) {
                    // 최신 가격
                    const latestPrice = history[0];
                    info.currentPrice = latestPrice.priceValue;
                    info.collectedDate = latestPrice.collectedDate;
                    info.pricePer100g = Math.floor(latestPrice.priceValue / 10);
                    
                    // ✅ [수정] 복잡한 날짜 계산 제거 -> 배열의 두 번째 요소(history[1])가 바로 직전 데이터임
                    const previousPriceData = history.length > 1 ? history[1] : null;
                    
                    if (previousPriceData) {
                        info.previousPrice = previousPriceData.priceValue;
                        info.previousCollectedDate = previousPriceData.collectedDate; // 날짜도 저장
                        
                        // 변동률 계산 (프론트에서 계산)
                        if (info.currentPrice && info.previousPrice > 0) {
                            const changePercent = ((info.currentPrice - info.previousPrice) / info.previousPrice) * 100;
                            // 소수점 1자리까지 계산해서 저장
                            info.priceChangePercent = Number(changePercent.toFixed(1));
                        } else {
                            info.priceChangePercent = 0;
                        }
                    } else {
                        // 이전 데이터 없음
                        info.previousPrice = 0;
                        info.priceChangePercent = 0;
                    }
                }
                
                // TODO: 실제 안전도 로직 구현 필요
                info.safetyStatus = ['safe', 'warning', 'danger'][Math.floor(Math.random() * 3)];
                
                setItemInfo(info); 
                setPriceHistory(history);
                
                const token = sessionStorage.getItem('token') || localStorage.getItem('token');

                // 찜 상태 확인 (MyPageController 경로 사용)
                if (token) {

                    try {
                        // 기존: '/ingredient/api/favorites' -> 변경: '/api/mypage/favorites'
                        const favoriteResponse = await axios.get('/api/mypage/favorites');

                        if (favoriteResponse.data && Array.isArray(favoriteResponse.data)) {
                            // 현재 보고 있는 상세 페이지의 ID가 찜 목록에 있는지 확인
                            const isFavorited = favoriteResponse.data.some(fav => fav.ingredientId === parseInt(id));
                            setIsWished(isFavorited);
                        }
                    } catch{
                        // 비로그인 상태 등 에러 발생 시 찜 안 된 상태로 유지
                        // console.log("찜 상태 확인 실패 (로그인 필요):", favError);
                    }

                    // 안전 알림 상태 확인
                    try {
                        const alertResponse = await axios.get(`/ingredient/api/${id}/alert`, {
                            headers: { Authorization: `Bearer ${token}` }
                        });
                        const enabled = alertResponse.data.isEnabled || false;
                        setIsAlertEnabled(enabled);
                    } catch {
                        // 비로그인 또는 오류 시 알림 OFF 상태
                        setIsAlertEnabled(false);
                    }

                    // 가격 알림 상태 확인 (별도)
                    try {
                        const priceAlertResponse = await axios.get(`/ingredient/api/${id}/price-alert`, {
                            headers: { Authorization: `Bearer ${token}` }
                        });
                        const priceEnabled = priceAlertResponse.data.isEnabled || false;
                        setIsPriceAlertEnabled(priceEnabled);
                    } catch {
                        // 비로그인 또는 오류 시 알림 OFF 상태
                        setIsPriceAlertEnabled(false);
                    }
                }

            } catch (error) {
                console.error("상세 정보 로딩 실패:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchDetail();
    }, [id]);

    const handleWishClick = async () => {
        try {
            // 찜 등록/해제는 여전히 IngredientController 사용
            const response = await axios.post(`/ingredient/detail/${id}/favorite`);
            if (response.data.success) {
                setIsWished(response.data.isFavorite);
                // alert(response.data.message); // 너무 자주 뜨면 주석 처리 추천
            }
        } catch (error) {
            if (error.response?.status === 401) {
                alert("로그인이 필요합니다.");
            } else {
                alert("오류가 발생했습니다.");
            }
        }
    };

    const handleAlertClick = async () => {
        const token = sessionStorage.getItem('token') || localStorage.getItem('token');

        if (!token) {
            alert("로그인이 필요합니다.");
            return;
        }

        try {
            const response = await axios.post(`/ingredient/api/${id}/alert`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.data.success) {
                const newState = response.data.isEnabled;
                setIsAlertEnabled(newState);
            }
        } catch (error) {
            if (error.response?.status === 401) {
                alert("로그인이 필요합니다.");
            } else {
                alert("오류가 발생했습니다.");
            }
        }
    };

    const handlePriceAlertClick = async () => {
        const token = sessionStorage.getItem('token') || localStorage.getItem('token');

        if (!token) {
            alert("로그인이 필요합니다.");
            return;
        }

        try {
            const response = await axios.post(`/ingredient/api/${id}/price-alert`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.data.success) {
                const newState = response.data.isEnabled;
                setIsPriceAlertEnabled(newState);
            }
        } catch (error) {
            if (error.response?.status === 401) {
                alert("로그인이 필요합니다.");
            } else {
                alert("오류가 발생했습니다.");
            }
        }
    };

    if (loading) return <div className={styles.container}>로딩 중...</div>;
    
    if (!itemInfo) {
        return (
            <div className={styles.container}>
                <h2>식품성분표 상세 페이지</h2>
                <p>'{id}'에 해당하는 정보를 찾을 수 없습니다.</p>
                <button onClick={() => navigate(-1)} className={styles.backButton}>
                    목록으로 돌아가기
                </button>
            </div>
        );
    }

    // 템플릿 변수 계산
    const safetyText = itemInfo.safetyStatus === 'safe' ? '안전'
                        : itemInfo.safetyStatus === 'warning' ? '주의'
                        : '위험';
    const safetyClass = itemInfo.safetyStatus === 'safe' ? styles.safe 
                        : itemInfo.safetyStatus === 'warning' ? styles.warning 
                        : styles.danger;
    
    // 가격 변동 정보
    const hasPriceChange = itemInfo.priceChangePercent !== null && itemInfo.priceChangePercent !== undefined;
    
    // 정상 렌더링
    return (
        <div className={styles.container}>
            <h2 className={styles.pageTitle}>식품성분표 상세 페이지</h2>
            
            <button onClick={() => navigate(-1)} className={styles.backButton}>
                뒤로가기
            </button>
            
            <div className={styles.mainContent}>
                
                {/* 1. 왼쪽 컬럼: 영양 성분 */}
                <div className={styles.leftColumn}>
                    
                    {/* 영양 성분 섹션 */}
                    <div className={styles.nutritionSection}>
                        <h3 className={styles.sectionTitle}>영양 성분 표</h3>
                        
                        <div className={styles.nutritionTablePlaceholder}>
                            <table className={styles.nutritionTable}>
                                <thead>
                                    <tr>
                                        <th>&nbsp; 구분</th>
                                        <th>&nbsp; 함량</th>
                                        <th>&nbsp; 수치</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr className={styles.noDataRow}>
                                        <td colSpan="3">NUTRITION_MASTER 테이블에 데이터가 없습니다.</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* 2. 오른쪽 컬럼: 정보 박스들 */}
                <div className={styles.rightColumn}>
                    <h1 className={styles.itemTitle}>
                        {itemInfo.name}
                        <span className={styles.categoryInTitle}>
                            ({itemInfo.category})
                        </span>
                    </h1>
                    
                    {/* 2-1. 상단 요약 박스 (가격, 안전, 찜하기) */}
                    <div className={styles.infoBoxTop}>
                        <div className={styles.itemSummary}>
                            
                            {/* 가격 정보 */}
                            <div className={styles.priceLine}>
                                <strong>가격</strong>
                                <span style={{marginLeft: '10px', color: '#666', fontSize: '0.9em', fontWeight: 'normal'}}>
                                    ({itemInfo.standardUnit && !itemInfo.standardUnit.startsWith('1') ? '1' + itemInfo.standardUnit : itemInfo.standardUnit}):
                                </span>
                                <span className={styles.currentPriceValue}>
                                    {itemInfo.currentPrice ? `${itemInfo.currentPrice.toLocaleString()}원` : '정보 없음'}
                                </span>
                                
                                {itemInfo.pricePer100g > 0 && ( 
                                    <span className={styles.pricePer100g}>
                                        (100g당 {itemInfo.pricePer100g.toLocaleString()}원)
                                    </span>
                                )}
                            </div>
                            
                            {/* 전일 대비 가격 변동 */}
                            {hasPriceChange && (
                                <div style={{fontSize: '0.9em', marginTop: '10px', marginBottom: '10px'}}>
                                    
                                    {/* 1. 변동 없음 */}
                                    {itemInfo.priceChangePercent === 0 && (
                                        <span style={{color: '#666'}}>
                                            - 전일 대비 변동 없음
                                        </span>
                                    )}

                                    {/* 2. 상승/하락 표시 (색상 + 소수점 적용) */}
                                    {itemInfo.priceChangePercent !== 0 && (
                                        <span style={{
                                            color: itemInfo.priceChangePercent > 0 ? '#dc3545' : '#007aff', 
                                            fontWeight: 'bold'
                                        }}>
                                            {/* toFixed(1)을 사용하여 소수점 첫째 자리까지 표시 */}
                                            전일 대비 {itemInfo.priceChangePercent > 0 ? '▲' : '▼'} {Math.abs(itemInfo.priceChangePercent).toFixed(1)}%
                                        </span>
                                    )}

                                    {/* 3. 직전 가격 및 날짜 (흐리게 표시) */}
                                    {itemInfo.previousPrice > 0 && itemInfo.previousCollectedDate && (
                                        <span style={{marginLeft: '8px', color: '#999'}}>
                                            (직전: {itemInfo.previousPrice.toLocaleString()}원, 
                                            {' ' + new Date(itemInfo.previousCollectedDate).toLocaleDateString('ko-KR', {
                                                month: 'numeric',
                                                day: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })})
                                        </span>
                                    )}
                                </div>
                            )}

                            {/* 이전 데이터가 아예 없는 경우 (신규) */}
                            {!hasPriceChange && itemInfo.currentPrice && (
                                <div style={{fontSize: '0.9em', color: '#999', marginTop: '10px', marginBottom: '10px'}}>
                                    <span style={{background:'#ffc107', color:'#fff', padding:'2px 6px', borderRadius:'4px', marginRight:'5px', fontSize:'0.9em'}}>NEW</span>
                                    최근 데이터 기준
                                </div>
                            )}

                            {/* 안전 위험도 + 툴팁 */}
                            <div className={styles.safetyLine}>
                                <strong>안전 위험도:</strong> 
                                <span className={safetyClass}>{safetyText}</span>
                                
                                <span className={styles.tooltipContainer}>
                                    <span className={styles.helpIcon}>?</span>
                                    <div className={styles.tooltipBox}>
                                        <h4 className={styles.tooltipTitle}>안전 위험도 기준</h4>
                                        <p className={styles.tooltipDanger}>
                                            <strong>🔴 위험:</strong> 
                                            <span className={styles.tooltipTextContent}>
                                                최근 3개월 이내 식약처 회수 명령, 또는 농약/중금속 부적합 판정 등이 있었을 경우.
                                            </span>
                                        </p>
                                        <p className={styles.tooltipWarning}>
                                            <strong>🟠 주의:</strong> 
                                            <span className={styles.tooltipTextContent}>
                                                가격 변동률 ±20% 이상 등 급격한 불안정, 또는 계절적 품질 저하 우려가 있는 경우.
                                            </span>
                                        </p>
                                        <p className={styles.tooltipSafe}>
                                            <strong>🟢 안전:</strong> 
                                            <span className={styles.tooltipTextContent}>
                                                위의 위험 및 주의 조건에 해당하지 않는 경우.
                                            </span>
                                        </p>
                                    </div>
                                </span>
                            </div>
                        </div>
                        <div className={styles.topActions}>
                            <button 
                                onClick={handleWishClick} 
                                className={`${styles.wishButton} ${isWished ? styles.wished : ''}`}
                            >
                                {/* SVG 하트 아이콘 */}
                                <svg 
                                    width="20" 
                                    height="20" 
                                    viewBox="0 0 24 24" 
                                    fill="none" 
                                    xmlns="http://www.w3.org/2000/svg"
                                    className={styles.heartIcon}
                                >
                                    <path 
                                        d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" 
                                        stroke="currentColor" 
                                        strokeWidth="2"
                                    />
                                </svg>
                                <span>{isWished ? '찜 완료' : '찜하기'}</span>
                            </button>
                            <button
                                onClick={handlePriceAlertClick}
                                className={`${styles.priceAlertBadge} ${isPriceAlertEnabled ? styles.priceAlertEnabled : ''}`}
                            >
                                {isPriceAlertEnabled ? '💰 가격 알림' : '💸 가격 알림'}
                            </button>
                            <button
                                onClick={handleAlertClick}
                                className={`${styles.safetyBadge} ${isAlertEnabled ? styles.alertEnabled : ''}`}
                            >
                                {isAlertEnabled ? '🔔 안전 알림' : '🔕 안전 알림'}
                            </button>
                        </div>
                    </div>
                    
                    {/* 2-2. 가격 변동 추이 그래프 박스 */}
                    <div className={styles.infoBox}>
                        <h3 className={styles.boxTitle}>가격 변동 추이 그래프</h3>
                        
                        <div className={styles.chartArea}>
                            {priceHistory.length > 0 ? (
                                <div style={{padding: '20px', textAlign: 'center'}}>
                                    <p>총 {priceHistory.length}개의 가격 데이터</p>
                                    <p style={{fontSize: '0.9em', color: '#666'}}>
                                        최근: {new Date(priceHistory[0].collectedDate).toLocaleDateString('ko-KR')} - {priceHistory[0].priceValue.toLocaleString()}원
                                    </p>
                                    <p style={{fontSize: '0.9em', color: '#999', marginTop: '10px'}}>
                                        [차트 라이브러리 연동 필요]
                                    </p>
                                </div>
                            ) : (
                                '[가격 변동 그래프 영역 - 데이터 없음]'
                            )}
                        </div>
                        
                        <div className={styles.priceChangeSummary}>
                            <p style={{color: '#999'}}>1주일 전 대비: 구현 예정</p>
                            <p style={{color: '#999'}}>1개월 전 대비: 구현 예정</p>
                        </div>
                    </div>
                    
                    {/* 2-3. 식자재 정보 박스 */}
                    <div className={styles.infoBox}>
                        <h3 className={styles.boxTitle}>식자재 정보</h3>
                        <div className={styles.specInfo}>
                            <div className={styles.specRow}><span>카테고리:</span> {itemInfo.category || '-'}</div>
                            <div className={styles.specRow}>
                                <span>기준 단위:</span> 
                                {itemInfo.standardUnit ? (!itemInfo.standardUnit.startsWith('1') ? '1' + itemInfo.standardUnit : itemInfo.standardUnit) : '-'}
                            </div>
                            <div className={styles.specRow}><span>KAMIS 품목코드:</span> {itemInfo.kamisItemCode || '-'}</div>
                            <div className={styles.specRow}><span>KAMIS 품종코드:</span> {itemInfo.kamisKindCode || '-'}</div>
                            <div className={styles.specRow}>
                                <span>최근 수집일:</span> 
                                {itemInfo.collectedDate ? new Date(itemInfo.collectedDate).toLocaleString('ko-KR', {
                                    year: 'numeric',
                                    month: '2-digit',
                                    day: '2-digit',
                                    hour: '2-digit',
                                    minute: '2-digit',
                                    hour12: false
                                }).replace(/\. /g, '-').replace('.', '') : '-'}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default IngredientDetail;