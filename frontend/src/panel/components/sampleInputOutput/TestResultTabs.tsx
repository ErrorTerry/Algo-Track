import {useEffect, useState} from "react";
import {safeSetProblemStorage} from "../../../shared/safeStorage";

type Sample = { id: number; input: string; output: string };
type SamplePayload = {
    problemId?: string;
    problemTitle?: string;
    url: string;
    samples: { index: number; input: string; output: string }[];
    parsedAt: number;
};

type RunResultMap = Record<number, string>;

// 문제 ID 추출
const getProblemId = () => {
    const match = window.location.pathname.match(/\/problem\/(\d+)/);
    return match ? match[1] : "default";
};

export default function TestResultTabs() {
    const problemId = getProblemId();

    const [samples, setSamples] = useState<Sample[]>([]);
    const [results, setResults] = useState<RunResultMap>({});

    // ⭐ 실행 결과 복원
    useEffect(() => {
        const saved = localStorage.getItem(`ide_results_${problemId}`);
        if (saved) setResults(JSON.parse(saved));
    }, [problemId]);

    // ⭐ 예제 수신 + 실행 결과 수신
    useEffect(() => {
        const apply = (p?: SamplePayload) => {
            if (!p) return;
            setSamples(
                (p.samples ?? []).map(s => ({
                    id: s.index,
                    input: s.input,
                    output: s.output
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
                const {sampleId, output} = ev.data.payload ?? {};
                const sid = Number(sampleId);
                if (Number.isNaN(sid)) return;

                // ⭐ 최신 state 반영 (핵심)
                setResults(prev => {
                    const next = {...prev, [sid]: output ?? ""};
                    safeSetProblemStorage(
                        `ide_results_${problemId}`,
                        JSON.stringify(next)
                    );
                    return next;
                });
            }
        };

        window.addEventListener("message", onMsg);
        window.postMessage({type: "REQUEST_SAMPLES"}, location.origin);

        return () => {
            document.removeEventListener("boj:samples", onDoc as EventListener);
            window.removeEventListener("message", onMsg);
        };
    }, [problemId]); // ⭐ results 제거함!

    // 공백 보정
    const normalize = (s: string) =>
        s
            .replace(/\r\n/g, "\n")
            .split("\n")
            .map(l => l.replace(/\s+$/g, ""))
            .join("\n")
            .trimEnd();

    // 판정
    const getJudge = (s: Sample) => {
        const out = results[s.id];
        if (!out || !out.trim()) return "결과 없음";
        return normalize(out) === normalize(s.output)
            ? "맞았습니다 !!!"
            : "틀렸습니다 ㅠ_ㅠ";
    };

    const judgeStyle = (j: string) =>
        j === "맞았습니다 !!!"
            ? "text-green-600 font-bold"
            : j === "틀렸습니다 ㅠ_ㅠ"
                ? "text-red-600 font-bold"
                : "text-gray-500 font-semibold";

    return (
        <div className="w-full h-full flex flex-col min-h-0">
            {samples.length === 0 ? (
                <div className="alert alert-info">예제가 아직 감지되지 않았어!</div>
            ) : (
                <>
                    <div className="alert alert-warning text-xl">
                        ⚠️ 테스트 결과는 참고용이에요! 실제 백준 채점과 다를 수 있어요 😊
                    </div>

                    <div className="flex-1 min-h-0 w-full rounded-box overflow-y-auto p-4 space-y-6">
                        {samples.map(s => {
                            const judge = getJudge(s);

                            return (
                                <>
                                    <div
                                        key={s.id}
                                        className="grid grid-cols-1 md:grid-cols-2 gap-4"
                                    >
                                        {/* 왼쪽: 예제 출력 */}
                                        <div className="flex flex-col min-h-0">
                                            <label className="label shrink-0">
                                            <span className="label-text font-bold text-lg text-gray-700">
                                                예제 {s.id}
                                            </span>
                                            </label>

                                            <pre className="grow overflow-auto rounded-box p-3 leading-6 font-mono">
                                            {s.output}
                                        </pre>
                                        </div>

                                        {/* 오른쪽: 실행 결과 */}
                                        <div className="flex flex-col min-h-0">
                                            <label className="label shrink-0 flex items-end">
                                            <span className={`${judgeStyle(judge)} text-lg`}>
                                                {judge}
                                            </span>
                                            </label>

                                            <pre className="grow overflow-auto rounded-box p-3 leading-6 font-mono">
                                            {results[s.id] ??
                                                "아직 실행 결과가 없어.\n코드를 실행하면 여기로 들어올 거야 😊"}
                                        </pre>
                                        </div>
                                    </div>
                                    <div className="divider"></div>
                                </>
                            );
                        })}
                    </div>
                </>
            )}
        </div>
    );
}
