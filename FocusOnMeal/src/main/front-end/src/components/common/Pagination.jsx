import styles from "./Pagination.module.css";

const Pagination = ({ pageInfo, currentPage, changePage }) => {
    if (!pageInfo) return null;

    return (
        <nav className={styles.paginationWrap}>
            <ul className={styles.pagination}>

                {/* 1. 맨 처음으로 (<<) */}
                <li className={`${styles.pageItem} ${currentPage === 1 ? styles.disabled : ""}`}>
                    <button
                        className={currentPage === 1 ? styles.disabledBtn : ""}
                        onClick={() => currentPage > 1 && changePage(1)}
                        title="맨 처음"
                    >
                        <span className={styles.arrow}>&laquo;</span>
                    </button>
                </li>

                {/* 2. 이전 페이지 (<) */}
                <li className={`${styles.pageItem} ${currentPage === 1 ? styles.disabled : ""}`}>
                    <button
                        className={currentPage === 1 ? styles.disabledBtn : ""}
                        onClick={() => currentPage > 1 && changePage(currentPage - 1)}
                        title="이전"
                    >
                        <span className={styles.arrow}>&lt;</span>
                    </button>
                </li>

                {/* 3. 페이지 번호 목록 */}
                {Array.from(
                    { length: pageInfo.endNavi - pageInfo.startNavi + 1 },
                    (_, i) => pageInfo.startNavi + i
                ).map((pageNum) => (
                    <li
                        key={pageNum}
                        className={`${styles.pageItem} ${
                            currentPage === pageNum ? styles.active : ""
                        }`}
                    >
                        <button onClick={() => changePage(pageNum)}>
                            {pageNum}
                        </button>
                    </li>
                ))}

                {/* 4. 다음 페이지 (>) */}
                <li className={`${styles.pageItem} ${currentPage === pageInfo.maxPage ? styles.disabled : ""}`}>
                    <button
                        className={currentPage === pageInfo.maxPage ? styles.disabledBtn : ""}
                        onClick={() => currentPage < pageInfo.maxPage && changePage(currentPage + 1)}
                        title="다음"
                    >
                        <span className={styles.arrow}>&gt;</span>
                    </button>
                </li>

                {/* 5. 맨 끝으로 (>>) */}
                <li className={`${styles.pageItem} ${currentPage === pageInfo.maxPage ? styles.disabled : ""}`}>
                    <button
                        className={currentPage === pageInfo.maxPage ? styles.disabledBtn : ""}
                        onClick={() => currentPage < pageInfo.maxPage && changePage(pageInfo.maxPage)}
                        title="맨 끝"
                    >
                        <span className={styles.arrow}>&raquo;</span>
                    </button>
                </li>

            </ul>
        </nav>
    );
};

export default Pagination;