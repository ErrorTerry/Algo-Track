// src/pages/Ide.tsx
import { useRef, useState } from "react";
import IdeUI from "../components/ide/IdeUI";
import type { IdeUIHandle } from "../components/ide/IdeUI";
import IdeHeader from "../components/ide/IdeHeader";
import IdePageTabs from "../components/sampleInputOutput/IdePageTabs";
import api from "../../shared/api"; // 너가 쓰는 경로에 맞춰서!

type RunResult = any; // 필요하면 나중에 Piston 응답 타입 정의해도 됨

export default function Ide() {
    const editorRef = useRef<IdeUIHandle | null>(null);

    const [language, setLanguage] = useState<string>("python");
    const [stdin, setStdin] = useState<string>("");
    const [output, setOutput] = useState<string>("");
    const [error, setError] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(false);

    const handleRun = async () => {
        const code = editorRef.current?.getCode() ?? "";

        setError("");
        setOutput("");

        if (!language) {
            setError("언어를 선택해 주세요.");
            return;
        }
        if (!code.trim()) {
            setError("실행할 코드가 비어 있어요.");
            return;
        }

        try {
            setLoading(true);

            const body = {
                language,       // ex) "python"
                code,           // 에디터 내용
                stdin,          // 아래 textarea에 입력한 값
            };

            const res = await api.post("/api/run", body);

            // Piston 응답 구조를 아직 정확히 안 쓴 상태라 우선 전체를 JSON으로 보여주자
            setOutput(JSON.stringify(res.data, null, 2));

        } catch (e: any) {
            console.error(e);
            setError(e.response?.data?.message ?? e.message ?? "실행 중 오류가 발생했어요.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="h-[calc(100vh-100px)] grid grid-rows-2 gap-4 p-4 overflow-hidden">
            {/* 위쪽 IDE 영역 */}
            <div
                className="rounded-lg border border-base-300 grid overflow-hidden"
                style={{
                    gridTemplateRows: "12% 88%",
                }}
            >
                {/* 헤더 */}
                <div className="relative z-50 w-full min-w-0 flex flex-wrap items-center justify-end gap-2 sm:gap-3 px-4 py-2 border-b border-base-300 bg-base-200">
                    <IdeHeader
                        language={language}
                        onChangeLanguage={setLanguage}
                        onRun={handleRun}
                        loading={loading}
                    />
                </div>

                {/* 에디터 + stdin + 결과 */}
                <div className="min-h-0 rounded-b-lg overflow-hidden">
                    <div className="flex flex-col h-full">
                        {/* 에디터 */}
                        <div className="flex-1 min-h-0">
                            <IdeUI ref={editorRef} />
                        </div>

                        {/* stdin & 결과 패널 */}
                        <div className="border-t border-base-300 grid grid-cols-1 md:grid-cols-2 gap-2 p-3 bg-base-200/50">
                            {/* stdin 입력 */}
                            <div className="flex flex-col gap-1">
                                <span className="text-sm font-semibold">표준 입력 (stdin)</span>
                                <textarea
                                    className="textarea textarea-bordered textarea-sm md:textarea-md w-full resize-none"
                                    rows={4}
                                    placeholder="예제 입력이나 테스트 입력을 여기에 적어봐 👉"
                                    value={stdin}
                                    onChange={(e) => setStdin(e.target.value)}
                                />
                            </div>

                            {/* 결과 출력 */}
                            <div className="flex flex-col gap-1">
                                <span className="text-sm font-semibold">실행 결과</span>
                                <div className="border border-base-300 rounded-lg bg-base-100 h-full p-2 overflow-auto text-xs md:text-sm whitespace-pre-wrap">
                                    {loading && (
                                        <div className="flex items-center gap-2 text-sm">
                                            <span className="loading loading-spinner loading-sm" />
                                            <span>코드 실행 중...</span>
                                        </div>
                                    )}
                                    {!loading && error && (
                                        <div className="text-error">{error}</div>
                                    )}
                                    {!loading && !error && output && (
                                        <pre>{output}</pre>
                                    )}
                                    {!loading && !error && !output && (
                                        <span className="text-base-content/60 text-sm">
                      아직 실행 결과가 없어요. 코드를 작성하고 Run 버튼을 눌러봐! 🚀
                    </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* 아래쪽 예제 입출력 영역 (지금 건들지 말기) */}
            <div className="rounded-lg border border-base-300 h-full flex flex-col overflow-hidden">
                <div className="flex-1 min-h-0">
                    <IdePageTabs />
                </div>
            </div>
        </div>
    );
}
