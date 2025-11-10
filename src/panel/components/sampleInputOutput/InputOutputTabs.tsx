import { useEffect, useState } from "react";

type Sample = {
    id: number;
    input: string;
    output: string;
};

type SamplePayload = {
    problemId?: string;
    problemTitle?: string;
    url: string;
    samples: { index: number; input: string; output: string }[];
    parsedAt: number;
};

export default function InputOutputTabs() {
    const [problemId, setProblemId] = useState<string | undefined>();
    const [title, setTitle] = useState<string | undefined>();
    const [samples, setSamples] = useState<Sample[]>([]);
    const [lastParsedAt, setLastParsedAt] = useState<number | undefined>();
    const [active, setActive] = useState<number>(0);

    // content.js에서 postMessage나 document 이벤트로 받은 데이터 처리
    useEffect(() => {
        const applyPayload = (payload?: SamplePayload) => {
            if (!payload) return;
            setProblemId(payload.problemId);
            setTitle(payload.problemTitle);
            setSamples(
                (payload.samples ?? []).map((s) => ({
                    id: s.index,
                    input: s.input,
                    output: s.output,
                }))
            );
            setLastParsedAt(payload.parsedAt);
            setActive(0);
        };

        // 1) document 이벤트
        const onDoc = (e: Event) => {
            const detail = (e as CustomEvent<SamplePayload>).detail;
            applyPayload(detail);
        };
        document.addEventListener("boj:samples", onDoc as EventListener);

        // 2) postMessage 이벤트
        const onMsg = (ev: MessageEvent) => {
            if (ev.origin !== location.origin) return;
            if (ev.data?.type !== "BOJ_SAMPLES") return;
            applyPayload(ev.data.payload);
        };
        window.addEventListener("message", onMsg);

        // 3) 초기 요청 (패널이 늦게 로드될 때 최신 데이터 요청)
        window.postMessage({ type: "REQUEST_SAMPLES" }, location.origin);

        return () => {
            document.removeEventListener("boj:samples", onDoc as EventListener);
            window.removeEventListener("message", onMsg);
        };
    }, []);

    return (
        <div className="w-full h-full space-y-4">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold">
                    {title || "문제 제목 미확인"} {problemId ? `#${problemId}` : ""}
                </h2>
                {lastParsedAt && (
                    <span className="text-xs opacity-70">
            업데이트: {new Date(lastParsedAt).toLocaleString()}
          </span>
                )}
            </div>

            {samples.length === 0 ? (
                <div className="alert alert-info">
                    <span>예제가 아직 감지되지 않았어!</span>
                </div>
            ) : (
                <>
                    {/* 탭 헤더 */}
                    <div className="tabs tabs-boxed w-full">
                        {samples.map((s, idx) => (
                            <button
                                key={s.id}
                                className={`tab px-6 text-sm md:text-base ${active === idx ? "tab-active" : ""}`}
                                onClick={() => setActive(idx)}
                            >
                                예제 {s.id}
                            </button>
                        ))}
                    </div>

                    {/* 탭 콘텐츠 */}
                    <div className="bg-base-100 border border-base-300 rounded-box p-4">
                        {samples.map((s, idx) => (
                            <div key={s.id} hidden={active !== idx} className="grid md:grid-cols-2 gap-4">
                                <div className="form-control">
                                    <label className="label">
                                        <span className="label-text font-semibold">예제 입력 {s.id}</span>
                                    </label>
                                    <pre className="textarea textarea-bordered whitespace-pre-wrap leading-6 p-3 min-h-28 font-mono">
                    {s.input || "(비어있음)"}
                  </pre>
                                </div>

                                <div className="form-control">
                                    <label className="label">
                                        <span className="label-text font-semibold">예제 출력 {s.id}</span>
                                    </label>
                                    <pre className="textarea textarea-bordered whitespace-pre-wrap leading-6 p-3 min-h-28 font-mono">
                    {s.output || "(비어있음)"}
                  </pre>
                                </div>
                            </div>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}
