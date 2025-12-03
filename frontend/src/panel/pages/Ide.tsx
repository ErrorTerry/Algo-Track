import { useEffect, useRef, useState } from "react";
import IdeUI from "../components/ide/IdeUI";
import type { IdeUIHandle } from "../components/ide/IdeUI";
import IdeHeader from "../components/ide/IdeHeader";
import IdePageTabs from "../components/sampleInputOutput/IdePageTabs";
import api from "../../shared/api";
import { safeSetProblemStorage } from "../../shared/safeStorage";

type Sample = { id: number; input: string; output: string };
type SamplePayload = {
    problemId?: string;
    problemTitle?: string;
    url: string;
    samples: { index: number; input: string; output: string }[];
    parsedAt: number;
};

// 문제 ID 추출
const getProblemId = () => {
    const match = window.location.pathname.match(/\/problem\/(\d+)/);
    return match ? match[1] : "default";
};

export default function Ide() {
    const problemId = getProblemId();

    const editorRef = useRef<IdeUIHandle | null>(null);
    const [language, setLanguage] = useState<string>("");
    const [loading, setLoading] = useState(false);
    const [samples, setSamples] = useState<Sample[]>([]);

    // ⭐ 언어 복원
    useEffect(() => {
        const saved = localStorage.getItem(`ide_language_${problemId}`);
        if (saved) setLanguage(saved);
    }, [problemId]);

    // ⭐ 언어 저장
    useEffect(() => {
        if (language) {
            safeSetProblemStorage(`ide_language_${problemId}`, language);
        }
    }, [language, problemId]);

    // ⭐ 코드 복원
    useEffect(() => {
        const saved = localStorage.getItem(`ide_code_${problemId}`);
        if (saved && editorRef.current) {
            editorRef.current.setCode(saved);
        }
    }, [problemId]);

    // ⭐ 코드 변경 감지 → 저장
    const handleCodeChange = () => {
        const code = editorRef.current?.getCode() ?? "";
        safeSetProblemStorage(`ide_code_${problemId}`, code);
    };

    // 예제 수신
    useEffect(() => {
        const apply = (p?: SamplePayload) => {
            if (!p) return;
            setSamples(
                (p.samples ?? []).map((s) => ({
                    id: s.index,
                    input: s.input,
                    output: s.output,
                }))
            );
        };

        const onDoc = (e: Event) =>
            apply((e as CustomEvent<SamplePayload>).detail);
        document.addEventListener("boj:samples", onDoc as EventListener);

        const onMsg = (ev: MessageEvent) => {
            if (ev.origin !== window.location.origin) return;
            if (ev.data?.type === "BOJ_SAMPLES") apply(ev.data.payload);
        };

        window.addEventListener("message", onMsg);
        window.postMessage({ type: "REQUEST_SAMPLES" }, window.location.origin);

        return () => {
            document.removeEventListener("boj:samples", onDoc as EventListener);
            window.removeEventListener("message", onMsg);
        };
    }, []);

    // 실행
    const handleRun = async () => {
        const code = editorRef.current?.getCode() ?? "";

        if (!language) return alert("언어를 선택해 주세요.");
        if (!code.trim()) return alert("실행할 코드가 비어 있어요.");

        setLoading(true);

        try {
            // 예제 없는 경우
            if (samples.length === 0) {
                const res = await api.post("/api/run", {
                    language,
                    code,
                    stdin: "",
                });

                const stdout = res.data?.run?.stdout ?? res.data?.stdout ?? "";

                window.postMessage(
                    {
                        type: "BOJ_RUN_RESULT",
                        payload: { sampleId: 0, output: stdout },
                    },
                    window.location.origin
                );
                return;
            }

            // 예제 있는 경우
            for (const s of samples) {
                const res = await api.post("/api/run", {
                    language,
                    code,
                    stdin: s.input,
                });

                const stdout = res.data?.run?.stdout ?? res.data?.stdout ?? "";

                window.postMessage(
                    {
                        type: "BOJ_RUN_RESULT",
                        payload: { sampleId: s.id, output: stdout },
                    },
                    window.location.origin
                );
            }
        } catch (e) {
            console.error(e);
            alert("실행 중 오류가 발생했어요! 콘솔을 한 번 확인해 주세요.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div
            className="
                h-[calc(100vh-100px)]
                grid grid-rows-[minmax(0,1fr)_minmax(0,1fr)]
                gap-4
                p-4
                bg-base-200/60
                overflow-hidden
            "
        >
            {/* 상단 IDE 영역 */}
            <div
                className="
                    rounded-2xl border border-base-300 bg-base-100/95
                    shadow-sm grid overflow-hidden min-h-0
                "
                style={{ gridTemplateRows: "auto 1fr" }}
            >
                {/* 상단 바 */}
                <div className="relative z-10 w-full flex items-center justify-between gap-4 px-5 py-4 border-b bg-base-100/95">
                    <div className="flex flex-col gap-1 min-w-0">
                        <p className="text-[14px] leading-snug text-base-content/60 truncate">
                            백준 문제{" "}
                            <span className="font-medium text-base-content/80">
                                {problemId}
                            </span>{" "}
                            코드를 바로 실행해 보세요.
                        </p>
                    </div>

                    <IdeHeader
                        language={language}
                        onChangeLanguage={setLanguage}
                        onRun={handleRun}
                        loading={loading}
                    />
                </div>

                {/* 에디터 영역 */}
                <div className="min-h-0 overflow-hidden">
                    <IdeUI ref={editorRef} onChange={handleCodeChange} />
                </div>
            </div>

            {/* 아래쪽 예제 탭 */}
            <div
                className="
                    rounded-2xl border border-base-300 bg-base-100/95
                    shadow-sm flex flex-col overflow-hidden min-h-0
                "
            >
                <div className="flex-1 min-h-0 p-4">
                    <IdePageTabs />
                </div>
            </div>
        </div>
    );
}
