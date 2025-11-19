import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import styles from './detail.module.css';

// 🚨 UI 테스트를 위한 임의 함수 (실제 데이터가 없는 경우 대체)
const getDummyInfo = (id) => ({
    id,
    name: "감자",
    category: "채소류",
    standardUnit: "1kg",
    currentPrice: 5000,
    pricePer100g: 500, // 5000원/10=500원 (1kg 기준)
    safetyStatus: 'warning', // 'safe', 'warning', 'danger'
    
    // 가격 변동 더미 데이터 (주간/월간 변동)
    priceChangeWeek: { amount: 200, percent: 5.5, direction: 'up' }, // 1주일 전 대비
    priceChangeMonth: { amount: 200, percent: 5.0, direction: 'down' }, // 1개월 전 대비
    
    // 식자재 정보 더미
    productionOrigin: '강원, 경기 등',
    harvestSeason: '6월~10월',
    storageMethod: '서늘한 곳',
    efficacy: '피로회복, 혈압 안정',
    registeredDate: '2025-11-04'
});

function IngredientDetail() {
    const { id } = useParams();
    const navigate = useNavigate(); 
    
    const [itemInfo, setItemInfo] = useState(null); 
    const [_priceHistory, setPriceHistory] = useState([]); 
    const [loading, setLoading] = useState(true);
    const [isWished, setIsWished] = useState(false); 

    useEffect(() => {
        const fetchDetail = async () => {
            try {
                const response = await axios.get(`/ingredient/api/detail/${id}`);
                const info = response.data.info || getDummyInfo(id);
                const history = response.data.history || [];
                
                if (info && info.nutrition) {
                    delete info.nutrition; 
                }
                
                setItemInfo(info); 
                setPriceHistory(history); 

            } catch (error) {
                console.error("상세 정보 로딩 실패:", error);
                setItemInfo(getDummyInfo(id)); 
            } finally {
                setLoading(false);
            }
        };
        fetchDetail();
    }, [id]);

    const handleWishClick = () => {
        setIsWished(prev => !prev);
        alert(isWished ? "찜 취소되었습니다." : "찜 목록에 추가되었습니다.");
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
                    
    const priceChangeWeek = itemInfo.priceChangeWeek || {};
    const priceChangeMonth = itemInfo.priceChangeMonth || {};

    const getChangeDisplay = (change) => {
        if (!change || change.amount === undefined) return '-';
        const indicator = change.direction === 'up' ? '▲' : '▼';
        const colorClass = change.direction === 'up' ? styles.priceUp : styles.priceDown;
        const sign = change.direction === 'up' ? '+' : '-';
        
        return (
            <span className={colorClass}>
                *{change.amount.toLocaleString()}원 / ({indicator} {sign}{change.percent}%)
            </span>
        );
    };


    // 정상 렌더링
    return (
        <div className={styles.container}>
            <h2 className={styles.pageTitle}>식품성분표 상세 페이지</h2>
            
            <button onClick={() => navigate(-1)} className={styles.backButton}>
                뒤로가기
            </button>
            
            <div className={styles.mainContent}>
                
                {/* 1. 왼쪽 컬럼: 이미지 및 영양 성분 */}
                <div className={styles.leftColumn}>
                    
                    {/* 식자재 이미지 [300x300] */}
                    <div className={styles.imagePlaceholder}>
                        식자재 이미지 [300x300]
                    </div>
                    
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
                                    <tr className={styles.noDataRow}><td colSpan="3">NUTRITION_MASTER 테이블에 데이터가 없습니다.</td></tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* 2. 오른쪽 컬럼: 정보 박스들 */}
                <div className={styles.rightColumn}>
                    <h1 className={styles.itemTitle}>
                        {/* 품목명과 카테고리를 괄호로 묶어 표시 */}
                        {itemInfo.name} 
                        <span className={styles.categoryInTitle}>
                            ({itemInfo.category})
                        </span>
                    </h1>
                    
                    {/* 2-1. 상단 요약 박스 (가격, 안전, 찜하기) */}
                    <div className={styles.infoBoxTop}>
                        <div className={styles.itemSummary}>
                            
                            {/* 🚨 가격 정보: list.jsx와 동일한 간결한 형식 */}
                            <div className={styles.priceLine}>
                                <strong>가격 ({itemInfo.standardUnit}):</strong> 
                                <span className={styles.currentPriceValue}>
                                    {itemInfo.currentPrice ? `${itemInfo.currentPrice.toLocaleString()}원` : '정보 없음'}
                                </span>
                                
                                {itemInfo.pricePer100g > 0 && ( 
                                    <span className={styles.pricePer100g}>
                                        (100g당 {itemInfo.pricePer100g.toLocaleString()}원)
                                    </span>
                                )}
                            </div>

                            {/* 🚨 안전 위험도 + 툴팁 추가 */}
                            <div className={styles.safetyLine}>
                                <strong>안전 위험도:</strong> 
                                <span className={safetyClass}>{safetyText}</span>
                                
                                <span className={styles.tooltipContainer}>
                                    <span className={styles.helpIcon}>?</span>
                                    <div className={styles.tooltipBox}>
                                        <h4 className={styles.tooltipTitle}>안전 위험도 기준</h4>
                                        {/* 🚨 툴팁 텍스트 구조 변경 */}
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
                            <button onClick={handleWishClick} className={`${styles.wishButton} ${isWished ? styles.wished : ''}`}>
                                {isWished ? '❤️ 찜하기' : '🤍 찜하기'}
                            </button>
                            <span className={styles.safetyBadge}>안전 알림</span>
                        </div>
                    </div>
                    
                    {/* 2-2. 가격 변동 추이 그래프 박스 */}
                    <div className={styles.infoBox}>
                        <h3 className={styles.boxTitle}>가격 변동 추이 그래프</h3>
                        
                        <div className={styles.chartArea}>
                            [가격 변동 그래프 영역]
                        </div>
                        
                        <div className={styles.priceChangeSummary}>
                            <p>1주일 전 대비: {getChangeDisplay(priceChangeWeek)}</p>
                            <p>1개월 전 대비: {getChangeDisplay(priceChangeMonth)}</p>
                        </div>
                    </div>
                    
                    {/* 2-3. 식자재 정보 박스 */}
                    <div className={styles.infoBox}>
                        <h3 className={styles.boxTitle}>식자재 정보</h3>
                        <div className={styles.specInfo}>
                            <div className={styles.specRow}><span>생산지:</span> {itemInfo.productionOrigin || '-'}</div> 
                            <div className={styles.specRow}><span>주요 산지:</span> {itemInfo.harvestSeason || '-'}</div>
                            <div className={styles.specRow}><span>보관 방법:</span> {itemInfo.storageMethod || '-'}</div>
                            <div className={styles.specRow}><span>효능:</span> {itemInfo.efficacy || '-'}</div>
                            <div className={styles.specRow}><span>등록일:</span> {itemInfo.registeredDate || '-'}</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default IngredientDetail;