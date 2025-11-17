import { useEffect, useState } from "react";

type Sample = { id: number; input: string; output: string };

type SamplePayload = {
    problemId?: string;
    problemTitle?: string;
    url: string;
    samples: { index: number; input: string; output: string }[];
    parsedAt: number;
};

type RunResultMap = Record<number, string>;

export default function TestResultTabs() {
    const [samples, setSamples] = useState<Sample[]>([]);
    const [results, setResults] = useState<RunResultMap>({});

    useEffect(() => {
        const applyPayload = (p?: SamplePayload) => {
            if (!p) return;
            const mapped = (p.samples ?? []).map((s) => ({
                id: s.index, // index를 그대로 id로 사용
                input: s.input,
                output: s.output,
            }));
            console.log("📥 BOJ_SAMPLES 수신:", mapped);
            setSamples(mapped);
        };

        const onDoc = (e: Event) =>
            applyPayload((e as CustomEvent<SamplePayload>).detail);
        document.addEventListener("boj:samples", onDoc as EventListener);

        const onMsg = (ev: MessageEvent) => {
            console.log("📨 window message:", ev.data);

            if (ev.origin !== window.location.origin) return;

            if (ev.data?.type === "BOJ_SAMPLES") {
                applyPayload(ev.data.payload);
            }

            // IDE 실행 결과 수신
            if (ev.data?.type === "BOJ_RUN_RESULT") {
                const { sampleId, output } = ev.data.payload ?? {};
                console.log("✅ BOJ_RUN_RESULT 수신:", sampleId, output);

                // sampleId가 "1" 같이 문자열일 수도 있으니 보정
                let id: number | null = null;
                if (typeof sampleId === "number") {
                    id = sampleId;
                } else if (
                    typeof sampleId === "string" &&
                    !Number.isNaN(Number(sampleId))
                ) {
                    id = Number(sampleId);
                }

                if (id !== null) {
                    setResults((prev) => ({
                        ...prev,
                        [id!]: output ?? "",
                    }));
                } else {
                    console.warn("⚠️ 잘못된 sampleId:", sampleId);
                }
            }
        };
        window.addEventListener("message", onMsg);

        // 예제 정보 요청
        window.postMessage({ type: "REQUEST_SAMPLES" }, window.location.origin);

        return () => {
            document.removeEventListener("boj:samples", onDoc as EventListener);
            window.removeEventListener("message", onMsg);
        };
    }, []);

    // 공백/개행 보정
    const normalize = (s: string) => {
        return s
            .replace(/\r\n/g, "\n")
            .split("\n")
            .map((line) => line.replace(/\s+$/g, "")) // 각 줄 끝 공백 제거
            .join("\n")
            .trimEnd();
    };

    const getJudge = (sample: Sample) => {
        const userOutput = results[sample.id];

        console.log("🔍 judge check:", {
            sampleId: sample.id,
            expected: sample.output,
            actual: userOutput,
            resultsMap: results,
        });

        if (userOutput == null || userOutput.trim() === "") return "결과 없음";

        const expected = normalize(sample.output ?? "");
        const actual = normalize(userOutput ?? "");

        return expected === actual ? "맞았습니다" : "틀렸습니다";
    };

    const judgeStyle = (judge: string) => {
        if (judge === "맞았습니다") return "text-green-600 font-bold";
        if (judge === "틀렸습니다") return "text-red-600 font-bold";
        return "text-gray-500 font-semibold";
    };

    return (
        <div className="w-full h-full flex flex-col min-h-0">
            {samples.length === 0 ? (
                <div className="alert alert-info">
                    <span>예제가 아직 감지되지 않았어!</span>
                </div>
            ) : (
                <div className="flex-1 min-h-0 w-full border border-base-300 rounded-box overflow-y-auto p-4 space-y-6">
                    {samples.map((s) => {
                        const judge = getJudge(s);

                        return (
                            <div
                                key={s.id}
                                className="grid grid-cols-1 md:grid-cols-2 gap-4"
                            >
                                {/* 왼쪽: 예제 출력 */}
                                <div className="flex flex-col min-h-0">
                                    <label className="label shrink-0 flex items-center justify-between">
                                        <span className="label-text font-bold">
                                            예제 {s.id}
                                        </span>
                                    </label>

                                    <pre className="grow min-h-0 m-0 whitespace-pre overflow-x-auto overflow-y-auto border border-base-300 rounded-box p-3 pb-6 leading-6 font-mono box-border">
                                        {s.output || "(비어있음)"}
                                    </pre>
                                </div>

                                {/* 오른쪽: IDE 실행 결과 + 판정 */}
                                <div className="flex flex-col min-h-0">
                                    <label className="label shrink-0 flex items-center justify-between">
                                        <span className="label-text font-bold">
                                            IDE 실행 결과 {s.id}
                                        </span>
                                        <span className={judgeStyle(judge)}>
                                            {judge}
                                        </span>
                                    </label>

                                    <pre className="grow min-h-0 m-0 whitespace-pre overflow-x-auto overflow-y-auto border border-base-300 rounded-box p-3 pb-6 leading-6 font-mono box-border">
                                        {results[s.id] ??
                                            '아직 실행 결과가 없어.\n코드를 실행하면 여기로 들어오게 연결돼 😊'}
                                    </pre>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
