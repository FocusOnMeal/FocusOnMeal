import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import styles from "./NoticeDetail.module.css";

const NoticeDetail = () => {
    const { noticeNo } = useParams();                  // URL의 {noticeNo}
    const navigate = useNavigate();

    const [notice, setNotice] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        // 번호 validation
        if (!noticeNo || isNaN(parseInt(noticeNo))) {
            setError("공지 번호가 유효하지 않습니다.");
            setLoading(false);
            return;
        }

        const fetchNoticeDetail = async () => {
            try {
                setLoading(true);

                // ✔ 실제 API 호출
                const response = await axios.get(
                    `/api/board/notice/detail/${noticeNo}`
                );

                setNotice(response.data);
                setLoading(false);

            } catch (err) {
                console.error(err);
                setError("해당 공지사항을 찾을 수 없습니다.");
                setLoading(false);
            }
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

                        {/* 필독 */}
                        {notice.noticeImportant === "Y" && (
                            <span className={styles.badgeImportant}>필독 !</span>
                        )}

                        {/* NEW */}
                        {notice.noticeImportant !== "Y" &&
                            notice.noticeIsNew === "Y" && (
                                <span className={styles.badgeIsNew}>NEW</span>
                        )}

                        <h2 className={styles.noticeSubject}>
                            {notice.noticeSubject}
                        </h2>
                    </div>

                    <div className={styles.infoBar}>
                        <span className={styles.infoItem}>
                            작성자: {notice.memberId || "관리자"}
                        </span>
                        <span className={styles.separator}>|</span>
                        <span className={styles.infoItem}>
                            작성일: {new Date(notice.noticeCreateAt).toLocaleDateString("ko-KR")}
                        </span>
                        <span className={styles.separator}>|</span>
                        <span className={styles.infoItem}>
                            조회수: {notice.viewCount}
                        </span>
                    </div>
                </div>

                <div className={styles.noticeContent}>
                    <p>{notice.noticeContent}</p>
                </div>

                {/* 이전/다음 글 영역 */}
                <div className={styles.actionButtons}>
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
                        onClick={() => navigate("/board/notice/list")}
                    >
                        목록으로
                    </button>
                </div>
            </div>
        </div>
    );
};

export default NoticeDetail;
