/* eslint-disable @typescript-eslint/no-explicit-any */
export default function Login() {
    const handleOpenWebLogin = () => {
        const loginUrl = "https://algotrack.store/login";

        if ((globalThis as any).chrome?.tabs) {
            chrome.tabs.create({ url: loginUrl });
        } else {
            window.open(loginUrl, "_blank");
        }
    };

    return (
        <div className="flex flex-col justify-center items-center h-screen bg-base-200/70 p-6">
            <div
                className="
                w-full max-w-xl
                bg-base-100/95
                rounded-3xl
                border border-base-300
                shadow-sm
                p-10
                flex flex-col items-center
                space-y-8
            "
            >
                {/* 제목 */}
                <h1 className="text-4xl md:text-5xl font-extrabold text-base-content/90 flex items-center gap-2">
                    🧩 <span>Algo Track</span> 🧩
                </h1>

                {/* 서브 텍스트 */}
                <p className="text-xl md:text-[1.4rem] text-base-content/70 leading-relaxed text-center">
                    로그인하고 오늘의 알고리즘 여정을 시작해보세요!
                </p>

                {/* 로그인 하러가기 버튼 */}
                <button
                    onClick={handleOpenWebLogin}
                    className={`
                        btn bg-blue-500 text-white border-blue-500 shadow-sm
                        rounded-xl
                        h-[56px]
                        text-lg md:text-xl
                        w-full
                        gap-2
                        transition-all duration-150
                        hover:brightness-110
                    `}
                >
                    로그인 하러가기
                </button>
            </div>
        </div>
    );
}
