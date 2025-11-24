import KakaoLogin from "../login/KakaoLogin";

export default function LoginPage() {
    return (
        <div className="flex flex-col items-center justify-center h-screen gap-8 text-center">
            <h1 className="text-3xl font-bold">🧩 AlgoTrack 로그인 🧩</h1>
            <p className="text-gray-700">로그인 방법을 선택해 주세요.</p>

            <div className="flex flex-col gap-4 mt-4">
                {/* 카카오 로그인 버튼 */}
                <KakaoLogin />
            </div>
        </div>
    );
}
