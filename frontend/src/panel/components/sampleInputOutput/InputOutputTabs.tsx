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
            if (ev.data?.type !== "BOJ_SAMPLES") return;
            applyPayload(ev.data.payload);
        };
        window.addEventListener("message", onMsg);

        window.postMessage({ type: "REQUEST_SAMPLES" }, location.origin);

        return () => {
            document.removeEventListener("boj:samples", onDoc as EventListener);
            window.removeEventListener("message", onMsg);
        };
    }, []);

    return (
        <div className="w-full h-full flex flex-col min-h-0">
            {samples.length === 0 ? (
                <div className="alert alert-info">
                    <span>예제가 아직 감지되지 않았어!</span>
                </div>
            ) : (
                <>
                    <div className="tabs tabs-boxed w-full shrink-0 overflow-x-auto rounded-b-none">
                        {samples.map((s, idx) => (
                            <button
                                key={s.id}
                                onClick={() => setActive(idx)}
                                className={`tab px-6 text-sm md:text-base transition-colors duration-150 font-semibold
                                    ${
                                    active === idx
                                        ? "tab-active bg-neutral-content text-white shadow-md"
                                        : "hover:bg-neutral-content hover:text-white"
                                }`}
                            >
                                예제 {s.id}
                            </button>
                        ))}
                    </div>

                    <div className="flex-1 min-h-0 w-full border border-base-300 rounded-t-none rounded-b-box">
                        {samples.map((s, idx) => (
                            <div
                                key={s.id}
                                hidden={active !== idx}
                                className="h-full min-h-0 grid grid-cols-1 md:grid-cols-2 gap-4 p-4"
                            >
                                {/* 입력 */}
                                <div className="flex flex-col min-h-0">
                                    <label className="label shrink-0">
                                        <span className="label-text font-semibold">
                                            예제 입력 {s.id}
                                        </span>
                                    </label>
                                    <pre
                                        className="grow min-h-0 m-0
                                            whitespace-pre overflow-x-auto overflow-y-auto
                                            border border-base-300 rounded-box p-3 pb-6
                                            leading-6 font-mono box-border"
                                    >
                                        {s.input || "(비어있음)"}
                                    </pre>
                                </div>

                                {/* 출력 */}
                                <div className="flex flex-col min-h-0">
                                    <label className="label shrink-0">
                                        <span className="label-text font-semibold">
                                            예제 출력 {s.id}
                                        </span>
                                    </label>
                                    <pre
                                        className="grow min-h-0 m-0
                                            whitespace-pre overflow-x-auto overflow-y-auto
                                            border border-base-300 rounded-box p-3 pb-6
                                            leading-6 font-mono box-border"
                                    >
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
