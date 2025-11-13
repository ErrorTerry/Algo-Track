export default function KakaoLogin() {
    const src =
        (globalThis as any)?.chrome?.runtime?.getURL
            ? chrome.runtime.getURL("dist/kakao_login_large_wide.png") // public은 dist 루트에 복사됨
            : "kakao_login_large_wide.png"; // dev 서버 대비용

    return (
        <div className="flex flex-col justify-center items-center h-screen space-y-6 text-center">
            <h1 className="text-4xl font-bold">🧩 Algo Track 🧩</h1>
            <h2 className="text-lg text-gray-700">
                로그인하고 오늘의 알고리즘 여정을 시작해보세요
            </h2><br/><br/><br/>

            <button className="p-0 bg-transparent border-none hover:scale-105 transition-transform duration-200">
                <img
                    src={src}
                    alt="카카오 로그인"
                    className="w-[320px] md:w-[350px] h-auto"
                />
            </button>

            <button // 임시 로그인 버튼 (개발용)
                className="pt-5 bg-transparent border-none hover:scale-105 transition-transform duration-200"
                onClick={() => {
                    localStorage.setItem("authToken", "dummy");
                    location.reload();
                }}
            >
                임시 로그인
            </button>

        </div>
    );
}
