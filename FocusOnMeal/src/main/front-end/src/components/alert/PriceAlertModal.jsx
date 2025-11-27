import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Modal from '../Modal';
import './PriceAlertModal.css';

const PriceAlertModal = ({ isOpen, onClose, ingredientId, ingredientName, currentPrice, onAlertChange }) => {
    const [alertList, setAlertList] = useState([]); 
    const [isLoading, setIsLoading] = useState(false);
    const [customPrice, setCustomPrice] = useState('');
    const [customType, setCustomType] = useState('decrease'); 

    // 모달이 열릴 때 Body 스크롤 잠금
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'auto';
        }
        return () => {
            document.body.style.overflow = 'auto';
        };
    }, [isOpen]);

    // 초기 데이터 로드
    useEffect(() => {
        if (isOpen && ingredientId) {
            fetchMyAlerts();
        } else {
            setCustomPrice('');
            setCustomType('decrease');
        }
    }, [isOpen, ingredientId]);

    const fetchMyAlerts = async () => {
        try {
            const token = sessionStorage.getItem('token') || localStorage.getItem('token');
            if (!token) return;

            const res = await axios.get(`/api/price-alert/all`, {
                params: { ingredientId },
                headers: { Authorization: `Bearer ${token}` }
            });

            if (res.data && Array.isArray(res.data)) {
                setAlertList(res.data);
            }
        } catch (error) {
            console.error('기존 알림 조회 실패:', error);
            setAlertList([]);
        }
    };

    const addAlert = async (targetPrice, alertType) => {
        const isDuplicate = alertList.some(alert => 
            alert.thresholdPrice === targetPrice
        );

        if (isDuplicate) {
            alert('이미 동일한 가격의 알림이 설정되어 있습니다.');
            return;
        }

        try {
            setIsLoading(true);
            const token = sessionStorage.getItem('token') || localStorage.getItem('token');

            await axios.post('/api/price-alert', {
                ingredientId: Number(ingredientId),
                targetPrice: Number(targetPrice),
                alertType: alertType
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            await fetchMyAlerts();
            
            if (onAlertChange) {
                onAlertChange(true);
            }

        } catch (error) {
            console.error('알림 추가 실패:', error);
            alert('알림 설정에 실패했습니다.');
        } finally {
            setIsLoading(false);
        }
    };

    // [수정됨] 1원 단위(일의 자리)까지 정확하게 계산
    const handleAddAlertByPercent = async (percent) => {
        const isDecrease = percent < 0;
        const targetPrice = isDecrease
            ? Math.floor(currentPrice * (1 + percent / 100)) // 10으로 나누던 로직 제거
            : Math.ceil(currentPrice * (1 + percent / 100)); // 10으로 나누던 로직 제거

        await addAlert(targetPrice, isDecrease ? 'decrease' : 'increase');
    };

    // [수정됨] 1원 단위(일의 자리) 그대로 입력 반영
    const handleAddCustomAlert = async () => {
    // 1. 아무것도 입력하지 않았을 때
        if (!customPrice) {
            alert('설정할 목표 가격을 입력해주세요!');
            return;
        }

        // 2. 0원이나 음수를 입력했을 때
        if (Number(customPrice) <= 0) {
            alert('1원 이상의 가격을 입력해주세요.');
            return;
        }

        const targetPrice = Number(customPrice); // 10원 단위 절삭 로직 제거
        await addAlert(targetPrice, customType);
        setCustomPrice(''); // 입력 초기화
    };

    const handleDeleteAlert = async (alertId) => {
        if (!window.confirm('이 알림을 삭제하시겠습니까?')) return;

        try {
            setIsLoading(true);
            const token = sessionStorage.getItem('token') || localStorage.getItem('token');

            await axios.delete('/api/price-alert', {
                params: { ingredientId, alertId },
                headers: { Authorization: `Bearer ${token}` }
            });

            await fetchMyAlerts();
            
            if (alertList.length <= 1) {
                if (onAlertChange) onAlertChange(false);
            }

        } catch (error) {
            console.error('알림 삭제 실패:', error);
            alert('알림 삭제에 실패했습니다.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteAll = async () => {
        if (!window.confirm('모든 알림을 삭제하시겠습니까?')) return;

        try {
            setIsLoading(true);
            const token = sessionStorage.getItem('token') || localStorage.getItem('token');

            await axios.delete('/api/price-alert/all', {
                params: { ingredientId },
                headers: { Authorization: `Bearer ${token}` }
            });

            setAlertList([]);
            
            if (onAlertChange) onAlertChange(false);

            alert('모든 알림이 삭제되었습니다.');

        } catch (error) {
            console.error('전체 삭제 실패:', error);
            alert('알림 삭제에 실패했습니다.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="가격 변동 알림 설정">
            <div className="alert-scroll-container">
                
                {/* 1. 가격 정보 헤더 (sticky 적용됨) */}
                <div className="alert-header-box">
                    <strong>{ingredientName}</strong>의 현재 가격은{' '}
                    <span className="current-price">{currentPrice?.toLocaleString()}원</span>입니다.<br/>
                    원하는 가격에 알림을 추가하세요!
                </div>

                {/* 2. 빠른 추가 버튼 */}
                <p className="section-label">가격 하락 알림</p>
                <div className="percent-buttons">
                    <button onClick={() => handleAddAlertByPercent(-5)} disabled={isLoading} className="btn-decrease">
                        -5% <span className="price-preview">({Math.floor(currentPrice * 0.95).toLocaleString()}원)</span>
                    </button>
                    <button onClick={() => handleAddAlertByPercent(-10)} disabled={isLoading} className="btn-decrease">
                        -10% <span className="price-preview">({Math.floor(currentPrice * 0.9).toLocaleString()}원)</span>
                    </button>
                    <button onClick={() => handleAddAlertByPercent(-15)} disabled={isLoading} className="btn-decrease">
                        -15% <span className="price-preview">({Math.floor(currentPrice * 0.85).toLocaleString()}원)</span>
                    </button>
                </div>

                <p className="section-label">가격 상승 알림</p>
                <div className="percent-buttons">
                    <button onClick={() => handleAddAlertByPercent(5)} disabled={isLoading} className="btn-increase">
                        +5% <span className="price-preview">({Math.ceil(currentPrice * 1.05).toLocaleString()}원)</span>
                    </button>
                    <button onClick={() => handleAddAlertByPercent(10)} disabled={isLoading} className="btn-increase">
                        +10% <span className="price-preview">({Math.ceil(currentPrice * 1.1).toLocaleString()}원)</span>
                    </button>
                    <button onClick={() => handleAddAlertByPercent(15)} disabled={isLoading} className="btn-increase">
                        +15% <span className="price-preview">({Math.ceil(currentPrice * 1.15).toLocaleString()}원)</span>
                    </button>
                </div>

                {/* 3. 직접 입력 (스크롤 방지 적용됨) */}
                <div className="custom-input-section">
                    <p className="section-label" style={{marginTop:0}}>직접 입력</p>
                    <div className="custom-input-wrapper">
                        <input
                            type="number"
                            value={customPrice}
                            onChange={(e) => setCustomPrice(e.target.value)}
                            onWheel={(e) => e.target.blur()} 
                            placeholder="목표 가격 입력"
                            className="custom-price-input"
                        />
                        <span className="input-unit">원</span>
                        <button 
                            className="btn-add-custom"
                            onClick={handleAddCustomAlert}
                            disabled={isLoading || !customPrice}
                        >
                            설정
                        </button>
                    </div>
                </div>

                {/* 4. 설정된 알림 목록 */}
                <div className="alert-list-section">
                    <div className="list-header">
                        <h4>설정된 알림 ({alertList.length}개)</h4>
                        {alertList.length > 0 && (
                            <button className="btn-delete-all" onClick={handleDeleteAll} disabled={isLoading}>
                                전체 삭제
                            </button>
                        )}
                    </div>

                    {alertList.length === 0 ? (
                        <div className="empty-alert">
                            설정된 알림이 없습니다.<br/>
                            위의 버튼을 눌러 알림을 추가하세요!
                        </div>
                    ) : (
                        <div className="alert-items">
                            {alertList.map((alert, index) => {
                                const isDecrease = alert.thresholdPrice < currentPrice;
                                const priceDiff = alert.thresholdPrice - currentPrice;
                                const percentDiff = ((priceDiff / currentPrice) * 100).toFixed(1);
                                
                                return (
                                    <div key={alert.alertId || index} className={`alert-item ${isDecrease ? 'decrease' : 'increase'}`}>
                                        <div className="alert-item-icon">{isDecrease ? '📉' : '📈'}</div>
                                        <div className="alert-item-info">
                                            {/* 가격 (검은색) */}
                                            <div className="alert-item-price">
                                                {alert.thresholdPrice?.toLocaleString()}원 {isDecrease ? '이하' : '이상'}
                                            </div>
                                            {/* 상세 (색상 적용) */}
                                            <div className="alert-item-detail">
                                                {isDecrease ? '▼' : '▲'} {Math.abs(percentDiff)}% 
                                                ({priceDiff > 0 ? '+' : ''}{priceDiff.toLocaleString()}원)
                                            </div>
                                        </div>
                                        <button className="btn-delete-item" onClick={() => handleDeleteAlert(alert.alertId)} disabled={isLoading}>
                                            ✕
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* 5. 닫기 버튼 */}
                <div className="alert-footer">
                    <button className="btn-close" onClick={onClose}>
                        닫기
                    </button>
                </div>
            </div>
        </Modal>
    );
};

export default PriceAlertModal;