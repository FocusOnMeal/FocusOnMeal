import { Link } from "react-router-dom";
import styles from './Dashboard.module.css';
import axios from "axios";
import Sidebar from "../../components/mypage/Sidebar";
import { useEffect, useState } from "react";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer
} from 'recharts';

const Dashboard = () => {
    const [dashboard, setDashboard] = useState(null);
    const [selectedChart, setSelectedChart] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = sessionStorage.getItem('token');
        console.log('🔍 토큰 확인:', token ? '있음' : '없음');
        console.log('🔍 토큰 값:', token);

        if (!token) {
            alert('로그인이 필요합니다.');
            navigate('/member/login');
            return;
        }

        if (!token) {
            console.error("JWT 토큰 없음 → 로그인 필요");
            return;
        }

        axios.get("http://localhost:8080/api/mypage/dashboard", {
            headers: {
                Authorization: `Bearer ${token}`
            }
        })
        .then(res => {
            console.log(res.data);
            setDashboard(res.data);
            console.log('📊 전체 Dashboard 데이터:', res.data);
            console.log('🥕 찜한 식자재 배열:', res.data.favoriteIngredients);

            // 첫 번째 식자재 상세 확인
            if (res.data.favoriteIngredients && res.data.favoriteIngredients.length > 0) {
                console.log('🔍 첫 번째 식자재 상세:', res.data.favoriteIngredients[0]);
            }
            
            setDashboard(res.data);
            if (res.data.defaultPriceChart) {
                setSelectedChart(res.data.defaultPriceChart);
            }
            setLoading(false);

            // 기본 차트 설정 (PriceTrendResponse 형태)
            if (res.data.defaultPriceChart) {
                setSelectedChart(res.data.defaultPriceChart);
            }
            setLoading(false);
        })
        .catch(err => {
            console.error(err);
            setLoading(false);
        });
    }, []);

    // ✅ 수정: 61줄 - localStorage → sessionStorage
    const handleIngredientClick = async (ingredientId) => {
        const token = sessionStorage.getItem("token");
        
        try {
            const response = await axios.get(
                `http://localhost:8080/api/mypage/price-chart/${ingredientId}?days=30`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );
            setSelectedChart(response.data);
        } catch (err) {
            console.error("차트 로드 실패:", err);
        }
    };

    // 차트 데이터 포맷팅 (PriceTrendResponse의 dataPoints 사용)
    const formatChartData = (dataPoints) => {
        if (!dataPoints || dataPoints.length === 0) return [];
        
        return dataPoints.map(point => ({
            date: point.date,
            price: point.price,
            priceType: point.priceType || '평균'
        }));
    };

    // 등락률 표시 컴포넌트
    const ChangeRateDisplay = ({ changeRate }) => {
        if (!changeRate) return null;

        return (
            <div className={styles.changeRateInfo}>
                <div className={styles.currentPrice}>
                    <span className={styles.label}>현재 가격</span>
                    <span className={styles.value}>
                        {changeRate.currentPrice.toLocaleString()}원
                    </span>
                </div>
                {changeRate.weeklyChange !== null && (
                    <div className={styles.changeItem}>
                        <span className={styles.label}>주간 변동</span>
                        <span className={`${styles.value} ${
                            changeRate.weeklyChange > 0 ? styles.up : 
                            changeRate.weeklyChange < 0 ? styles.down : 
                            styles.stable
                        }`}>
                            {changeRate.weeklyChange > 0 ? '↑' : 
                            changeRate.weeklyChange < 0 ? '↓' : '→'} 
                            {Math.abs(changeRate.weeklyChange).toFixed(2)}%
                        </span>
                    </div>
                )}
                {changeRate.monthlyChange !== null && (
                    <div className={styles.changeItem}>
                        <span className={styles.label}>월간 변동</span>
                        <span className={`${styles.value} ${
                            changeRate.monthlyChange > 0 ? styles.up : 
                            changeRate.monthlyChange < 0 ? styles.down : 
                            styles.stable
                        }`}>
                            {changeRate.monthlyChange > 0 ? '↑' : 
                            changeRate.monthlyChange < 0 ? '↓' : '→'} 
                            {Math.abs(changeRate.monthlyChange).toFixed(2)}%
                        </span>
                    </div>
                )}
            </div>
        );
    };

    if (loading) return <div className={styles.loading}>Loading...</div>;
    if (!dashboard) return <div className={styles.error}>데이터를 불러올 수 없습니다.</div>;

    return (
        <div className={styles.dashboardContainer}>
            <Sidebar />

            <div className={styles.dashboardContent}>
                <h2>{dashboard.memberInfo.memberNickname} 님의 마이페이지</h2>

                {/* 물가 추이 그래프 섹션 */}
                <div className={styles.chartSection}>
                    <h3>식자재 물가 추이</h3>
                    {selectedChart && selectedChart.dataPoints && selectedChart.dataPoints.length > 0 ? (
                        <div className={styles.chartContainer}>
                            <div className={styles.chartHeader}>
                                <h4>
                                    {selectedChart.ingredientName}
                                    <span className={styles.unit}>
                                        ({selectedChart.standardUnit})
                                    </span>
                                </h4>
                                <ChangeRateDisplay changeRate={selectedChart.changeRate} />
                            </div>
                            
                            <ResponsiveContainer width="100%" height={350}>
                                <LineChart data={formatChartData(selectedChart.dataPoints)}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis 
                                        dataKey="date" 
                                        tickFormatter={(value) => {
                                            const date = new Date(value);
                                            return `${date.getMonth() + 1}/${date.getDate()}`;
                                        }}
                                    />
                                    <YAxis 
                                        tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
                                    />
                                    <Tooltip 
                                        formatter={(value) => [`${value.toLocaleString()}원`, '가격']}
                                        labelFormatter={(value) => `날짜: ${value}`}
                                    />
                                    <Legend />
                                    <Line 
                                        type="monotone" 
                                        dataKey="price" 
                                        stroke="#4CAF50" 
                                        strokeWidth={2}
                                        name="가격 (원)" 
                                        dot={{ r: 3 }}
                                        activeDot={{ r: 5 }}
                                    />
                                </LineChart>
                            </ResponsiveContainer>

                            <div className={styles.chartFooter}>
                                <span className={styles.period}>
                                    조회 기간: {selectedChart.startDate} ~ {selectedChart.endDate}
                                </span>
                                {selectedChart.priceType && (
                                    <span className={styles.priceType}>
                                        가격 유형: {selectedChart.priceType}
                                    </span>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className={styles.noChart}>
                            <p>표시할 물가 데이터가 없습니다.</p>
                            <p>찜한 식자재를 선택하면 해당 식자재의 물가 추이를 확인할 수 있습니다.</p>
                        </div>
                    )}
                </div>

                {/* 하단: 식단 리스트 & 찜한 식자재 리스트 */}
                <div className={styles.listsContainer}>
                    
                    {/* 왼쪽: 식단 리스트 */}
                    <div className={styles.listSection}>
                        <div className={styles.listHeader}>
                            <h3>내 식단</h3>
                            <span className={styles.count}>{dashboard.favoriteMealCount}개</span>
                        </div>
                        <div className={styles.listContent}>
                            {dashboard.mealPlans && dashboard.mealPlans.length > 0 ? (
                                dashboard.mealPlans.map(meal => (
                                    <div key={meal.planId} className={styles.listItem}>
                                        <div className={styles.itemInfo}>
                                            <h4>{meal.planName}</h4>
                                            <p className={styles.price}>
                                                {meal.totalCost.toLocaleString()}원 
                                                <span className={styles.servings}> ({meal.servingSize}인분)</span>
                                            </p>
                                        </div>
                                        <Link 
                                            to="/mypage/favoriteMeals" 
                                            className={styles.detailBtn}
                                        >
                                            상세보기
                                        </Link>
                                    </div>
                                ))
                            ) : (
                                <p className={styles.emptyMessage}>저장된 식단이 없습니다.</p>
                            )}
                        </div>
                        {dashboard.favoriteMealCount > 10 && (
                            <Link to="/mypage/favoriteMeals" className={styles.viewAll}>
                                전체 보기 →
                            </Link>
                        )}
                    </div>

                    {/* 오른쪽: 찜한 식자재 리스트 */}
                    <div className={styles.listSection}>
                        <div className={styles.listHeader}>
                            <h3>찜한 식자재</h3>
                            <span className={styles.count}>{dashboard.favoriteIngredientCount}개</span>
                        </div>
                        {/* 찜한 식자재 리스트 렌더링 부분 */} 
                        <div className={styles.listContent}>
                            {dashboard.favoriteIngredients && dashboard.favoriteIngredients.length > 0 ? (
                                dashboard.favoriteIngredients.map(ingredient => {
                                    console.log('🎨 렌더링 중인 식자재:', ingredient); // 디버깅 로그 추가
                                    
                                    return (
                                        <div 
                                            key={ingredient.favoriteId} 
                                            className={styles.listItem}
                                            onClick={() => handleIngredientClick(ingredient.ingredientId)}
                                            style={{ cursor: 'pointer' }}
                                        >
                                            <div className={styles.itemInfo}>
                                                <h4>
                                                    {ingredient.ingredientName || '이름 없음'}
                                                    {ingredient.isCustom === 'Y' && (
                                                        <span className={styles.customBadge}>커스텀</span>
                                                    )}
                                                </h4>
                                                <p className={styles.price}>
                                                    {ingredient.currentPrice 
                                                        ? `${Number(ingredient.currentPrice).toLocaleString()}원/${ingredient.standardUnit}`
                                                        : '가격 정보 없음'
                                                    }
                                                </p>
                                            </div>
                                            <Link 
                                                to="/mypage/favoriteIngredients" 
                                                className={styles.detailBtn}
                                                onClick={(e) => e.stopPropagation()}
                                            >
                                                상세보기
                                            </Link>
                                        </div>
                                    );
                                })
                            ) : (
                                <p className={styles.emptyMessage}>찜한 식자재가 없습니다.</p>
                            )}
                        </div>
                        {dashboard.favoriteIngredientCount > 10 && (
                            <Link to="/mypage/favoriteIngredients" className={styles.viewAll}>
                                전체 보기 →
                            </Link>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;