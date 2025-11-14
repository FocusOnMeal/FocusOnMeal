import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Modal from "../../components/Modal";
import TermsContent from "../member/TermsContent";
import PrivacyContent from "../member/PrivacyContent";
import "./MyForm.css";

const MyForm = () => {
    const navigate = useNavigate();
    const [agreements, setAgreements] = useState({
        all: false,
        terms: false,
        privacy: false,
    });

    const [modal, setModal] = useState({
        open: false,
        type: null,
    });

    const handleAllCheck = (e) => {
        const isChecked = e.target.checked;
        setAgreements({
        all: isChecked,
        terms: isChecked,
        privacy: isChecked,
        });
    };

    const handleIndividualCheck = (name) => {
        const newAgreements = {
        ...agreements,
        [name]: !agreements[name],
        };
        newAgreements.all = newAgreements.terms && newAgreements.privacy;
        setAgreements(newAgreements);
    };

    const handleNext = () => {
        if (!agreements.terms || !agreements.privacy) {
        alert("모든 필수 약관에 동의해야 합니다.");
        return;
        }

        navigate('/member/join');
    };

    const isAllChecked = agreements.terms && agreements.privacy;

    return (
        <div className="signup-terms-container">
        <div className="signup-terms-wrapper">
            <div className="terms-header">
            <h2 className="terms-title">회원가입</h2>
            </div>

            <div className="terms-subtitle-wrapper">
            <h4 className="terms-subtitle">약관동의</h4>
            <p className="terms-description">약관 내용에 동의해주세요.</p>
            </div>

            <div>
            <div className="agreement-all-wrapper">
                <label className="agreement-all-label">
                <input
                    type="checkbox"
                    checked={agreements.all}
                    onChange={handleAllCheck}
                    className="checkbox-input"
                />
                <span className="agreement-all-text">전체 동의</span>
                </label>
            </div>

            <hr className="divider" />

            <div className="agreement-list">
                <div className="agreement-item">
                <input
                    type="checkbox"
                    id="terms"
                    checked={agreements.terms}
                    onChange={() => handleIndividualCheck("terms")}
                    className="checkbox-input checkbox-item"
                />
                <label htmlFor="terms" className="agreement-label">
                    <span className="required-badge">[필수]</span>
                    <button
                    type="button"
                    onClick={() => setModal({ open: true, type: "terms" })}
                    className="terms-link"
                    >
                    FocusOnMale 이용약관
                    </button>
                    <span className="agreement-text"> 동의</span>
                </label>
                </div>

                <div className="agreement-item">
                <input
                    type="checkbox"
                    id="privacy"
                    checked={agreements.privacy}
                    onChange={() => handleIndividualCheck("privacy")}
                    className="checkbox-input checkbox-item"
                />
                <label htmlFor="privacy" className="agreement-label">
                    <span className="required-badge">[필수]</span>
                    <button
                    type="button"
                    onClick={() => setModal({ open: true, type: "privacy" })}
                    className="terms-link"
                    >
                    개인정보 수집 및 이용
                    </button>
                    <span className="agreement-text"> 동의</span>
                </label>
                </div>
            </div>

            <button
                onClick={handleNext}
                disabled={!isAllChecked}
                className={`submit-button ${
                isAllChecked ? "active" : "disabled"
                }`}
            >
                다음
            </button>
            </div>
        </div>

        <Modal
            isOpen={modal.open}
            onClose={() => setModal({ open: false, type: null })}
            title={
            modal.type === "terms" ? "이용약관" : "개인정보 처리방침"
            }
        >
            {modal.type === "terms" ? <TermsContent /> : <PrivacyContent />}
        </Modal>
        </div>
    );
};

export default MyForm;
