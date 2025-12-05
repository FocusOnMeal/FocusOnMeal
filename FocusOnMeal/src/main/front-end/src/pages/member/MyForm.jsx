import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Modal from "../../components/Modal";
import TermsContent from "../member/TermsContent";
import PrivacyContent from "../member/PrivacyContent";
import styles from "./MyForm.module.css";

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

        // ✅ 수정: 경로 확인
        // App.jsx에 설정된 라우트에 따라 선택
        navigate('/member/join'); // 또는 '/join'
    };

    const isAllChecked = agreements.terms && agreements.privacy;

    return (
        <div className={styles.container}>
            <div className={styles.card}>
                {/* 헤더 */}
                <div className={styles.header}>
                    <h2 className={styles.title}>회원가입</h2>
                </div>

                {/* 약관동의 섹션 */}
                <div className={styles.agreementSection}>
                    <h4 className={styles.sectionTitle}>약관동의</h4>
                    <p className={styles.sectionDescription}>약관 내용에 동의해주세요.</p>
                </div>

                <div>
                    {/* 전체 동의 */}
                    <div className={styles.allAgreeBox}>
                        <label className={styles.allAgreeLabel}>
                            <input
                                type="checkbox"
                                checked={agreements.all}
                                onChange={handleAllCheck}
                                className={styles.checkbox}
                            />
                            <span className={styles.allAgreeText}>전체 동의</span>
                        </label>
                    </div>

                    <hr className={styles.divider} />

                    {/* 개별 약관 */}
                    <div className={styles.individualAgreements}>
                        {/* 이용약관 */}
                        <div className={styles.agreementItem}>
                            <input
                                type="checkbox"
                                id="terms"
                                checked={agreements.terms}
                                onChange={() => handleIndividualCheck("terms")}
                                className={styles.checkbox}
                            />
                            <label htmlFor="terms" className={styles.agreementLabel}>
                                <span className={styles.requiredBadge}>[필수]</span>
                                <button
                                    type="button"
                                    onClick={() => setModal({ open: true, type: "terms" })}
                                    className={styles.agreementButton}
                                >
                                    FocusOnMale 이용약관
                                </button>
                                <span className={styles.agreementText}> 동의</span>
                            </label>
                        </div>

                        {/* 개인정보 */}
                        <div className={styles.agreementItem}>
                            <input
                                type="checkbox"
                                id="privacy"
                                checked={agreements.privacy}
                                onChange={() => handleIndividualCheck("privacy")}
                                className={styles.checkbox}
                            />
                            <label htmlFor="privacy" className={styles.agreementLabel}>
                                <span className={styles.requiredBadge}>[필수]</span>
                                <button
                                    type="button"
                                    onClick={() => setModal({ open: true, type: "privacy" })}
                                    className={styles.agreementButton}
                                >
                                    개인정보 수집 및 이용
                                </button>
                                <span className={styles.agreementText}> 동의</span>
                            </label>
                        </div>
                    </div>

                    {/* 다음 버튼 */}
                    <button
                        onClick={handleNext}
                        disabled={!isAllChecked}
                        className={`${styles.nextButton} ${isAllChecked ? styles.enabled : styles.disabled}`}
                    >
                        다음
                    </button>
                </div>
            </div>

            {/* 모달 */}
            <Modal
                isOpen={modal.open}
                onClose={() => setModal({ open: false, type: null })}
                title={modal.type === "terms" ? "이용약관" : "개인정보 처리방침"}
            >
                {modal.type === "terms" ? <TermsContent /> : <PrivacyContent />}
            </Modal>
        </div>
    );
};

export default MyForm;