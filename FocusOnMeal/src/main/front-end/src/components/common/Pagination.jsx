import React from "react";
import styles from "./Pagination.module.css";

const Pagination = ({ pageInfo, currentPage, changePage }) => {
    if (!pageInfo) return null;

    return (
        <nav className={styles.paginationWrap}>
            <ul className={styles.pagination}>

                {/* 이전 */}
                <li
                    className={`${styles.pageItem} ${
                        currentPage <= 1 ? styles.disabled : ""
                    }`}
                >
                    <button
                        className={currentPage <= 1 ? styles.disabledBtn : ""}
                        onClick={() =>
                            currentPage > 1 && changePage(currentPage - 1)
                        }
                    >
                        <span className={styles.arrow}>&laquo;</span>
                    </button>
                </li>

                {/* 페이지 번호 */}
                {Array.from(
                    {
                        length:
                            pageInfo.endNavi - pageInfo.startNavi + 1,
                    },
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

                {/* 다음 */}
                <li
                    className={`${styles.pageItem} ${
                        currentPage >= pageInfo.maxPage
                            ? styles.disabled
                            : ""
                    }`}
                >
                    <button
                        className={
                            currentPage >= pageInfo.maxPage
                                ? styles.disabledBtn
                                : ""
                        }
                        onClick={() =>
                            currentPage < pageInfo.maxPage &&
                            changePage(currentPage + 1)
                        }
                    >
                        <span className={styles.arrow}>&raquo;</span>
                    </button>
                </li>
            </ul>
        </nav>
    );
};

export default Pagination;
