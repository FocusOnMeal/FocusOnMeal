import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import styles from './detail.module.css';

function IngredientDetail() {
    const { id } = useParams(); // URL에서 식재료 ID 가져오기
    const navigate = useNavigate(); 
    
    // 서버에서 받아올 데이터 상태
    const [itemInfo, setItemInfo] = useState(null);     // 식재료 기본 정보
    const [priceHistory, setPriceHistory] = useState([]); // 가격 이력 (그래프용)
    const [loading, setLoading] = useState(true);
    const [isWished, setIsWished] = useState(false); // 찜 상태

    // API 연동: id가 바뀔 때마다 실행
    useEffect(() => {
        const fetchDetail = async () => {
            try {
                // Spring Boot 상세 API 호출
                const response = await axios.get(`/ingredient/api/detail/${id}`);
                
                setItemInfo(response.data.info);      // "info" 키에 담긴 기본 정보
                setPriceHistory(response.data.history); // "history" 키에 담긴 가격 이력
                
                // (추후 찜 여부도 API로 받아오면 좋습니다)
                // setIsWished(response.data.isFavorite); 

            } catch (error) {
                console.error("상세 정보 로딩 실패:", error);
                setItemInfo(null); // 오류 발생 시 null 처리
            } finally {
                setLoading(false);
            }
        };
        fetchDetail();
    }, [id]); // id가 바뀔 때마다 다시 API 호출

    // 찜하기 버튼 클릭 핸들러 (API 호출)
    const handleWishClick = async () => {
        try {
            // Spring Boot 찜하기 API(@PostMapping) 호출
            const response = await axios.post(`/ingredient/detail/${id}/favorite`);
            
            // Controller가 보내준 응답(isFavorite, message) 사용
            setIsWished(response.data.isFavorite); 
            alert(response.data.message);

        } catch (error) {
            // 401: Unauthorized (로그인 안 됨)
            if (error.response && error.response.status === 401) {
                alert("로그인이 필요합니다.");
                 // navigate('/login'); // (로그인 페이지가 있다면)
            } else {
                alert("찜 처리에 실패했습니다.");
                console.error("찜하기 오류:", error);
            }
        }
    };

    if (loading) return <div className={styles.container}>로딩 중...</div>;
    
    // 데이터 로딩이 끝났는데 itemInfo가 null인 경우 (오류 또는 데이터 없음)
    if (!itemInfo) {
        return (
            <div className={styles.container}>
                <h2>오류</h2>
                <p>'{id}'에 해당하는 식자재 정보를 찾을 수 없습니다.</p>
                <button onClick={() => navigate(-1)} className={styles.backButton}>
                목록으로 돌아가기
                </button>
            </div>
        );
    }

    // 정상 렌더링
    return (
        <div className={styles.container}>
            <button onClick={() => navigate(-1)} className={styles.backButton}>
            목록으로
            </button>
            <br/><br/>
        
            <div className={styles.header}>
                <h2>식품 상세 정보</h2>
            </div>

            <div className={styles.main}>
                {/* 왼쪽 컬럼 */}
                <div className={styles.leftColumn}>
                    <div className={styles.imagePlaceholder}>
                        {itemInfo.name} 이미지
                    </div>
                    <h3 className={styles.subTitle}>영양 성분 표</h3>
                    <div className={styles.nutritionTable}>
                        (영양 성분 표 컴포넌트)
                    </div>
                </div>

                {/* 오른쪽 컬럼 */}
                <div className={styles.rightColumn}>
                    <h1 className={styles.title}>
                        {itemInfo.name}
                    </h1>
                    <span className={styles.categoryBadge}>{itemInfo.category}</span>
                    
                    <div className={styles.buttonGroup}>
                        <button onClick={handleWishClick} className={styles.wishButton}>
                            {isWished ? '❤️ 찜 취소' : '♥ 찜하기'}
                        </button>
                        {/* (안전 정보 표시는 기존 로직 유지) */}
                    </div>

                    {/* 가격 정보 */}
                    <div className={styles.infoBox}>
                        <h3 className={styles.subTitle}>
                            가격 변동 추이
                            <span style={{fontSize:'0.7em', color:'#888', marginLeft:'10px', fontWeight:'normal'}}> (서울 / 소매 / 1kg)</span>
                        </h3>
                        <div className={styles.priceInfo}>
                            <p><span>최근 가격:</span> <b>
                                {priceHistory.length > 0 ? `${priceHistory[0].priceValue.toLocaleString()}원` : '정보 없음'}
                            </b></p>
                            <p><span>(기준일:</span> {priceHistory.length > 0 ? priceHistory[0].collectedDate.substring(0, 10) : '-'}<span>)</span></p>
                        </div>
                        <div className={styles.chartPlaceholder}>
                            [그래프 영역: priceHistory 데이터를 여기에 전달]
                        </div>
                    </div>
                    
                    {/* 상세 정보 */}
                    <div className={styles.infoBox}>
                        <h3 className={styles.subTitle}>상세 정보</h3>
                        <div className={styles.specInfo}>
                            <p><span>단위 :</span> {itemInfo.standardUnit}</p> 
                            <hr />
                            <p>KAMIS 품목코드 : {itemInfo.kamisItemCode || '-'}</p>
                            <p>KAMIS 품종코드 : {itemInfo.kamisKindCode || '-'}</p>
                            <p>분류 코드 : {itemInfo.kamisItemCategoryCode || '-'}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default IngredientDetail;