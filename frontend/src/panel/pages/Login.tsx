/**
 * Render the Algo Track login page with controls to start the authentication flow.
 *
 * The primary action opens the web login at https://algotrack.store/login — using a new Chrome extension tab when the extension API is available or opening a new browser tab otherwise. A development shortcut stores a dummy `authToken` in localStorage and reloads the page.
 *
 * @returns The rendered JSX for the login page.
 */
export default function Login() {
    const handleOpenWebLogin = () => {
        const loginUrl = "https://algotrack.store/login";

        // 확장앱 환경일 때
        if ((globalThis as any).chrome?.tabs) {
            chrome.tabs.create({url: loginUrl});
        } else {
            // dev 환경일 때 (로컬에서 테스트 할 때)
            window.open(loginUrl, "_blank");
        }
    };

    return (
        <div className="flex flex-col justify-center items-center h-screen space-y-6 text-center">
            <h1 className="text-4xl font-bold">🧩 Algo Track 🧩</h1>
            <h2 className="text-lg text-gray-700">
                로그인하고 오늘의 알고리즘 여정을 시작해보세요
            </h2>
            <br/>
            <br/>
            <br/>

            {/* 로그인 하러가기 버튼 */}
            <button
                className="
                btn
                btn-success
                btn-wide
                w-[700px]
                h-[50px]
                text-3xl
                rounded-full
                shadow-lg
                hover:scale-105
                transition-transform
                duration-200
                "
                onClick={handleOpenWebLogin}
            >
                로그인 하러가기
            </button>

            {/* 개발용 임시 로그인 버튼 */}
            <button
                className="pt-10 bg-transparent border-none hover:scale-105 transition-transform duration-200"
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