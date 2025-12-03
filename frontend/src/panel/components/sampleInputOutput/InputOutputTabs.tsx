import { useEffect, useState } from "react";

type Sample = { id: number; input: string; output: string };

type SamplePayload = {
    problemId?: string;
    problemTitle?: string;
    url: string;
    samples: { index: number; input: string; output: string }[];
    parsedAt: number;
};

export default function InputOutputTabs() {
    const [samples, setSamples] = useState<Sample[]>([]);
    const [active, setActive] = useState<number>(0);

    useEffect(() => {
        const applyPayload = (p?: SamplePayload) => {
            if (!p) return;
            setSamples(
                (p.samples ?? []).map((s) => ({
                    id: s.index,
                    input: s.input,
                    output: s.output,
                }))
            );
            setActive(0);
        };

        const onDoc = (e: Event) =>
            applyPayload((e as CustomEvent<SamplePayload>).detail);
        document.addEventListener("boj:samples", onDoc as EventListener);

        const onMsg = (ev: MessageEvent) => {
            if (ev.origin !== location.origin) return;
            const data: any = ev.data;
            if (data?.type === "BOJ_SAMPLES") applyPayload(data.payload);
        };
        window.addEventListener("message", onMsg);

        // 초기 데이터 요청
        window.postMessage({ type: "REQUEST_SAMPLES" }, location.origin);

        return () => {
            document.removeEventListener("boj:samples", onDoc as EventListener);
            window.removeEventListener("message", onMsg);
        };
    }, []);

    if (samples.length === 0) {
        return (
            <div className="w-full h-full flex items-center justify-center">
                <div className="alert alert-info text-[14px] leading-relaxed">
                    예제가 아직 감지되지 않았어!
                </div>
            </div>
        );
    }

    return (
        <div className="w-full h-full flex flex-col min-h-0 gap-3">
            {/* 예제 선택 버튼들 */}
            <div className="shrink-0 flex items-center gap-2 mt-3">
                {samples.map((s, idx) => {
                    const isActive = active === idx;
                    return (
                        <button
                            key={s.id}
                            type="button"
                            onClick={() => setActive(idx)}
                            className={
                                "px-4 py-2 rounded-xl border text-[13px] md:text-[14px] pt-3 pb-3 " +
                                "transition-all duration-150 " +
                                (isActive
                                    ? "bg-blue-500 text-white border-blue-500 shadow-sm"
                                    : "bg-base-100 text-base-content/70 border-base-300 hover:bg-blue-50 hover:border-blue-300")
                            }
                        >
                            예제 {idx + 1}
                        </button>
                    );
                })}
            </div>

            {/* 아래 카드 영역 */}
            <div className="flex-1 min-h-0 w-full">
                {samples.map((s, idx) => {
                    const hidden = active !== idx;
                    return (
                        <div
                            key={s.id}
                            hidden={hidden}
                            className="h-full min-h-0 grid grid-cols-1 md:grid-cols-2 gap-4"
                        >
                            {/* 예제 입력 카드 */}
                            <div className="h-full min-h-0 flex flex-col">
                                <div className="rounded-2xl border border-blue-100 bg-blue-50/70 h-full min-h-0 flex flex-col">
                                    {/* 카드 헤더 */}
                                    <div className="flex items-center justify-between px-4 py-3 border-b border-blue-100 shrink-0">
                                        <div className="flex items-center gap-2">
                                            <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-blue-500/10 text-blue-600">
                                                <svg
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    viewBox="0 0 24 24"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    strokeWidth={1.7}
                                                    className="w-4 h-4"
                                                >
                                                    <path d="M4 5h16M6 9h12M8 13h8M10 17h4" />
                                                </svg>
                                            </span>
                                            <span className="text-[14px] md:text-[15px] font-semibold text-blue-700">
                                                예제 입력 {idx + 1}
                                            </span>
                                        </div>
                                    </div>

                                    {/* 카드 본문 */}
                                    <div className="flex-1 min-h-0 p-4 flex flex-col">
                                        <pre
                                            className="grow min-h-0 m-0 whitespace-pre
                                                       overflow-x-auto overflow-y-auto
                                                       border border-blue-100/80 rounded-xl
                                                       p-3 pb-6 leading-7 font-mono box-border bg-base-100"
                                        >

                                            {s.input || "(비어있음)"}
                                        </pre>
                                    </div>
                                </div>
                            </div>

                            {/* 예제 출력 카드 */}
                            <div className="h-full min-h-0 flex flex-col">
                                <div className="rounded-2xl border border-green-100 bg-green-50/70 h-full min-h-0 flex flex-col">
                                    {/* 카드 헤더 */}
                                    <div className="flex items-center justify-between px-4 py-3 border-b border-green-100 shrink-0">
                                        <div className="flex items-center gap-2">
                                            <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-green-500/10 text-green-600">
                                                <svg
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    viewBox="0 0 24 24"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    strokeWidth={1.7}
                                                    className="w-4 h-4"
                                                >
                                                    <path d="M5 13l4 4L19 7" />
                                                </svg>
                                            </span>
                                            <span className="text-[14px] md:text-[15px] font-semibold text-green-700">
                                                예제 출력 {idx + 1}
                                            </span>
                                        </div>
                                    </div>

                                    {/* 카드 본문 */}
                                    <div className="flex-1 min-h-0 p-4 flex flex-col">
                                        <pre
                                            className="grow min-h-0 m-0 whitespace-pre
                                                       overflow-x-auto overflow-y-auto
                                                       border border-green-100/80 rounded-xl
                                                       p-3 pb-6 leading-7 font-mono box-border bg-base-100"
                                        >
                                            {s.output || "(비어있음)"}
                                        </pre>
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
