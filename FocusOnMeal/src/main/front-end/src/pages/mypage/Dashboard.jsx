import { Link, useNavigate } from "react-router-dom";
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
    const navigate = useNavigate();
    const [dashboard, setDashboard] = useState(null);
    const [selectedChart, setSelectedChart] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = sessionStorage.getItem('token');
        console.log('🔍 토큰 확인:', token ? '있음' : '없음');

        if (!token) {
            alert('로그인이 필요합니다.');
            navigate('/member/login', {
                state: { from: '/mypage/dashboard' }
            });
            return;
        }

        axios.get("http://localhost:8080/api/mypage/dashboard", {
            headers: {
                Authorization: `Bearer ${token}`
            }
        })
        .then(res => {
            console.log('📊 전체 Dashboard 데이터:', res.data);
            console.log('🥕 찜한 식재료 배열:', res.data.favoriteIngredients);

            if (res.data.favoriteIngredients && res.data.favoriteIngredients.length > 0) {
                console.log('🔍 첫 번째 식재료 상세:', res.data.favoriteIngredients[0]);
            }
            
            setDashboard(res.data);
            
            if (res.data.defaultPriceChart) {
                console.log('📈 기본 차트 데이터:', res.data.defaultPriceChart);
                console.log('📊 변동률 정보:', res.data.defaultPriceChart.changeRate);
                setSelectedChart(res.data.defaultPriceChart);
            }
            setLoading(false);
        })
        .catch(err => {
            console.error('❌ Dashboard 로드 실패:', err);
            setLoading(false);
        });
    }, [navigate]);

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
            console.log('📈 선택한 식재료 차트 데이터:', response.data);
            console.log('📊 변동률 정보:', response.data.changeRate);
            setSelectedChart(response.data);
        } catch (err) {
            console.error("❌ 차트 로드 실패:", err);
        }
    };

    const formatChartData = (dataPoints) => {
        if (!dataPoints || dataPoints.length === 0) return [];
        
        console.log('📊 차트 데이터 포인트 개수:', dataPoints.length);
        console.log('📊 첫 데이터:', dataPoints[0]);
        console.log('📊 마지막 데이터:', dataPoints[dataPoints.length - 1]);
        
        return dataPoints.map(point => ({
            date: point.date,
            price: point.price,
            priceType: point.priceType || '평균'
        }));
    };

    const calculateYAxisDomain = (dataPoints) => {
        if (!dataPoints || dataPoints.length === 0) return [0, 10000];
        
        const prices = dataPoints.map(point => point.price);
        const minPrice = Math.min(...prices);
        const maxPrice = Math.max(...prices);
        
        // 가격 범위에 따라 단위 결정
        const range = maxPrice - minPrice;
        const unit = range > 5000 ? 500 : 100;
        
        // 최소값과 최대값을 단위로 내림/올림 + 여유 추가
        const paddedMin = Math.floor(minPrice / unit) * unit - unit;
        const paddedMax = Math.ceil(maxPrice / unit) * unit + unit;
        
        console.log(`📊 Y축 범위: ${paddedMin.toLocaleString()} ~ ${paddedMax.toLocaleString()}원 (단위: ${unit}원)`);
        console.log(`📊 실제 가격 범위: ${minPrice.toLocaleString()} ~ ${maxPrice.toLocaleString()}원`);
        
        return [Math.max(0, paddedMin), paddedMax];
    };

    const ChangeRateDisplay = ({ changeRate }) => {
        if (!changeRate) {
            console.log('⚠️ changeRate 데이터 없음');
            return null;
        }

        console.log('💰 현재 가격:', changeRate.currentPrice);
        console.log('📈 주간 변동:', {
            rate: changeRate.weeklyChange,
            diff: changeRate.weeklyPriceDiff
        });
        console.log('📈 월간 변동:', {
            rate: changeRate.monthlyChange,
            diff: changeRate.monthlyPriceDiff
        });

        return (
            <div className={styles.changeRateInfo}>
                <div className={styles.currentPrice}>
                    <span className={styles.label}>현재 가격</span>
                    <span className={styles.value}>
                        {changeRate.currentPrice?.toLocaleString() || 'N/A'}원
                    </span>
                </div>
                {changeRate.weeklyChange !== null && changeRate.weeklyChange !== undefined && (
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
                            {changeRate.weeklyPriceDiff !== null && changeRate.weeklyPriceDiff !== undefined && (
                                <span className={styles.priceDiff}>
                                    {' '}({changeRate.weeklyPriceDiff > 0 ? '+' : ''}
                                    {changeRate.weeklyPriceDiff.toLocaleString()}원)
                                </span>
                            )}
                        </span>
                    </div>
                )}
                {changeRate.monthlyChange !== null && changeRate.monthlyChange !== undefined && (
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
                            {changeRate.monthlyPriceDiff !== null && changeRate.monthlyPriceDiff !== undefined && (
                                <span className={styles.priceDiff}>
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

    if (loading) return <div className={styles.loading}>Loading...</div>;
    if (!dashboard) return <div className={styles.error}>데이터를 불러올 수 없습니다.</div>;

    return (
        <div className={styles.dashboardContainer}>
            <Sidebar />

            <div className={styles.dashboardContent}>
                <h2>{dashboard.memberInfo.memberNickname} 님의 마이페이지</h2>

                {/* 물가 추이 그래프 섹션 */}
                <div className={styles.chartSection}>
                    <h3>식재료 물가 추이</h3>
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
                            
                            <ResponsiveContainer width="100%" height={400}>
                                <LineChart 
                                    data={formatChartData(selectedChart.dataPoints)}
                                    margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                                >
                                    <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                                    <XAxis 
                                        dataKey="date" 
                                        tickFormatter={(value) => {
                                            const date = new Date(value);
                                            return `${date.getMonth() + 1}/${date.getDate()}`;
                                        }}
                                        stroke="#666"
                                    />
                                    <YAxis 
                                        domain={calculateYAxisDomain(selectedChart.dataPoints)}
                                        tickFormatter={(value) => `${value.toLocaleString()}`}
                                        label={{ 
                                            value: '가격 (원)', 
                                            angle: -90, 
                                            position: 'insideLeft',
                                            style: { textAnchor: 'middle' }
                                        }}
                                        stroke="#666"
                                    />
                                    <Tooltip 
                                        formatter={(value) => [`${value.toLocaleString()}원`, '가격']}
                                        labelFormatter={(value) => `날짜: ${value}`}
                                        contentStyle={{ 
                                            backgroundColor: 'rgba(255, 255, 255, 0.95)',
                                            border: '1px solid #ccc',
                                            borderRadius: '4px',
                                            padding: '10px'
                                        }}
                                    />
                                    <Legend />
                                    <Line 
                                        type="monotone" 
                                        dataKey="price" 
                                        stroke="#4CAF50" 
                                        strokeWidth={2.5}
                                        name="가격 (원)" 
                                        dot={{ r: 4, fill: '#4CAF50' }}
                                        activeDot={{ r: 6, fill: '#2E7D32' }}
                                    />
                                </LineChart>
                            </ResponsiveContainer>

                            <div className={styles.chartFooter}>
                                <span className={styles.period}>
                                    📅 조회 기간: {selectedChart.startDate} ~ {selectedChart.endDate}
                                </span>
                                {selectedChart.priceType && (
                                    <span className={styles.priceType}>
                                        💰 가격 유형: {selectedChart.priceType}
                                    </span>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className={styles.noChart}>
                            <p>📊 표시할 물가 데이터가 없습니다.</p>
                            <p>찜한 식재료를 선택하면 해당 식재료의 물가 추이를 확인할 수 있습니다.</p>
                        </div>
                    )}
                </div>

                {/* 하단: 식단 리스트 & 찜한 식재료 리스트 */}
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

                    {/* 오른쪽: 찜한 식재료 리스트 */}
                    <div className={styles.listSection}>
                        <div className={styles.listHeader}>
                            <h3>찜한 식재료</h3>
                            <span className={styles.count}>{dashboard.favoriteIngredientCount}개</span>
                        </div>
                        <div className={styles.listContent}>
                            {dashboard.favoriteIngredients && dashboard.favoriteIngredients.length > 0 ? (
                                dashboard.favoriteIngredients.map(ingredient => (
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
                                            to={`/ingredient/detail/${ingredient.ingredientId}`} 
                                            className={styles.detailBtn}
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            상세보기
                                        </Link>
                                    </div>
                                ))
                            ) : (
                                <p className={styles.emptyMessage}>찜한 식재료가 없습니다.</p>
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