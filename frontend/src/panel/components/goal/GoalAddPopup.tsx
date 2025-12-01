// src/components/goal/GoalAddPopup.tsx
import { useEffect, useMemo, useState } from "react";
import api from "../../../shared/api";
import { format, startOfWeek, endOfWeek } from "date-fns";
import { ko } from "date-fns/locale";

interface GoalAddPopupProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit?: (data: {
        termType: TermType;
        // 주간 목표: 알고리즘별 총 문제 수
        goals: { algorithmId: number; count: number }[];
        // 일간 분배: 알고리즘 / 요일 / 개수
        dailyPlans: {
            algorithmId: number;
            dayIndex: number; // 0 = 월, 6 = 일
            count: number;
        }[];
    }) => void;
    // 헤더에서 쓰는 currentDate랑 같은 값 내려주면 됨
    currentDate: Date;
}

type TermType = "WEEK" | "DAY";

type Algorithm = {
    algorithmId: number;
    algorithmName: string;
    definition: string;
};

type DayKey = "MON" | "TUE" | "WED" | "THU" | "FRI" | "SAT" | "SUN";

const DAY_KEYS: DayKey[] = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];
const DAY_LABELS: Record<DayKey, string> = {
    MON: "월",
    TUE: "화",
    WED: "수",
    THU: "목",
    FRI: "금",
    SAT: "토",
    SUN: "일",
};

type SelectedGoal = {
    id: number;
    algorithmId: number;
    algorithmName: string;
    // 주간 총 목표
    weeklyCount: number;
    // 일간 분배 (월~일, length = 7)
    dailyCounts: number[];
};

// GoalHeader의 WEEK 라벨과 동일한 형식
function formatWeekRangeLabel(date: Date) {
    const start = startOfWeek(date, { weekStartsOn: 1 }); // 월요일 시작
    const end = endOfWeek(date, { weekStartsOn: 1 });

    const left = format(start, "yy년 MM월 dd일", { locale: ko });

    const right =
        start.getMonth() === end.getMonth()
            ? format(end, "MM월 dd일", { locale: ko })
            : format(end, "yy년 MM월 dd일", { locale: ko });

    return `${left} ~ ${right}`; // 👉 25년 11월 24일 ~ 11월 30일
}

function createEvenDailyCounts(total: number): number[] {
    const days = DAY_KEYS.length;
    if (total <= 0) return Array(days).fill(0);

    const base = Math.floor(total / days);
    let remain = total % days;

    return Array(days)
        .fill(0)
        .map(() => {
            if (remain > 0) {
                remain -= 1;
                return base + 1;
            }
            return base;
        });
}

export default function GoalAddPopup({
                                         isOpen,
                                         onClose,
                                         onSubmit,
                                         currentDate,
                                     }: GoalAddPopupProps) {
    // 이 팝업은 주간 기준이라 WEEK 고정
    const [termType] = useState<TermType>("WEEK");

    // 알고리즘 목록
    const [algorithms, setAlgorithms] = useState<Algorithm[]>([]);
    const [algorithmSearch, setAlgorithmSearch] = useState("");
    const [selectedAlgorithmId, setSelectedAlgorithmId] = useState<number | null>(null);

    // 추가용 인풋 (주간 문제 수)
    const [weeklyCountInput, setWeeklyCountInput] = useState(3);

    // 사용자가 추가한 목표 리스트 (주간 + 일간)
    const [goals, setGoals] = useState<SelectedGoal[]>([]);

    // 일간 분배 방식
    const [distributionMode, setDistributionMode] = useState<"AUTO" | "MANUAL">("AUTO");

    // 팝업 열릴 때 알고리즘 목록 로딩
    useEffect(() => {
        if (!isOpen) return;

        (async () => {
            try {
                const res = await api.get<Algorithm[]>("/api/algorithm");
                const data = res.data ?? [];
                setAlgorithms(data);
                if (data.length) {
                    setSelectedAlgorithmId(data[0].algorithmId);
                }
            } catch (e) {
                console.error("알고리즘 목록 불러오기 실패", e);
            }
        })();
    }, [isOpen]);

    // 검색어로 필터링
    const filteredAlgorithms = useMemo(
        () =>
            algorithms.filter((a) =>
                a.algorithmName.toLowerCase().includes(algorithmSearch.toLowerCase())
            ),
        [algorithms, algorithmSearch]
    );

    // 주간 목표 리스트에 알고리즘 추가/수정
    const handleAddGoal = () => {
        if (!selectedAlgorithmId) return;
        if (weeklyCountInput <= 0) return;

        const algo = algorithms.find((a) => a.algorithmId === selectedAlgorithmId);
        if (!algo) return;

        setGoals((prev) => {
            const existed = prev.find((g) => g.algorithmId === selectedAlgorithmId);
            const newDaily = createEvenDailyCounts(weeklyCountInput);

            // 이미 있으면 업데이트
            if (existed) {
                return prev.map((g) =>
                    g.algorithmId === selectedAlgorithmId
                        ? {
                            ...g,
                            weeklyCount: weeklyCountInput,
                            dailyCounts: newDaily,
                        }
                        : g
                );
            }

            // 새로 추가
            return [
                ...prev,
                {
                    id: Date.now(),
                    algorithmId: algo.algorithmId,
                    algorithmName: algo.algorithmName,
                    weeklyCount: weeklyCountInput,
                    dailyCounts: newDaily,
                },
            ];
        });
    };

    const handleRemoveGoal = (id: number) => {
        setGoals((prev) => prev.filter((g) => g.id !== id));
    };

    const handleChangeWeeklyCount = (id: number, value: number) => {
        setGoals((prev) =>
            prev.map((g) => {
                if (g.id !== id) return g;
                const weeklyCount = Math.max(0, value);

                const dailyCounts =
                    distributionMode === "AUTO"
                        ? createEvenDailyCounts(weeklyCount)
                        : g.dailyCounts;

                return { ...g, weeklyCount, dailyCounts };
            })
        );
    };

    // 일간 목표 숫자 조절 (MANUAL 모드에서 사용)
    const handleChangeDailyCell = (
        goalId: number,
        dayIndex: number,
        newValue: number
    ) => {
        setGoals((prev) =>
            prev.map((g) => {
                if (g.id !== goalId) return g;

                const dailyCounts = [...g.dailyCounts];
                dailyCounts[dayIndex] = Math.max(0, newValue);

                const weeklyCount = dailyCounts.reduce((sum, v) => sum + v, 0);
                return { ...g, dailyCounts, weeklyCount };
            })
        );
    };

    // 자동 분배 모드일 때 전체 재분배
    const applyAutoDistribution = () => {
        setGoals((prev) =>
            prev.map((g) => ({
                ...g,
                dailyCounts: createEvenDailyCounts(g.weeklyCount),
            }))
        );
    };

    // 주간 총합
    const totalWeeklyCount = goals.reduce((sum, g) => sum + g.weeklyCount, 0);

    // 요일 합계
    const dayTotals = (() => {
        const arr = Array(DAY_KEYS.length).fill(0);
        goals.forEach((g) => {
            g.dailyCounts.forEach((v, idx) => {
                arr[idx] += v;
            });
        });
        return arr;
    })();

    const handleSubmit = () => {
        const validGoals = goals.filter((g) => g.weeklyCount > 0);
        if (!validGoals.length) return;

        const weeklyGoals = validGoals.map((g) => ({
            algorithmId: g.algorithmId,
            count: g.weeklyCount,
        }));

        const dailyPlans: { algorithmId: number; dayIndex: number; count: number }[] = [];
        validGoals.forEach((g) => {
            g.dailyCounts.forEach((count, dayIndex) => {
                if (count > 0) {
                    dailyPlans.push({
                        algorithmId: g.algorithmId,
                        dayIndex,
                        count,
                    });
                }
            });
        });

        onSubmit?.({
            termType,
            goals: weeklyGoals,
            dailyPlans,
        });
    };

    if (!isOpen) return null;

    const totalDailySum = dayTotals.reduce((s, v) => s + v, 0);
    const totalRemain = totalWeeklyCount - totalDailySum;
    const weekLabel = formatWeekRangeLabel(currentDate);

    return (
        <div className="fixed inset-0 z-[99999999] flex items-center justify-center bg-black/40">
            <div className="bg-base-100 rounded-2xl shadow-xl px-8 py-6 w-[960px] max-h-[90vh] overflow-y-auto relative">
                {/* 닫기 버튼 */}
                <button
                    type="button"
                    className="absolute right-4 top-4 text-xl text-gray-400 hover:text-gray-700"
                    onClick={onClose}
                >
                    ✕
                </button>

                {/* 제목 */}
                <div className="mb-6">
                    <h2 className="text-center text-2xl font-extrabold">
                        🌟 목표 설정 🌟
                    </h2>
                    <p className="mt-2 text-center text-md text-gray-500">
                        이번 주에 풀고 싶은 알고리즘별 문제 수를 정하고, 요일별로 나눠보세요 !
                    </p>
                </div>

                {/* ====================== 상단: 주간 목표 설정 ====================== */}
                <section className="mb-8">
                    <div className="flex items-center justify-between mb-3">
                        {/* 왼쪽: 타이틀 + 주간 범위 */}
                        <div className="flex items-baseline gap-2">
                            <h3 className="text-lg font-bold">📘 주간 목표 설정</h3>
                            <span className="text-md text-gray-500">{weekLabel}</span>
                        </div>

                        {/* 오른쪽: 총 문제 수 */}
                        <span className="text-xl text-gray-500">
                            총 {totalWeeklyCount}문제
                        </span>
                    </div>

                    {/* 알고리즘 검색 + 선택 + 추가 */}
                    <div className="flex items-end gap-4 mb-5">
                        <div className="flex-1 flex flex-col gap-2">
                            <input
                                type="text"
                                className="input input-sm w-full text-sm"
                                placeholder="알고리즘 이름 검색"
                                value={algorithmSearch}
                                onChange={(e) => setAlgorithmSearch(e.target.value)}
                            />
                            <select
                                className="select select-sm w-full text-sm"
                                value={selectedAlgorithmId ?? ""}
                                onChange={(e) =>
                                    setSelectedAlgorithmId(
                                        e.target.value ? Number(e.target.value) : null
                                    )
                                }
                            >
                                {filteredAlgorithms.length === 0 && (
                                    <option value="">검색 결과 없음</option>
                                )}
                                {filteredAlgorithms.map((algo) => (
                                    <option
                                        key={algo.algorithmId}
                                        value={algo.algorithmId}
                                    >
                                        {algo.algorithmName}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* 주간 목표 개수 입력 */}
                        <div className="flex items-center gap-2">
                            <input
                                type="number"
                                min={1}
                                className="input input-sm w-20 text-center"
                                value={weeklyCountInput}
                                onChange={(e) =>
                                    setWeeklyCountInput(
                                        Math.max(1, Number(e.target.value) || 1)
                                    )
                                }
                            />
                            <span className="text-sm whitespace-nowrap">문제</span>
                        </div>

                        <button
                            type="button"
                            className="btn btn-md h-12 min-h-12 normal-case px-4 btn-success text-white"
                            onClick={handleAddGoal}
                        >
                            추가
                        </button>
                    </div>

                    {/* 주간 목표 테이블 */}
                    <div className="border border-base-300 rounded-xl overflow-hidden">
                        <table className="table table-sm mb-0">
                            <thead className="bg-base-200">
                            <tr>
                                <th className="text-xl">알고리즘</th>
                                <th className="w-40 text-center text-xl">주간 목표 수</th>
                                <th className="w-12" />
                            </tr>
                            </thead>
                            <tbody>
                            {goals.map((g) => (
                                <tr key={g.id} className="align-middle">
                                    {/* 알고리즘 이름 칸 */}
                                    <td className="text-xl">
                                        <div className="h-10 flex items-center">
                                            {g.algorithmName}
                                        </div>
                                    </td>

                                    {/* 주간 목표 수 칸 */}
                                    <td>
                                        <div className="flex items-center justify-center gap-2">
                                            <input
                                                type="number"
                                                min={0}
                                                className="input input-sm w-20 text-center"
                                                value={g.weeklyCount}
                                                onChange={(e) =>
                                                    handleChangeWeeklyCount(
                                                        g.id,
                                                        Number(e.target.value) || 0
                                                    )
                                                }
                                            />
                                            <span className="text-xl text-gray-500">문제</span>
                                        </div>
                                    </td>

                                    {/* 삭제 버튼 칸 */}
                                    <td className="text-center">
                                        <button
                                            type="button"
                                            className="btn btn-ghost btn-md text-gray-400 hover:text-red-500"
                                            onClick={() => handleRemoveGoal(g.id)}
                                        >
                                            ✕
                                        </button>
                                    </td>
                                </tr>
                            ))}

                            {goals.length === 0 && (
                                <tr>
                                    <td
                                        colSpan={3}
                                        className="text-center text-lg text-gray-400 py-4"
                                    >
                                        아직 추가된 주간 목표가 없어요.
                                    </td>
                                </tr>
                            )}
                            </tbody>
                        </table>
                    </div>
                </section>

                {/* ====================== 하단: 일간 목표 설정 ====================== */}
                <section className="mb-8">
                    <div className="flex items-center justify-between mb-3">
                        {/* 왼쪽: 타이틀 + 설명 */}
                        <div className="flex flex-col">
                            <h3 className="text-lg font-bold">🗓 일간 목표 설정</h3>
                            <span className="text-md text-gray-500">
        각 알고리즘을 요일별로 몇 문제씩 풀지 나눠주세요.
      </span>
                        </div>

                        {/* 오른쪽: 분배 모드 스위치 (버튼 토글) */}
                        <div className="flex items-center gap-2 text-sm">
                            <button
                                type="button"
                                className={`btn btn-md h-12 min-h-12 normal-case px-4 ${
                                    distributionMode === "AUTO"
                                        ? "btn-success text-white"
                                        : "btn-ghost"
                                }`}
                                onClick={() => {
                                    setDistributionMode("AUTO");
                                    applyAutoDistribution();
                                }}
                            >
                                자동
                            </button>

                            <button
                                type="button"
                                className={`btn btn-md h-12 min-h-12 normal-case px-4 ${
                                    distributionMode === "MANUAL"
                                        ? "btn-success text-white"
                                        : "btn-ghost"
                                }`}
                                onClick={() => setDistributionMode("MANUAL")}
                            >
                                직접 입력
                            </button>
                        </div>
                    </div> {/* ✅ 여기 div 하나 더 닫아줘야 함!! */}

                    {/* 테이블 영역 */}
                    <div className="border border-base-300 rounded-xl overflow-x-auto">
                        <table className="table table-sm mb-0">
                            <thead className="bg-base-200">
                            <tr>
                                <th className="w-40 text-xl">
                                    <div className="h-10 flex items-center">알고리즘</div>
                                </th>
                                {DAY_KEYS.map((key) => (
                                    <th key={key} className="text-center">
                                        <div className="h-10 flex items-center justify-center text-xl">
                                            {DAY_LABELS[key]}
                                        </div>
                                    </th>
                                ))}
                                <th className="w-24 text-center text-xl">
                                    <div className="h-10 flex items-center justify-center">남은</div>
                                </th>
                            </tr>
                            </thead>

                            <tbody>
                            {goals.map((g) => {
                                const rowSum = g.dailyCounts.reduce((s, v) => s + v, 0);
                                const diff = g.weeklyCount - rowSum;

                                const diffClass =
                                    diff === 0
                                        ? "text-success"
                                        : diff > 0
                                            ? "text-warning"
                                            : "text-error";

                                return (
                                    <tr key={g.id} className="align-middle">
                                        <td className="text-xl">
                                            <div className="h-10 flex items-center">{g.algorithmName}</div>
                                        </td>

                                        {DAY_KEYS.map((_, dayIndex) => (
                                            <td key={dayIndex}>
                                                <div className="h-10 flex items-center justify-center">
                                                    <input
                                                        type="number"
                                                        min={0}
                                                        className="input input-sm w-18 text-center text-base leading-none"
                                                        value={g.dailyCounts[dayIndex]}
                                                        disabled={distributionMode === "AUTO"}
                                                        onChange={(e) =>
                                                            handleChangeDailyCell(
                                                                g.id,
                                                                dayIndex,
                                                                Number(e.target.value) || 0
                                                            )
                                                        }
                                                    />
                                                </div>
                                            </td>
                                        ))}

                                        <td className={`text-center font-semibold text-xl ${diffClass}`}>
                                            {diff}
                                        </td>
                                    </tr>
                                );
                            })}

                            {goals.length === 0 && (
                                <tr>
                                    <td
                                        colSpan={DAY_KEYS.length + 2}
                                        className="text-center text-lg text-gray-400 py-4"
                                    >
                                        목표가 없습니다.
                                    </td>
                                </tr>
                            )}
                            </tbody>

                            <tfoot className="bg-base-200">
                            <tr>
                                <th className="p-0">
                                    <div className="h-10 flex items-center text-xl">요일 합계</div>
                                </th>

                                {DAY_KEYS.map((_, idx) => (
                                    <th key={idx} className="p-0 text-center">
                                        <div className="h-10 flex items-center justify-center text-xl">
                                            {dayTotals[idx]}
                                        </div>
                                    </th>
                                ))}

                                <th className="p-0 text-center">
                                    <div
                                        className={`h-10 flex items-center justify-center text-xl ${
                                            totalRemain === 0
                                                ? "text-success"
                                                : totalRemain > 0
                                                    ? "text-warning"
                                                    : "text-error"
                                        }`}
                                    >
                                        {totalRemain}
                                    </div>
                                </th>
                            </tr>
                            </tfoot>
                        </table>
                    </div>
                </section>

                {/* 하단 버튼 */}
                <div className="flex justify-end gap-3 mt-6">
                    <button
                        type="button"
                        className="btn btn-md h-12 min-h-12 normal-case px-4 btn-ghost"
                        onClick={onClose}
                    >
                        취소
                    </button>
                    <button
                        type="button"
                        className="btn btn-md h-12 min-h-12 normal-case px-4 btn-success text-white"
                        onClick={handleSubmit}
                        disabled={goals.length === 0}
                    >
                        저장하기
                    </button>
                </div>
            </div>
        </div>
    );
}
