// 로그인 성공 후 보여주는 환영 페이지 컴포넌트

import { useEffect, useState } from "react";

export default function LoginSuccess() {
    const [nickname, setNickname] = useState<string>("");

    useEffect(() => {
        const savedNickname = localStorage.getItem("nickname");
        if (savedNickname) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setNickname(savedNickname);
        }
        console.log("💡 LoginSuccess page mounted");
    }, []);

    const handleGoBaekjoon = () => {
        window.location.href = "https://www.acmicpc.net";
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-base-200 px-4">
            <div className="max-w-3xl w-full bg-base-100 rounded-2xl shadow-xl p-8 md:p-10 space-y-8">

                {/* 헤더 */}
                <div className="space-y-2 text-center">
                    <p className="text-sm font-semibold text-primary">
                        로그인 완료 🎉
                    </p>
                    <h1 className="text-2xl md:text-3xl font-bold">
                        {nickname ? `${nickname}님, ` : ""}
                        알고트랙에 오신 걸 환영합니다!
                    </h1>
                    <p className="text-sm md:text-base text-base-content/70">
                        이제 백준에서 문제를 풀면서{" "}
                        <span className="font-semibold">
                            IDE, 알고리즘 사전, 목표 관리, 학습 통계
                        </span>
                        를 함께 활용할 수 있어요.
                    </p>
                </div>

                {/* 기능 카드 */}
                <div className="grid gap-4 md:gap-5 md:grid-cols-3">
                    <div className="p-4 rounded-xl bg-base-200/60">
                        <p className="text-lg mb-1">🧩 IDE + 알고리즘 사전</p>
                        <p className="text-xs md:text-sm text-base-content/70 leading-snug">
                            문제를 풀며 필요한 알고리즘 개념을
                            바로 참고하고 코드를 실행할 수 있어요.
                        </p>
                    </div>

                    <div className="p-4 rounded-xl bg-base-200/60">
                        <p className="text-lg mb-1">🎯 목표 설정</p>
                        <p className="text-xs md:text-sm text-base-content/70 leading-snug">
                            목표를 세우고 꾸준한
                            학습 루틴을 만들 수 있어요.
                        </p>
                    </div>

                    <div className="p-4 rounded-xl bg-base-200/60">
                        <p className="text-lg mb-1">📊 학습 통계</p>
                        <p className="text-xs md:text-sm text-base-content/70 leading-snug">
                            목표 달성률과 알고리즘 능력치를 통해
                            내 강점을 확인할 수 있어요.
                        </p>
                    </div>
                </div>

                {/* 안내 문구 */}
                <div className="bg-base-200/70 rounded-xl p-4 text-sm md:text-base text-base-content/80">
                    <p className="font-semibold mb-1">다음 단계</p>
                    <p>
                        아래{" "}
                        <span className="font-semibold">
                            “백준으로 이동”
                        </span>{" "}
                        버튼을 눌러 백준 페이지에서 알고트랙 기능을 사용해 보세요!
                    </p>
                </div>

                {/* 버튼 */}
                <div className="flex flex-col md:flex-row gap-3 md:gap-4 md:justify-center">
                    <button
                        type="button"
                        onClick={handleGoBaekjoon}
                        className="btn btn-primary"
                    >
                        🧩 백준으로 이동해서 문제 풀기
                    </button>
                </div>
            </div>
        </div>
    );
}
