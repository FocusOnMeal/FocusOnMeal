import { Navigate } from "react-router-dom";

let alertShown = false;

const AdminRoute = ({ children }) => {
    const token = sessionStorage.getItem("token");
    const adminYn = sessionStorage.getItem("adminYn");

    if (!token) {
        if (!alertShown) {
            alert("로그인이 필요한 서비스입니다.");
            alertShown = true;
        }
        return <Navigate to="/member/login" replace />;
    }

    if (adminYn !== 'Y') {
        if (!alertShown) {
            alert("관리자만 접근할 수 있습니다.");
            alertShown = true;
        }
        return <Navigate to="/" replace />;
    }

    return children;
};

export default AdminRoute;
