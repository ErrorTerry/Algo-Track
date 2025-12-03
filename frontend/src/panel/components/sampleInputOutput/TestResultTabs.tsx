import { useEffect, useState, Fragment } from "react";
import { safeSetProblemStorage } from "../../../shared/safeStorage";

type Sample = { id: number; input: string; output: string };
type SamplePayload = {
    problemId?: string;
    problemTitle?: string;
    url: string;
    samples: { index: number; input: string; output: string }[];
    parsedAt: number;
};

type RunResultMap = Record<number, string>;

const getProblemId = () => {
    const match = window.location.pathname.match(/\/problem\/(\d+)/);
    return match ? match[1] : "default";
};

export default function TestResultTabs() {
    const problemId = getProblemId();

    const [samples, setSamples] = useState<Sample[]>([]);
    const [results, setResults] = useState<RunResultMap>({});

    useEffect(() => {
        const saved = localStorage.getItem(`ide_results_${problemId}`);
        if (saved) setResults(JSON.parse(saved));
    }, [problemId]);

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
            if (ev.origin !== location.origin) return;

            if (ev.data?.type === "BOJ_SAMPLES") {
                apply(ev.data.payload);
            }

            if (ev.data?.type === "BOJ_RUN_RESULT") {
                const { sampleId, output } = ev.data.payload ?? {};
                const sid = Number(sampleId);
                if (Number.isNaN(sid)) return;

                setResults((prev) => {
                    const next = { ...prev, [sid]: output ?? "" };
                    safeSetProblemStorage(
                        `ide_results_${problemId}`,
                        JSON.stringify(next)
                    );
                    return next;
                });
            }
        };

        window.addEventListener("message", onMsg);
        window.postMessage({ type: "REQUEST_SAMPLES" }, location.origin);

        return () => {
            document.removeEventListener("boj:samples", onDoc as EventListener);
            window.removeEventListener("message", onMsg);
        };
    }, [problemId]);

    const normalize = (s: string) =>
        s
            .replace(/\r\n/g, "\n")
            .split("\n")
            .map((l) => l.replace(/\s+$/g, ""))
            .join("\n")
            .trimEnd();

    const getJudge = (s: Sample) => {
        const out = results[s.id];
        if (!out || !out.trim()) return "결과 없음";
        return normalize(out) === normalize(s.output)
            ? "맞았습니다 !!!"
            : "틀렸습니다ㅠㅠ";
    };


    const successBadge =
        "inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-[13px] font-medium " +
        "bg-green-50 border-green-500 text-green-700";

    const errorBadge =
        "inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-[13px] font-medium " +
        "bg-red-50 border-red-500 text-red-600";

    const noneBadge =
        "inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-[13px] font-medium " +
        "bg-gray-50 border-gray-400 text-gray-600";

    const successIcon = (
        <svg xmlns="http://www.w3.org/2000/svg"
             fill="none" viewBox="0 0 24 24"
             strokeWidth="2" stroke="currentColor"
             className="w-4 h-4">
            <circle cx="12" cy="12" r="9" />
            <path d="M9 12l2 2 4-4" />
        </svg>
    );

    const errorIcon = (
        <svg xmlns="http://www.w3.org/2000/svg"
             fill="none" viewBox="0 0 24 24"
             strokeWidth="2" stroke="currentColor"
             className="w-4 h-4">
            <circle cx="12" cy="12" r="9" />
            <path d="M9 9l6 6M15 9l-6 6" />
        </svg>
    );

    const noneIcon = (
        <svg xmlns="http://www.w3.org/2000/svg"
             fill="none" viewBox="0 0 24 24"
             strokeWidth="2" stroke="currentColor"
             className="w-4 h-4 opacity-60">
            <circle cx="12" cy="12" r="9" />
            <path d="M8 12h8" />
        </svg>
    );

    const renderBadge = (judge: string) => {
        if (judge === "맞았습니다 !!!")
            return <div className={successBadge}>{successIcon} 맞았습니다 !!!</div>;
        if (judge === "틀렸습니다ㅠㅠ")
            return <div className={errorBadge}>{errorIcon} 틀렸습니다ㅠㅠ</div>;
        return <div className={noneBadge}>{noneIcon} 결과 없음</div>;
    };


    if (samples.length === 0) {
        return (
            <div className="w-full h-full flex items-center justify-center">
                <div className="alert alert-info text-[14px] leading-relaxed">
                    예제가 아직 없어요!
                </div>
            </div>
        );
    }

    return (
        <div className="w-full h-full flex flex-col min-h-0 gap-3">

            {/* 상단 안내 */}
            <div
                className="rounded-xl border border-yellow-100 bg-yellow-50/70
                text-yellow-800/80 px-4 py-3 text-[14px] leading-relaxed
                flex items-center gap-2 mt-3 mb-3"
            >
                <span className="text-yellow-600">⚠️</span>
                <span>테스트 결과는 참고용이에요! 실제 채점과 다를 수 있어요.</span>
            </div>

            {/* 결과 리스트 */}
            <div className="flex-1 min-h-0 px-4 pb-4 overflow-y-auto">
                <div className="space-y-5">

                    {samples.map((s) => {
                        const judge = getJudge(s);
                        const myOutput = results[s.id] ?? "";

                        const isCorrect = judge === "맞았습니다 !!!";
                        const isWrong = judge === "틀렸습니다ㅠㅠ";

                        return (
                            <Fragment key={s.id}>
                                <div className="rounded-2xl border border-base-300 bg-base-200/60 shadow-sm p-4 md:p-5">

                                    {/* 헤더 */}
                                    <div className="flex items-center justify-between mb-4">
                                        <div>
                                            <div className="text-[12px] font-medium text-base-content/60 uppercase">
                                                Example {s.id}
                                            </div>
                                            <div className="text-[15px] md:text-[16px] font-semibold text-base-content/90">
                                                예제 {s.id} 결과
                                            </div>
                                        </div>

                                        {renderBadge(judge)}
                                    </div>

                                    {/* 2컬럼 */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">

                                        {/* 정답 출력 */}
                                        <div className="flex flex-col min-h-0">
                                            <label className="text-[14px] font-semibold text-blue-800/80">
                                                정답 출력
                                            </label>

                                            <div className="mt-2 flex-1 min-h-0">
                                                <div className="w-full h-full rounded-xl bg-blue-50/70 border border-blue-100 px-3 py-3">
                                                    <pre
                                                        className="m-0 whitespace-pre font-mono text-[13px] md:text-[14px]
                                                        leading-relaxed overflow-auto h-full p-3 box-border"
                                                    >
                                                        {s.output || "(비어있음)"}
                                                    </pre>
                                                </div>
                                            </div>
                                        </div>

                                        {/* 내 실행 결과 */}
                                        <div className="flex flex-col min-h-0">
                                            <label className="text-[14px] font-semibold text-base-content/80">
                                                내 실행 결과
                                            </label>

                                            <div className="mt-2 flex-1 min-h-0">
                                                <div
                                                    className={
                                                        "w-full h-full rounded-xl border px-3 py-3 " +
                                                        (isCorrect
                                                            ? "bg-green-50/80 border-green-200"
                                                            : isWrong
                                                                ? "bg-red-50/80 border-red-200"
                                                                : "bg-base-100 border-base-200")
                                                    }
                                                >
                                                    <pre
                                                        className="m-0 whitespace-pre font-mono text-[13px] md:text-[14px]
                                                        leading-relaxed overflow-auto h-full p-3 box-border"
                                                    >
                                                        {myOutput.trim()
                                                            ? myOutput
                                                            : "아직 실행 결과가 없어."}
                                                    </pre>
                                                </div>
                                            </div>
                                        </div>

                                    </div>
                                </div>
                            </Fragment>
                        );
                    })}

                </div>
            </div>

        </div>
    );
}
