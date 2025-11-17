import { useRef, useState } from "react";
import IdeUI from "../components/ide/IdeUI";
import type { IdeUIHandle } from "../components/ide/IdeUI";
import IdeHeader from "../components/ide/IdeHeader";
import IdePageTabs from "../components/sampleInputOutput/IdePageTabs";
import api from "../../shared/api";

export default function Ide() {
    const editorRef = useRef<IdeUIHandle | null>(null);

    const [language, setLanguage] = useState<string>("");
    const [loading, setLoading] = useState(false);

    const handleRun = async () => {
        const code = editorRef.current?.getCode() ?? "";

        if (!language) {
            alert("언어를 선택해 주세요.");
            return;
        }
        if (!code.trim()) {
            alert("실행할 코드가 비어 있어요.");
            return;
        }

        try {
            setLoading(true);

            // 👉 지금은 stdin 자동 주입 안 하니까 일단 빈 문자열
            const body = { language, code, stdin: "" };
            const res = await api.post("/api/run", body);

            console.log("✅ /api/run result:", res.data);

            // 👉 Piston 응답에서 stdout 뽑기
            const stdout =
                (res.data as any)?.run?.stdout ??
                (res.data as any)?.stdout ??
                "";

            console.log("✅ extracted stdout:", JSON.stringify(stdout));

            // 👉 실행 결과를 아래 테스트 탭으로 전달
            //    일단 예제 1번 기준으로 sampleId = 1 고정
            window.postMessage(
                {
                    type: "BOJ_RUN_RESULT",
                    payload: {
                        sampleId: 1,      // 🔥 TestResultTabs 에서도 id가 1인 예제가 있어야 함
                        output: stdout ?? "",
                    },
                },
                window.location.origin,
            );
        } catch (e: any) {
            console.error(e);
            alert(
                "실행 중 오류가 발생했어요. (자세한 내용은 콘솔 로그 확인)"
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="h-[calc(100vh-100px)] grid grid-rows-2 gap-4 p-4 overflow-hidden">
            {/* 위쪽 IDE 영역 */}
            <div
                className="rounded-lg border border-base-300 grid overflow-hidden"
                style={{ gridTemplateRows: "12% 88%" }}
            >
                <div className="relative z-50 w-full min-w-0 flex flex-wrap items-center justify-end gap-2 sm:gap-3 px-4 py-2 border-b border-base-300 bg-base-200">
                    <IdeHeader
                        language={language}
                        onChangeLanguage={setLanguage}
                        onRun={handleRun}
                        loading={loading}
                    />
                </div>

                <div className="min-h-0 rounded-b-lg overflow-hidden">
                    <IdeUI ref={editorRef} />
                </div>
            </div>

            {/* 아래쪽 예제 입출력 / 테스트 결과 영역 */}
            <div className="rounded-lg border border-base-300 h-full flex flex-col overflow-hidden">
                <div className="flex-1 min-h-0">
                    <IdePageTabs />
                </div>
            </div>
        </div>
    );
}