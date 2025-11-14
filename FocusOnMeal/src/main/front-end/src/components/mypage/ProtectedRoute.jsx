import { Navigate } from "react-router-dom";

let alertShown = false;

const ProtectedRoute = ({ children }) => {
    const token = localStorage.getItem("token");

    if (!token) {
        if (!alertShown) {
            alert("로그인이 필요한 서비스입니다.");
            alertShown = true;       // 한 번만 실행
        }
        return <Navigate to="/member/login" replace />;
    }

    return children;
};

export default ProtectedRoute;