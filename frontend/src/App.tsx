import "./index.css";
import { MemoryRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import Navbar from "./panel/components/Navbar";
import Dictionary from "./panel/pages/Dictionary";
import Goal from "./panel/pages/Goal";
import Ide from "./panel/pages/Ide";
import Statistics from "./panel/pages/Statistics";
import Login from "./panel/pages/KakaoLogin";

export default function App() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    // 예시: 로그인 여부를 로컬스토리지에서 불러오기
    useEffect(() => {
        const token = localStorage.getItem("authToken");
        setIsLoggedIn(!!token);
    }, []);

    return (
        <Router>
            <div className="min-h-screen bg-base-100">
                {isLoggedIn ? (
                    <>
                        {/* 로그인 상태일 때만 네비게이션 표시 */}
                        <Navbar />

                        {/* 메인 페이지들 */}
                        <Routes>
                            <Route path="/" element={<Ide />} />
                            <Route path="/ide" element={<Ide />} />
                            <Route path="/dictionary" element={<Dictionary />} />
                            <Route path="/goal" element={<Goal />} />
                            <Route path="/stats" element={<Statistics />} />
                            {/* 로그인된 상태에서 로그인 페이지로 가려 하면 자동으로 / 로 리다이렉트 */}
                            <Route path="/login" element={<Navigate to="/" />} />
                        </Routes>
                    </>
                ) : (
                    // 로그인 안 된 경우 로그인 페이지로 고정
                    <Routes>
                        <Route path="*" element={<Login />} />
                    </Routes>
                )}
            </div>
        </Router>
    );
}
