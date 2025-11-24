import "./index.css";
import {
    MemoryRouter as Router,
    Routes,
    Route,
    Navigate,
} from "react-router-dom";
import {useState, useEffect} from "react";
import Navbar from "./panel/components/Navbar";
import Dictionary from "./panel/pages/Dictionary";
import Goal from "./panel/pages/Goal";
import Ide from "./panel/pages/Ide";
import Statistics from "./panel/pages/Statistics";
import Login from "./panel/pages/Login";

// chrome API 사용 (확장앱 환경)
const extChrome = (globalThis as any).chrome;

export default function App() {
    // null = 로딩중, true/false = 로그인 여부 확정됨
    const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);

    useEffect(() => {
        if (extChrome?.storage?.local) {
            // 첫 로딩 시 accessToken 가져오기
            extChrome.storage.local.get(["accessToken"], (res: any) => {
                setIsLoggedIn(!!res.accessToken);
            });

            // accessToken 변경 감지 → 로그인 상태 자동 업데이트
            const listener = (changes: any, areaName: string) => {
                if (areaName !== "local" || !changes.accessToken) return;
                setIsLoggedIn(!!changes.accessToken.newValue);
            };

            extChrome.storage.onChanged.addListener(listener);
            return () => extChrome.storage.onChanged.removeListener(listener);

        } else {
            // 개발 환경용 (chrome.storage 없음)
            const token = localStorage.getItem("accessToken");
            setIsLoggedIn(!!token);
        }
    }, []);

    // 로딩 중이라면 잠깐 대기 (스피너 넣을 수도 있음)
    if (isLoggedIn === null) return null;

    return (
        <Router>
            <div className="min-h-screen bg-base-100">
                {isLoggedIn ? (
                    <>
                        <Navbar />
                        <Routes>
                            <Route path="/" element={<Ide />} />
                            <Route path="/ide" element={<Ide />} />
                            <Route path="/dictionary" element={<Dictionary />} />
                            <Route path="/dictionary/:algoId" element={<Dictionary />} />
                            <Route path="/goal" element={<Goal />} />
                            <Route path="/stats" element={<Statistics />} />
                            {/* 이미 로그인 상태라면 로그인으로 못 감 */}
                            <Route path="/login" element={<Navigate to="/" />} />
                        </Routes>
                    </>
                ) : (
                    <Routes>
                        {/* 로그인 안 되어 있으면 무조건 Login 페이지 */}
                        <Route path="*" element={<Login />} />
                    </Routes>
                )}
            </div>
        </Router>
    );
}
