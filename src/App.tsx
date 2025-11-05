import "./index.css";
import { MemoryRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./panel/components/Navbar";  // 네비게이션 컴포넌트
import Dictionary from "./panel/pages/Dictionary";
import Goal from "./panel/pages/Goal";
import Ide from "./panel/pages/Ide";
import Statistics from "./panel/pages/Statistics";

export default function App() {
    return (
        <Router>
            <div className="min-h-screen bg-base-100">
                {/* 상단 네비게이션 */}
                <Navbar />

                {/* 라우트에 따라 페이지 변경 */}
                <Routes>
                    <Route path="/" element={<Ide />} /> {/* 기본 진입 페이지 */}
                    <Route path="/ide" element={<Ide />} />
                    <Route path="/dictionary" element={<Dictionary />} />
                    <Route path="/goal" element={<Goal />} />
                    <Route path="/stats" element={<Statistics />} />
                </Routes>
            </div>
        </Router>
    );
}
