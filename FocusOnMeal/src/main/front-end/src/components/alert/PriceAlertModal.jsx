// src/components/alert/PriceAlertModal.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Modal from '../Modal'; // 👈 작성하신 모달 틀 Import (경로 맞춰주세요)
import './PriceAlertModal.css'; // 내용물 스타일

const PriceAlertModal = ({ isOpen, onClose, ingredientId, ingredientName, currentPrice }) => {
    const [targetPrice, setTargetPrice] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    // 모달 열릴 때 내 설정 가져오기
    useEffect(() => {
        if (isOpen && ingredientId) {
            fetchMySetting();
        } else {
            setTargetPrice('');
        }
    }, [isOpen, ingredientId]);

    const fetchMySetting = async () => {
        try {
            const token = localStorage.getItem('token'); // 토큰 키 확인 필요
            if (!token) return;

            const res = await axios.get(`/api/price-alert`, {
                params: { ingredientId },
                headers: { Authorization: `Bearer ${token}` }
            });

            if (res.data) {
                setTargetPrice(res.data.thresholdPrice);
            }
        } catch (error) {
            console.error(error);
        }
    };

    const handleSave = async () => {
        if (!targetPrice) return alert("가격을 입력해주세요.");
        
        try {
            setIsLoading(true);
            const token = localStorage.getItem('token');
            
            await axios.post('/api/price-alert', {
                ingredientId: Number(ingredientId),
                targetPrice: Number(targetPrice)
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            alert('알림이 설정되었습니다.');
            onClose(); // 저장 후 닫기
        } catch (error) {
            alert('저장에 실패했습니다.');
        } finally {
            setIsLoading(false);
        }
    };

    // 퍼센트 계산 도우미
    const applyDiscount = (percent) => {
        const discounted = currentPrice * (1 - percent / 100);
        setTargetPrice(Math.floor(discounted / 10) * 10); // 1원단위 절삭
    };

    return (
        /* 만들어두신 Modal 컴포넌트를 사용합니다.
        title은 props로 넘기고, 내용은 children으로 사이에 넣습니다.
        */
        <Modal isOpen={isOpen} onClose={onClose} title="📉 가격 변동 알림 설정">
            <div className="alert-content-wrapper">
                <p className="alert-desc">
                    <strong>{ingredientName}</strong>의 현재 가격은{' '}
                    <span className="current-price">{currentPrice?.toLocaleString()}원</span>입니다.<br/>
                    얼마 이하로 내려가면 알려드릴까요?
                </p>

                {/* 빠른 선택 버튼 */}
                <div className="discount-buttons">
                    <button onClick={() => applyDiscount(5)}>-5%</button>
                    <button onClick={() => applyDiscount(10)}>-10%</button>
                    <button onClick={() => applyDiscount(20)}>-20%</button>
                </div>

                {/* 가격 입력 */}
                <div className="price-input-area">
                    <input
                        type="number"
                        value={targetPrice}
                        onChange={(e) => setTargetPrice(e.target.value)}
                        placeholder="목표 가격 입력"
                    />
                    <span>원</span>
                </div>

                {/* 저장 버튼 (모달 하단) */}
                <div className="alert-footer">
                    <button className="btn-cancel" onClick={onClose}>취소</button>
                    <button className="btn-save" onClick={handleSave} disabled={isLoading}>
                        {isLoading ? '저장 중...' : '알림 받기'}
                    </button>
                </div>
            </div>
        </Modal>
    );
};

export default PriceAlertModal;