import { Navigate } from "react-router-dom";

let alertShown = false;

const ProtectedRoute = ({ children }) => {
    // ✅ 수정: localStorage → sessionStorage
    const token = sessionStorage.getItem("token");

    if (!token) {
        if (!alertShown) {
            alert("로그인이 필요한 서비스입니다.");
            alertShown = true;
        }
        return <Navigate to="/member/login" replace />;
    }

    return children;
};

export default ProtectedRoute;