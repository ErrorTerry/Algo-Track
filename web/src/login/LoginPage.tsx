import KakaoLogin from "../login/KakaoLogin";
import { useNavigate } from "react-router-dom";

export default function LoginPage() {
    const navigate = useNavigate();

    const handleTempLogin = () => {
        // 임시 토큰 + 닉네임 저장
        localStorage.setItem("accessToken", "TEMP_TOKEN_FOR_TESTING");
        localStorage.setItem("nickname", "테스트유저");

        // 로그인 성공 페이지로 이동
        navigate("/login-success", { replace: true });
    };

    return (
        <div className="flex flex-col items-center justify-center h-screen gap-8 text-center">
            <h1 className="text-3xl font-bold">🧩 AlgoTrack 로그인 🧩</h1>
            <p className="text-gray-700">로그인 방법을 선택해 주세요.</p>

            <div className="flex flex-col gap-4 mt-4">
                {/* 카카오 로그인 버튼 */}
                <KakaoLogin />

                {/* 임시 로그인 버튼 */}
                <button
                    onClick={handleTempLogin}
                    className="btn btn-outline btn-info"
                >
                    임시 로그인 (개발용)
                </button>
            </div>
        </div>
    );
}
