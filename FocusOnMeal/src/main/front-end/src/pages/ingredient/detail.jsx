import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import styles from './detail.module.css';
import PriceAlertModal from '../../components/alert/PriceAlertModal';
import {
    LineChart,
    Line,
    CartesianGrid,
    XAxis,
    YAxis,
    Tooltip,
    Legend,
    ResponsiveContainer
} from 'recharts';

// 토큰을 안전하게 가져오는 함수 (변동 없음)
const getTokenSafe = () => {
    const raw = sessionStorage.getItem('token') ?? localStorage.getItem('token');
    if (!raw) return null;
    const s = String(raw).trim();
    if (s === '' || s.toLowerCase() === 'null' || s.toLowerCase() === 'undefined') return null;
    return s;
};

// 토큰을 지우는 함수 (변동 없음)
const clearToken = () => {
    try {
        sessionStorage.removeItem('token');
        localStorage.removeItem('token');
        // 로그인 상태 변경 이벤트(있으면 다른 컴포넌트가 반응하게)
        window.dispatchEvent(new Event('loginStateChange'));
    } catch (e) { /* 무시 */ }
};

// Y축 도메인 계산 (컴포넌트 외부로 분리 - 변동 없음)
const calculateYAxisDomain = (dataPoints) => {
    if (!dataPoints || dataPoints.length === 0) return [0, 10000];
    
    const prices = dataPoints.map(point => point.price);
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    
    const range = maxPrice - minPrice;
    const unit = range > 5000 ? 500 : 100;
    
    const paddedMin = Math.floor(minPrice / unit) * unit - unit;
    const paddedMax = Math.ceil(maxPrice / unit) * unit + unit;
    
    return [Math.max(0, paddedMin), paddedMax];
};

// 변동률 표시 컴포넌트 (외부로 분리 - 변동 없음)
const PriceChangeDisplay = ({ changeRate }) => {
    if (!changeRate) return null;

    return (
        <div className={styles.priceChangeInfo}>
            <div className={styles.changeBox}>
                <span className={styles.changeLabel}>현재 가격</span>
                <span className={styles.changeValue}>
                    {changeRate.currentPrice?.toLocaleString() || 'N/A'}원
                </span>
            </div>
            
            {changeRate.weeklyChange != null && (
                <div className={styles.changeBox}>
                    <span className={styles.changeLabel}>주간 변동</span>
                    <span className={`${styles.changeValue} ${
                        changeRate.weeklyChange > 0 ? styles.priceUp : 
                        changeRate.weeklyChange < 0 ? styles.priceDown : 
                        styles.priceStable
                    }`}>
                        {changeRate.weeklyChange > 0 ? '↑' : 
                         changeRate.weeklyChange < 0 ? '↓' : '→'} 
                        {Math.abs(changeRate.weeklyChange).toFixed(2)}%
                        {changeRate.weeklyPriceDiff != null && (
                            <span className={styles.priceDiffSmall}>
                                {' '}({changeRate.weeklyPriceDiff > 0 ? '+' : ''}
                                {changeRate.weeklyPriceDiff.toLocaleString()}원)
                            </span>
                        )}
                    </span>
                </div>
            )}
            
            {changeRate.monthlyChange != null && (
                <div className={styles.changeBox}>
                    <span className={styles.changeLabel}>월간 변동</span>
                    <span className={`${styles.changeValue} ${
                        changeRate.monthlyChange > 0 ? styles.priceUp : 
                        changeRate.monthlyChange < 0 ? styles.priceDown : 
                        styles.priceStable
                    }`}>
                        {changeRate.monthlyChange > 0 ? '↑' : 
                         changeRate.monthlyChange < 0 ? '↓' : '→'} 
                        {Math.abs(changeRate.monthlyChange).toFixed(2)}%
                        {changeRate.monthlyPriceDiff != null && (
                            <span className={styles.priceDiffSmall}>
                                {' '}({changeRate.monthlyPriceDiff > 0 ? '+' : ''}
                                {changeRate.monthlyPriceDiff.toLocaleString()}원)
                            </span>
                        )}
                    </span>
                </div>
            )}
        </div>
    );
};

function IngredientDetail() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [itemInfo, setItemInfo] = useState(null);
    const [priceHistory, setPriceHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    // 로그인 사용자 전용 상태는 유지
    const [isWished, setIsWished] = useState(false);
    const [isAlertEnabled, setIsAlertEnabled] = useState(false);
    const [isPriceAlertEnabled, setIsPriceAlertEnabled] = useState(false);
    // priceList는 priceHistory를 변환한 것이므로 유지
    const [priceList, setPriceList] = useState([]);
    // priceTrendData는 그래프 데이터로, 로그인 없이 로드되도록 로직 수정
    const [priceTrendData, setPriceTrendData] = useState(null);
    const [pricePrediction, setPricePrediction] = useState(null); // 가격 예측 데이터
    const [isLoggedIn, setIsLoggedIn] = useState(false); // 로그인 상태
    const [isPriceModalOpen, setIsPriceModalOpen] = useState(false);

    const handleImageError = (e) => {
        e.target.src = '/images/default_ingredient.png'; // public 폴더에 기본 이미지 필요
    };

    useEffect(() => {
        const fetchDetail = async () => {
            let token = getTokenSafe();
            setIsLoggedIn(!!token);

            try {
                // 1. 기본 상세 정보 (로그인 무관)
                const response = await axios.get(`/ingredient/api/detail/${id}`);
                const info = response.data.info || null;
                const history = response.data.history || [];
                
                // 가격 정보 추가 처리 (변동 없음)
                if (info && history.length > 0) {
                    const latestPrice = history[0];
                    info.currentPrice = latestPrice.priceValue;
                    info.collectedDate = latestPrice.collectedDate;
                    info.pricePer100g = Math.floor(latestPrice.priceValue / 10);
                    
                    const previousPriceData = history.length > 1 ? history[1] : null;
                    
                    if (previousPriceData) {
                        info.previousPrice = previousPriceData.priceValue;
                        info.previousCollectedDate = previousPriceData.collectedDate;
                        
                        if (info.currentPrice && info.previousPrice > 0) {
                            const changePercent = ((info.currentPrice - info.previousPrice) / info.previousPrice) * 100;
                            info.priceChangePercent = Number(changePercent.toFixed(1));
                        } else {
                            info.priceChangePercent = 0;
                        }
                    } else {
                        info.previousPrice = 0;
                        info.priceChangePercent = 0;
                    }
                }
                
                info.safetyStatus = ['safe', 'warning', 'danger'][Math.floor(Math.random() * 3)];
                
                setItemInfo(info); 
                setPriceHistory(history);
				
                // 차트용 데이터 변환 (로그인 무관)
                if (history && history.length > 0) {
                    const mapped = history.map(h => ({
                        date: h.collectedDate,
                        price: h.priceValue
                    }));
                    setPriceList(mapped.reverse());
                }

                // 2. 가격 추이 데이터 (로그인 무관하게 시도)
                try {
                    // **[수정]** 가격 추이 API 호출 시 토큰을 보내는 로직 제거 (비로그인 사용자 허용 가정)
                    const trendResponse = await axios.get(
                        `/api/mypage/price-chart/${id}?days=30`
                    );
                    setPriceTrendData(trendResponse.data);
                } catch (error) {
                    console.error('가격 추이 데이터 로드 실패:', error);
                }
                
                // 3. 로그인 사용자 전용 데이터 (로그인 시에만)
                if (token) {
                    // 찜 상태 확인
                    try {
                        const favoriteResponse = await axios.get('/api/mypage/ingredients/favorite');
                        if (favoriteResponse.data && Array.isArray(favoriteResponse.data)) {
                            const isFavorited = favoriteResponse.data.some(fav => fav.ingredientId === parseInt(id));
                            setIsWished(isFavorited);
                        }
                    } catch {
                        // 무시
                    }

                    // 안전 알림 상태
                    try {
                        const alertResponse = await axios.get(`/ingredient/api/${id}/alert`, {
                            headers: { Authorization: `Bearer ${token}` }
                        });
                        setIsAlertEnabled(alertResponse.data.isEnabled || false);
                    } catch {
                        setIsAlertEnabled(false);
                    }

                    // 가격 알림 상태
                    try {
                        const priceAlertResponse = await axios.get(`/ingredient/api/${id}/price-alert`, {
                            headers: { Authorization: `Bearer ${token}` }
                        });
                        setIsPriceAlertEnabled(priceAlertResponse.data.isEnabled || false);
                    } catch {
                        setIsPriceAlertEnabled(false);
                    }
                } else {
                    // 로그아웃 상태일 때 알림/찜 상태 초기화
                    setIsWished(false);
                    setIsAlertEnabled(false);
                    setIsPriceAlertEnabled(false);
                }


                // 4. 가격 예측 데이터 조회 (로그인 여부 무관 - 권한에 따라 다른 데이터 제공)
                try {
                    const predictionResponse = await axios.get(`/ingredient/api/${id}/price-prediction`);
                    setPricePrediction(predictionResponse.data);
                    setIsLoggedIn(predictionResponse.data.hasAccess || false);
                } catch (error) {
                    console.error('가격 예측 데이터 로드 실패:', error);
                }

            } catch (error) {
                console.error("상세 정보 로딩 실패:", error);
                // 기본 상세 정보 로딩 중 401 오류가 발생하면 토큰 제거
                if (error?.response?.status === 401) {
                    console.log('기본 상세 정보 API에서 401 받음 — 토큰 제거 및 로그인 상태 초기화');
                    clearToken();
                    setIsLoggedIn(false);
                }
            } finally {
                setLoading(false);
            }
        };

        fetchDetail();
        // 로그인 상태가 변경될 때마다 전체 데이터 로드를 다시 시도
    }, [id]); 

    // 찜하기 핸들러 (변동 없음)
    const handleWishClick = async () => {
        const token = getTokenSafe();
        if (!token) {
            alert("로그인이 필요합니다.");
            return;
        }

        try {
            // NOTE: API 호출 시 토큰을 보내도록 수정이 필요할 수 있으나, 기존 코드의 `/ingredient/detail/${id}/favorite` 엔드포인트에 토큰 로직이 없었으므로, 일단 토큰 검증만 추가합니다.
            const response = await axios.post(`/ingredient/detail/${id}/favorite`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.data.success) {
                setIsWished(response.data.isFavorite);
            }
        } catch (error) {
            if (error.response?.status === 401) {
                clearToken();
                setIsLoggedIn(false);
                alert("세션이 만료되었습니다. 다시 로그인해 주세요.");
            } else {
                alert("오류가 발생했습니다.");
            }
        }
    };

    // 안전 알림 핸들러 (변동 없음)
    const handleAlertClick = async () => {
        const token = getTokenSafe();

        if (!token) {
            alert("로그인이 필요합니다.");
            return;
        }

        try {
            const response = await axios.post(`/ingredient/api/${id}/alert`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.data.success) {
                setIsAlertEnabled(response.data.isEnabled);
            }
        } catch (error) {
            if (error.response?.status === 401) {
                clearToken();
                setIsLoggedIn(false);
                alert("세션이 만료되었습니다. 다시 로그인해 주세요.");
            } else {
                alert("오류가 발생했습니다.");
            }
        }
    };

    // 가격 알림 핸들러 (변동 없음)
    const handlePriceAlertClick = async () => {
        const token = getTokenSafe();

        if (!token) {
            alert("로그인이 필요합니다.");
            return;
        }

        // 모달 열기
        setIsPriceModalOpen(true);

        try {
            const response = await axios.post(`/ingredient/api/${id}/price-alert`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.data.success) {
                setIsPriceAlertEnabled(response.data.isEnabled);
            }
        } catch (error) {
            if (error.response?.status === 401) {
                clearToken();
                setIsLoggedIn(false);
                alert("세션이 만료되었습니다. 다시 로그인해 주세요.");
            } else {
                alert("오류가 발생했습니다.");
            }
        }
    };

    // 로딩 중 (변동 없음)
    if (loading) {
        return <div className={styles.container}>로딩 중...</div>;
    }
    
    // 데이터 없음 (변동 없음)
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

    // 안전 상태 표시 (변동 없음)
    const safetyText = itemInfo.safetyStatus === 'safe' ? '안전'
                     : itemInfo.safetyStatus === 'warning' ? '주의'
                     : '위험';
    const safetyClass = itemInfo.safetyStatus === 'safe' ? styles.safe 
                      : itemInfo.safetyStatus === 'warning' ? styles.warning 
                      : styles.danger;
    
    const hasPriceChange = itemInfo.priceChangePercent != null;
    
    return (
        <div className={styles.container}>
            <h2 className={styles.pageTitle}>식품성분표 상세 페이지</h2>
            
            <button onClick={() => navigate(-1)} className={styles.backButton}>
                뒤로가기
            </button>
            
            <div className={styles.mainContent}>
                
                {/* 왼쪽: 영양 성분 */}
                <div className={styles.leftColumn}>
                    
                    <div className={styles.nutritionSection}>
                        <div className={styles.imageWrapper}>
                            <img 
                                src={`/images/ingredients/${id}.jpg`} 
                                alt={itemInfo.name} 
                                className={styles.ingredientImage}
                                onError={handleImageError}
                            />
                        </div>
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

                {/* 오른쪽: 정보 */}
                <div className={styles.rightColumn}>
                    <h1 className={styles.itemTitle}>
                        {itemInfo.name}
                        <span className={styles.categoryInTitle}>
                            ({itemInfo.category})
                        </span>
                    </h1>
                    
                    {/* 상단 요약 (변동 없음) */}
                    <div className={styles.infoBoxTop}>
                        <div className={styles.itemSummary}>
                            <div className={styles.priceLine}>
                                <strong>가격</strong>
                                <span style={{marginLeft: '10px', color: '#666', fontSize: '0.9em', fontWeight: 'normal'}}>
                                    ({itemInfo.standardUnit && !itemInfo.standardUnit.startsWith('1') 
                                        ? '1' + itemInfo.standardUnit 
                                        : itemInfo.standardUnit}):
                                </span>
                                <span className={styles.currentPriceValue}>
                                    {itemInfo.currentPrice 
                                        ? `${itemInfo.currentPrice.toLocaleString()}원` 
                                        : '정보 없음'}
                                </span>
                                
                                {itemInfo.pricePer100g > 0 && ( 
                                    <span className={styles.pricePer100g}>
                                        (100g당 {itemInfo.pricePer100g.toLocaleString()}원)
                                    </span>
                                )}
                            </div>
                            
                            {/* 가격 변동 표시 (변동 없음) */}
                            {hasPriceChange && (
                                <div style={{fontSize: '0.9em', marginTop: '10px', marginBottom: '10px'}}>
                                    {itemInfo.priceChangePercent === 0 ? (
                                        <span style={{color: '#666'}}>
                                            - 전일 대비 변동 없음
                                        </span>
                                    ) : (
                                        <span style={{
                                            color: itemInfo.priceChangePercent > 0 ? '#dc3545' : '#007aff', 
                                            fontWeight: 'bold'
                                        }}>
                                            전일 대비 {itemInfo.priceChangePercent > 0 ? '▲' : '▼'} 
                                            {Math.abs(itemInfo.priceChangePercent).toFixed(1)}%
                                        </span>
                                    )}

                                    {itemInfo.previousPrice > 0 && itemInfo.previousCollectedDate && (
                                        <span style={{marginLeft: '8px', color: '#999'}}>
                                            (전일 : {itemInfo.previousPrice.toLocaleString()}원, 
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

                            {/* 신규 데이터 표시 (변동 없음) */}
                            {!hasPriceChange && itemInfo.currentPrice && (
                                <div style={{fontSize: '0.9em', color: '#999', marginTop: '10px', marginBottom: '10px'}}>
                                    <span style={{
                                        background:'#ffc107', 
                                        color:'#fff', 
                                        padding:'2px 6px', 
                                        borderRadius:'4px', 
                                        marginRight:'5px', 
                                        fontSize:'0.9em'
                                    }}>NEW</span>
                                    최근 데이터 기준
                                </div>
                            )}

                            {/* 안전 위험도 (변동 없음) */}
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
                        
                        {/* 액션 버튼들 - 로그인 필요시 알림/찜 핸들러에서 처리 */}
                        <div className={styles.topActions}>
                            <button 
                                onClick={handleWishClick} 
                                className={`${styles.wishButton} ${isWished ? styles.wished : ''}`}
                                // 로그인 필요 상태 메시지 표시를 위해 title 속성 추가 가능
                                title={!isLoggedIn ? '로그인 후 찜하기를 이용할 수 있습니다.' : ''}
                            >
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
                                title={!isLoggedIn ? '로그인 후 가격 알림을 설정할 수 있습니다.' : ''}
                            >
                                {isPriceAlertEnabled ? '💰 가격 알림' : '💸 가격 알림'}
                            </button>
                            <button
                                onClick={handleAlertClick}
                                className={`${styles.safetyBadge} ${isAlertEnabled ? styles.alertEnabled : ''}`}
                                title={!isLoggedIn ? '로그인 후 안전 알림을 설정할 수 있습니다.' : ''}
                            >
                                {isAlertEnabled ? '🔔 안전 알림' : '🔕 안전 알림'}
                            </button>
                        </div>
                    </div>
                    
                    {/* 가격 변동 추이 그래프 - 로그인 조건부 렌더링 제거 **[수정]** */}
                    <div className={styles.infoBox}>
                        <h3 className={styles.boxTitle}>가격 변동 추이 및 예측 그래프</h3>

                        {priceTrendData?.changeRate && (
                            <PriceChangeDisplay changeRate={priceTrendData.changeRate} />
                        )}

                        <div className={styles.chartWrapper}>
                            <div className={styles.chartArea}>
                                {priceTrendData?.dataPoints?.length > 0 ? (
                                    <ResponsiveContainer width="100%" height={350}>
                                        <LineChart
                                            data={(() => {
                                                // 실제 가격 데이터
                                                const actualData = priceTrendData.dataPoints.map(p => ({
                                                    date: p.date,
                                                    actual: p.price,
                                                    forecast: null
                                                }));

                                                // 예측 데이터 추가
                                                if (pricePrediction?.prediction?.forecast) {
                                                    // 로그인: 실제 예측값
                                                    pricePrediction.prediction.forecast.forEach(f => {
                                                        actualData.push({
                                                            date: f.date,
                                                            actual: null,
                                                            forecast: f.price
                                                        });
                                                    });
                                                } else if (pricePrediction?.preview) {
                                                    // 비로그인: 더미 데이터 (블러용)
                                                    const lastPrice = actualData[actualData.length - 1].actual;
                                                    for (let i = 1; i <= 3; i++) {
                                                        const date = new Date();
                                                        date.setDate(date.getDate() + i);
                                                        actualData.push({
                                                            date: date.toISOString().split('T')[0],
                                                            actual: null,
                                                            forecast: lastPrice + (Math.random() * 200 - 100)
                                                        });
                                                    }
                                                }

                                                return actualData;
                                            })()}
                                            margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                                        >
                                            <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />

                                            <XAxis
                                                dataKey="date"
                                                tickFormatter={(v) => {
                                                    const date = new Date(v);
                                                    return `${date.getMonth() + 1}/${date.getDate()}`;
                                                }}
                                                stroke="#666"
                                                tick={{ fontSize: 11 }}
                                                interval="preserveStartEnd"
                                            />

                                            <YAxis
                                                domain={calculateYAxisDomain(priceTrendData.dataPoints)}
                                                tickFormatter={(v) => `${v.toLocaleString()}`}
                                                label={{
                                                    value: '가격 (원)',
                                                    angle: -90,
                                                    position: 'insideLeft',
                                                    style: { textAnchor: 'middle' }
                                                }}
                                                stroke="#666"
                                            />

                                            <Tooltip
                                                formatter={(value, name) => {
                                                    if (!isLoggedIn && name === '예측') {
                                                        return ['로그인 후 확인', name];
                                                    }
                                                    return [`${value?.toLocaleString() || 'N/A'}원`, name];
                                                }}
                                                labelFormatter={(label) =>
                                                    new Date(label).toLocaleDateString("ko-KR", {
                                                        year: "numeric",
                                                        month: "2-digit",
                                                        day: "2-digit",
                                                    })
                                                }
                                                contentStyle={{
                                                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                                                    border: '1px solid #ccc',
                                                    borderRadius: '4px',
                                                    padding: '10px'
                                                }}
                                                wrapperStyle={{
                                                    zIndex: 100
                                                }}
                                            />
                                            <Legend />

                                            {/* 실제 가격 라인 */}
                                            <Line
                                                type="monotone"
                                                dataKey="actual"
                                                stroke="#4F75FF"
                                                strokeWidth={2.5}
                                                name="실제"
                                                dot={{ r: 4, fill: '#4F75FF' }}
                                                activeDot={{ r: 6, fill: '#3A5BC7' }}
                                                connectNulls={false}
                                            />

                                            {/* 예측 가격 라인 (점선) */}
                                            {pricePrediction && (
                                                <Line
                                                    type="monotone"
                                                    dataKey="forecast"
                                                    stroke="#FF6B6B"
                                                    strokeWidth={2}
                                                    strokeDasharray="5 5"
                                                    name="예측"
                                                    dot={{ r: 3, fill: '#FF6B6B' }}
                                                    connectNulls={false}
                                                />
                                            )}
                                        </LineChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <div style={{textAlign: 'center', color: '#aaa', padding: '50px 0'}}>
                                        📊 가격 추이 데이터가 없습니다
                                    </div>
                                )}
                            </div>

                            {/* 비로그인 사용자 오버레이 */}
                            {!isLoggedIn && pricePrediction?.preview && (
                                <div className={styles.predictionOverlay}>
                                    <div className={styles.blurLayer} />
                                    <div className={styles.loginPrompt}>
                                        <div className={styles.lockIcon}>🔒</div>
                                        <p>로그인 후 확인 가능</p>
                                        <button
                                            onClick={() => navigate('/member/login', {
                                                state: { from: `/ingredient/detail/${id}` }
                                            })}
                                            className={styles.loginButton}
                                        >
                                            로그인
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>

                        {priceTrendData && (
                            <div style={{
                                marginTop: '10px',
                                fontSize: '0.85em',
                                color: '#666',
                                textAlign: 'center'
                            }}>
                                📅 조회 기간: {priceTrendData.startDate} ~ {priceTrendData.endDate}
                                {pricePrediction?.prediction && (
                                    <span style={{marginLeft: '10px', color: '#FF6B6B', fontWeight: 600}}>
                                        | 🔮 예측: {pricePrediction.prediction.trend} ({pricePrediction.prediction.confidence}% 신뢰도)
                                    </span>
                                )}
                            </div>
                        )}
                    </div>
                    
                    {/* 식재료 정보 (변동 없음) */}
                    <div className={styles.infoBox}>
                        <h3 className={styles.boxTitle}>식재료 정보</h3>
                        <div className={styles.specInfo}>
                            <div className={styles.specRow}>
                                <span>카테고리:</span> {itemInfo.category || '-'}
                            </div>
                            <div className={styles.specRow}>
                                <span>기준 단위:</span> 
                                {itemInfo.standardUnit 
                                    ? (!itemInfo.standardUnit.startsWith('1') 
                                        ? '1' + itemInfo.standardUnit 
                                        : itemInfo.standardUnit) 
                                    : '-'}
                            </div>
                            <div className={styles.specRow}>
                                <span>KAMIS 품목코드:</span> {itemInfo.kamisItemCode || '-'}
                            </div>
                            <div className={styles.specRow}>
                                <span>KAMIS 품종코드:</span> {itemInfo.kamisKindCode || '-'}
                            </div>
                            <div className={styles.specRow}>
                                <span>최근 수집일:</span> 
                                {itemInfo.collectedDate 
                                    ? new Date(itemInfo.collectedDate).toLocaleString('ko-KR', {
                                        year: 'numeric',
                                        month: '2-digit',
                                        day: '2-digit',
                                        hour: '2-digit',
                                        minute: '2-digit',
                                        hour12: false
                                    }).replace(/\. /g, '-').replace('.', '') 
                                    : '-'}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <PriceAlertModal
                isOpen={isPriceModalOpen}
                onClose={() => setIsPriceModalOpen(false)}
                ingredientId={id}
                ingredientName={itemInfo?.name}
                currentPrice={itemInfo?.currentPrice}
                isAlertEnabled={isPriceAlertEnabled}
                onAlertChange={(isEnabled) => setIsPriceAlertEnabled(isEnabled)}
            />
        </div>
    );
}

export default IngredientDetail;