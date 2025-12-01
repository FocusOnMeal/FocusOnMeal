import React, { useState, useEffect } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import Pagination from '../../components/common/Pagination';
import Sidebar from "../../components/admin/Sidebar";
import styles from './SafetyInfo.module.css';

const AdminSafetyList = () => {
    const [alertList, setAlertList] = useState([]);
    const [pageInfo, setPageInfo] = useState(null);
    const [searchParams, setSearchParams] = useSearchParams();
    const [keyword, setKeyword] = useState(searchParams.get('keyword') || '');
    const [searchType, setSearchType] = useState(searchParams.get('type') || 'all');
    const [selectedItems, setSelectedItems] = useState([]);
    const navigate = useNavigate();
    const currentPage = parseInt(searchParams.get('page') || '1');

    useEffect(() => {
        fetchAlertList();
    }, [searchParams]);

    const fetchAlertList = () => {
        const params = new URLSearchParams(searchParams);
        if (!params.has('page')) {
            params.set('page', '1');
        }

        fetch(`/api/admin/safetyInfo?${params.toString()}`)
            .then(res => res.json())
            .then(data => {
                console.log(data);
                setAlertList(data.list || []);
                setPageInfo(data.pi);
            })
            .catch(err => console.error(err));
    };

    const changePage = page => {
        setSearchParams(prev => {
            const params = new URLSearchParams(prev);
            params.set('page', page.toString());
            return params;
        }, { replace: true });
    };

    const handleSearch = (e) => {
        e.preventDefault();
        setSearchParams(prev => {
            const params = new URLSearchParams(prev);
            params.set('type', searchType);
            params.set('keyword', keyword);
            params.set('page', '1');
            return params;
        }, { replace: true });
    };

    const handleSelectAll = (e) => {
        if (e.target.checked) {
            setSelectedItems(alertList.map(alert => alert.alertId));
        } else {
            setSelectedItems([]);
        }
    };

    const handleSelectItem = (alertId) => {
        setSelectedItems(prev => {
            if (prev.includes(alertId)) {
                return prev.filter(id => id !== alertId);
            } else {
                return [...prev, alertId];
            }
        });
    };

    const handleDelete = async () => {
        if (selectedItems.length === 0) {
            alert('삭제할 항목을 선택해주세요.');
            return;
        }

        if (!confirm(`선택한 ${selectedItems.length}개의 항목을 삭제하시겠습니까?`)) {
            return;
        }

        try {
            const response = await fetch('/api/admin/safetyInfo/delete', {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ alertIds: selectedItems })
            });

            if (response.ok) {
                alert('삭제되었습니다.');
                setSelectedItems([]);
                fetchAlertList();
            } else {
                alert('삭제 중 오류가 발생했습니다.');
            }
        } catch (error) {
            console.error('삭제 오류:', error);
            alert('삭제 중 오류가 발생했습니다.');
        }
    };

    const getHazardTypeBadgeClass = (hazardType) => {
        if (hazardType === '위해식품정보') return styles.badgeDanger;
        if (hazardType === '글로벌 동향정보') return styles.badgeGlobal;
        if (hazardType === '연구평가정보') return styles.badgeResearch;
        if (hazardType === '법제도정보') return styles.badgeLaw;
        return styles.badgeDefault;
    };

    return (
        <div className={styles.container}>
            <Sidebar/>
            <div className={styles.main}>
                <div className={styles.header}>
                    <h1>안전정보 뉴스 관리</h1>
                    <button 
                        className={styles.registerBtn}
                        onClick={() => navigate('/admin/safetyInfo/register')}
                    >
                        + 등록
                    </button>
                </div>

                <form onSubmit={handleSearch} className={styles.searchBox}>
                    <select 
                        value={searchType}
                        onChange={(e) => setSearchType(e.target.value)}
                        className={styles.select}
                    >
                        <option value="all">전체</option>
                        <option value="title">제목</option>
                        <option value="nation">국가</option>
                        <option value="hazardType">위험유형</option>
                    </select>
                    <input 
                        type="text" 
                        placeholder="검색어를 입력하세요."
                        value={keyword}
                        onChange={(e) => setKeyword(e.target.value)}
                        className={styles.input}
                    />
                    <button type="submit" className={styles.searchBtn}>🔍</button>
                </form>

                <div className={styles.actionBar}>
                    <button 
                        className={styles.deleteBtn}
                        onClick={handleDelete}
                        disabled={selectedItems.length === 0}
                    >
                        선택 삭제 ({selectedItems.length})
                    </button>
                </div>

                <table className={styles.alertTable}>
                    <thead>
                        <tr>
                            <th>
                                <input 
                                    type="checkbox"
                                    onChange={handleSelectAll}
                                    checked={alertList.length > 0 && selectedItems.length === alertList.length}
                                />
                            </th>
                            <th>번호</th>
                            <th>공표 국가</th>
                            <th>위험 유형</th>
                            <th>제목</th>
                            <th>공표일</th>
                            <th>관리</th>
                        </tr>
                    </thead>
                    <tbody>
                        {alertList.length > 0 ? (
                            alertList.map((alert) => (
                                <tr key={alert.alertId}>
                                    <td>
                                        <input 
                                            type="checkbox"
                                            checked={selectedItems.includes(alert.alertId)}
                                            onChange={() => handleSelectItem(alert.alertId)}
                                        />
                                    </td>
                                    <td>{alert.alertId}</td>
                                    <td>{alert.nation}</td>
                                    <td>
                                        <span className={getHazardTypeBadgeClass(alert.hazardType)}>
                                            {alert.hazardType}
                                        </span>
                                    </td>
                                    <td className={styles.titleCell}>
                                        <Link to={`/admin/safetyInfo/detail/${alert.alertId}`}>
                                            {alert.title}
                                        </Link>
                                    </td>
                                    <td>
                                        {new Date(alert.publicationDate).toLocaleDateString("ko-KR")}
                                    </td>
                                    <td>
                                        <button 
                                            className={styles.editBtn}
                                            onClick={() => navigate(`/admin/safetyInfo/update/${alert.alertId}`)}
                                        >
                                            수정
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="7">등록된 안전 정보가 없습니다.</td>
                            </tr>
                        )}
                    </tbody>
                </table>

                <Pagination
                    pageInfo={pageInfo}
                    currentPage={currentPage}
                    changePage={changePage}
                />
            </div>
        </div>
    );
};

export default AdminSafetyList;