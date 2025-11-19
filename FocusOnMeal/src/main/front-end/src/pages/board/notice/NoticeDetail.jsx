import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import styles from "./NoticeDetail.module.css";

// ======================================================
// 📌 MOCK DATA: 백엔드 없이 화면 확인을 위한 더미 데이터
// ======================================================
const MOCK_NOTICE = {
    noticeNo: 123,
    noticeSubject: "긴급 공지: 서버 점검 및 업데이트 안내",
    noticeContent: 
        "안녕하세요, 회원 여러분.\n\n" +
        "더 나은 서비스 환경 제공을 위해 아래와 같이 서버 시스템 정기 점검이 진행될 예정입니다.\n" +
        "점검 중에는 서비스 이용이 일시적으로 제한되오니, 이용에 불편이 없도록 미리 확인 부탁드립니다.\n\n" +
        "■ 점검 일시: 2025년 12월 1일(월) 01:00 ~ 04:00 (3시간 예정)\n" +
        "■ 점검 내용: 시스템 안정화 및 신규 기능 업데이트\n\n" +
        "점검 시간은 상황에 따라 변동될 수 있으며, 최대한 빠르게 작업을 완료하도록 노력하겠습니다.\n" +
        "이용에 불편을 드려 죄송합니다. 감사합니다.",
    memberId: "admin_master",
    noticeCreateAt: "2025-11-19T10:00:00.000+00:00", // 현재 날짜로 설정
    viewCount: 452,
    noticeImportant: "Y", // 필독 표시
    noticeIsNew: "N"
};
// ======================================================

const NoticeDetail = () => {
    // 1. URL 파라미터에서 noticeNo 가져오기 (실제 로직)
    const { noticeNo } = useParams();
    const navigate = useNavigate();

    const [notice, setNotice] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        // noticeNo가 숫자로 변환 가능한지 체크하여 방어 코드 강화
        if (!noticeNo || isNaN(parseInt(noticeNo))) { 
            setError("공지 번호가 유효하지 않습니다.");
            setLoading(false);
            return;
        }

        const fetchNoticeDetail = async () => {
            setLoading(true);
            setError(null);
            
            // ----------------------------------------------------
            // 📌 [MOCK 모드] API 호출 대신 setTimeout 사용
            // ----------------------------------------------------
            // 2초 지연을 시뮬레이션하여 로딩 화면을 확인합니다.
            setTimeout(() => {
                if (parseInt(noticeNo) === MOCK_NOTICE.noticeNo) {
                    setNotice(MOCK_NOTICE);
                } else {
                    // 다른 번호는 데이터 없음을 시뮬레이션
                    setNotice(null); 
                    setError("해당 공지사항을 찾을 수 없습니다.");
                }
                setLoading(false);
            }, 1000); // 1초 지연
        };

        fetchNoticeDetail();
    }, [noticeNo]);

    if (loading) {
        return <div className={styles.loading}>공지사항을 불러오는 중...</div>;
    }

    if (error) {
        return <div className={styles.error}>{error}</div>;
    }

    if (!notice) {
        return <div className={styles.error}>해당 공지사항을 찾을 수 없습니다.</div>;
    }

    return (
        <div className={styles.container}>
            <div className={styles.detailWrapper}>
                <h1 className={styles.pageTitle}>공지사항</h1>
                
                <div className={styles.noticeHeader}>
                    <div className={styles.subjectRow}>
                        {/* 배지 */}
                            {/* 필독 */}
                            {notice.noticeImportant === "Y" && (
                                <span className={styles.badgeImportant}>필독 !</span>
                            )}

                            {/* NEW */}
                            {notice.noticeImportant !== "Y" &&
                                notice.noticeIsNew === "Y" && (
                                    <span className={styles.badgeIsNew}>NEW</span>
                                )}

                        <h2 className={styles.noticeSubject}>{notice.noticeSubject}</h2>
                    </div>
                    
                    <div className={styles.infoBar}>
                        <span className={styles.infoItem}>작성자: 관리자</span>
                        <span className={styles.separator}>|</span>
                        <span className={styles.infoItem}>작성일: {new Date(notice.noticeCreateAt).toLocaleDateString("ko-KR")}</span>
                        <span className={styles.separator}>|</span>
                        <span className={styles.infoItem}>조회수: {notice.viewCount}</span>
                    </div>
                </div>

                <div className={styles.noticeContent}>
                    {/* 공지 내용: 줄바꿈 처리를 위해 <p> 태그 안에 내용. */}
                    <p>{notice.noticeContent}</p>
                </div>

                <div className={styles.actionButtons}>
                    {/* 왼쪽 - 이전/다음 영역 */}
                    <div className={styles.prevNextWrapper}>
                        <div className={styles.prevRow}>
                            <span className={styles.label}>이전글</span>
                            <span className={styles.separator}>|</span>
                            <span className={styles.title}>이전글 제목</span>
                        </div>
                        <div className={styles.nextRow}>
                            <span className={styles.label}>다음글</span>
                            <span className={styles.separator}>|</span>
                            <span className={styles.title}>다음글 제목</span>
                        </div>
                    </div>
                </div>

                {/* 목록 버튼 */}
                <div className={styles.listButtonWrapper}>
                    <button 
                        className={styles.listBtn}
                        onClick={() => navigate('/board/notice/list')}
                    >
                        목록으로
                    </button>
                </div>
            </div>
            {/* <Footer /> */}
        </div>
    );
};

export default NoticeDetail;