import { BrowserRouter, Routes, Route } from "react-router-dom";
import LoginPage from "./login/LoginPage";
import LoginSuccess from "./login/LoginSuccess.tsx";

export default function App() {
    return (
        <BrowserRouter>
            <Routes>
                {/* 로그인 페이지 */}
                <Route path="/login" element={<LoginPage />} />

                {/* 로그인 후 온보딩 페이지 */}
                <Route path="/login-success" element={<LoginSuccess />} />

                {/* 기본 URL 접근 시 자동으로 /login으로 이동 */}
                <Route path="*" element={<LoginPage />} />
            </Routes>
        </BrowserRouter>
    );
}
