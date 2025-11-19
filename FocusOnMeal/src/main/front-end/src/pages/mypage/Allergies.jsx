import React, { useEffect, useState } from 'react';
import axios from 'axios';

const Allergies = () => {
    const [allergies, setAllergies] = useState([]);
    const [checked, setChecked] = useState([]);

    useEffect(() => {
        loadAllergyList();
        loadUserAllergies();
    }, []);

    /** 알레르기 전체 목록 조회 */
    const loadAllergyList = async () => {
        const res = await axios.get("/api/allergy/list");
        setAllergies(res.data); // [ { id:1, name:"우유" }, ... ]
    };

    /** 로그인한 사용자의 기존 알레르기 조회 */
    const loadUserAllergies = async () => {
        const res = await axios.get("/api/mypage/allergies");
        setChecked(res.data.allergies); // [1,3,5]
    };

    /** 체크 토글 */
    const toggleCheck = (id) => {
        setChecked((prev) =>
            prev.includes(id)
                ? prev.filter(a => a !== id) 
                : [...prev, id]
        );
    };

    /** 저장 */
    const handleSave = async () => {
        await axios.post("/api/mypage/allergies", {
            allergyIds: checked
        });

        alert("알레르기 정보가 저장되었습니다!");
    };

    return (
        <div style={{ padding: "20px" }}>
            <h2>알레르기 선택</h2>

            <div>
                {allergies.map(a => (
                    <label key={a.id} style={{ display: "block", marginBottom: "10px" }}>
                        <input
                            type="checkbox"
                            checked={checked.includes(a.id)}
                            onChange={() => toggleCheck(a.id)}
                        />
                        {a.name}
                    </label>
                ))}
            </div>

            <button onClick={handleSave} style={{ marginTop: "20px" }}>
                저장하기
            </button>
        </div>
    );
}

export default Allergies;
