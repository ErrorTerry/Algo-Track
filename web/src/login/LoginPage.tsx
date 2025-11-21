import KakaoLogin from "../login/KakaoLogin";

/**
 * Renders the centered AlgoTrack login page with title, helper text, and a section for login option buttons.
 *
 * @returns The JSX element for the login page layout containing the title, description, and login options area.
 */
export default function LoginPage() {
    return (
        <div className="flex flex-col items-center justify-center h-screen gap-8 text-center">
            <h1 className="text-3xl font-bold">🧩 AlgoTrack 로그인 🧩</h1>
            <p className="text-gray-700">
                로그인 방법을 선택해 주세요.
            </p>

            {/* 나중에 추가할 로그인 버튼들 자리 */}
            <div className="flex flex-col gap-4 mt-4">

                {/* 🔥 카카오 로그인 버튼 (컴포넌트로 분리) */}
                <KakaoLogin />
            </div>
        </div>
    );
}