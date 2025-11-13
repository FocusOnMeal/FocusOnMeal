import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { initialMockResults } from './_mockData';
import styles from './detail.module.css';

function IngredientDetail() {
    const { id } = useParams();
    const navigate = useNavigate(); 
    
    const item = initialMockResults.find(i => i.id === id);
    const [isWished, setIsWished] = useState(item ? item.isWished : false);

    const handleWishClick = () => {
        setIsWished(prev => !prev);
        // TODO: Context API 등을 통한 전역 상태 업데이트
    };

    if (!item) {
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

    // [추가] 안전 등급에 따른 CSS 클래스 분기
    const safetyClass = item.safetyLevel === 'safe' ? styles.safe :
                      item.safetyLevel === 'warning' ? styles.warning :
                      ''; // (styles.danger도 필요시 추가)

    return (
        <div className={styles.container}>
            <button onClick={() => navigate(-1)} className={styles.backButton}>
            목록으로
            </button>
            <br/>
            <br/>
        <div className={styles.header}>
            <h2>식품성분표 상세 페이지</h2>
        </div>

        <div className={styles.main}>
            {/* 왼쪽 컬럼 */}
            <div className={styles.leftColumn}>
                <div className={styles.imagePlaceholder}>
                    {item.name} 이미지
                </div>
                <h3 className={styles.subTitle}>영양 성분 표</h3>
                <div className={styles.nutritionTable}>
                    (영양 성분 표 컴포넌트)
                </div>
            </div>

            {/* 오른쪽 컬럼 */}
            <div className={styles.rightColumn}>
                <h1 className={styles.title}>
                    {item.isImported ? '[수입] ' : ''}{item.name} ({item.kindName})
                </h1>
                
                {/* --- [수정] 요청 사항 반영 --- */}
                <div className={styles.buttonGroup}>
                    <button onClick={handleWishClick} className={styles.wishButton}>
                        {isWished ? '❤️ 찜 취소' : '♥ 찜하기'}
                    </button>
                    
                    {/* [1. 요청] 안전위험도 표시 */}
                    <div className={`${styles.safetyDisplay} ${safetyClass}`}>
                        {item.safetyLevel === 'safe' && '🟢 '}
                        {item.safetyLevel === 'warning' && '🟡 '}
                        {item.safetyStatus}
                    </div>

                    {/* [2. 요청] 버튼 텍스트 변경 */}
                    <button className={styles.actionButton}>
                        안전 정보
                    </button>
                </div>
                {/* --- 수정 끝 --- */}

                <div className={styles.infoBox}>
                    <h3 className={styles.subTitle}>가격 변동 추이</h3>
                    <div className={styles.priceInfo}>
                        <p><span>당일:</span> <b>{item.priceToday}원</b></p>
                        <p><span>1일 전:</span> {item.priceYesterday}원</p>
                        <p><span>1주일 전:</span> {item.priceWeekAgo}원</p>
                        <p><span>1개월 전:</span> {item.priceMonthAgo}원</p>
                    </div>
                    <br />
                    <h2>여기 그래프</h2>
                </div>
                

                <div className={styles.infoBox}>
                    <h3 className={styles.subTitle}>식자재 정보</h3>
                    <div className={styles.specInfo}>
                        <p><span>품목 코드 :</span> {item.itemCode}</p>
                        <p><span>품종 코드 :</span> {item.kindCode}</p>
                        <p><span>등급 / 단위 :</span> {item.grade} / {item.unit}</p>
                        <hr />
                        <p><span>주요산지 :</span> (mockData에 추가 필요)</p>
                        <p><span>생산시기 :</span> (mockData에 추가 필요)</p>
                        <p><span>보관방법 :</span> (mockData에 추가 필요)</p>
                        <p><span>효능 :</span> (mockData에 추가 필요)</p>
                    </div>
                </div>
            </div>
        </div>
        </div>
    );
}

export default IngredientDetail;