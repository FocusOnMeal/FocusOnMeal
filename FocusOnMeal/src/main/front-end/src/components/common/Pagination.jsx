import React from "react";

const Pagination = ({pageInfo, currentPage, changePage}) => {
    if(!pageInfo) return null;

    return(
        <>
            <nav aria-label="Standard pagination example" style={{float: 'right'}}>
                <ul className="pagination">
                    <li className={`page-item ${currentPage <= 1 ? 'disabled' : ''}`}>
                        <button className="page-link" onClick={() => currentPage > 1&& changePage(currentPage -1)} disabled={currentPage <= 1} aria-label="Previous">
                            <span aria-hidden="true">&laquo;</span>
                        </button>
                    </li>

                    {Array.from(
                        {length:pageInfo.endNavi - pageInfo.startNavi + 1},
                        (_, i) => pageInfo.startNavi + i
                    ).map(pageNum => (
                        <li className={`page-item ${currentPage === pageNum ? 'active' : ''}`} key ={pageNum}>
                            <button className = "page-link" onClick={() => changePage(pageNum)}>{pageNum}</button>
                        </li>
                    ))}

                    <li className={`page-item ${currentPage >= pageInfo.maxPage ? 'disabled' : ''}`}>
                        <button className="page-link" onClick={()=> currentPage < pageInfo.maxPage && changePage(currentPage + 1)} disabled={currentPage >= pageInfo.maxPage} aria-label="Next">
                            <span aria-hidden="true">&raquo;</span>
                        </button>
                    </li>
                </ul>
            </nav>
        </>
    );

};
export default Pagination;