// src/components/goal/GoalAddPopup.tsx
import { useEffect, useMemo, useState } from "react";
import api from "../../../shared/api";
import { format, startOfWeek, endOfWeek } from "date-fns";
import { ko } from "date-fns/locale";

interface GoalAddPopupProps {
    isOpen: boolean;
    onClose: () => void;
    onSaved?: () => void;
    currentDate: Date;
}

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
    weeklyCount: number;
    dailyCounts: number[];
    /** 서버에서 이미 저장된 기존 주간 목표인지 여부 */
    isLocked?: boolean;
};

// GET /api/goal/weekly-summary 응답 형태
type WeeklySummaryResponse = {
    weekStartDate: string;
    algorithms: {
        algorithmId: number;
        algorithmName: string;
        weeklyCount: number;
        dailyPlan: number[];
    }[];
    dailySolved: number[];
};

function formatWeekRangeLabel(date: Date) {
    const start = startOfWeek(date, { weekStartsOn: 1 });
    const end = endOfWeek(date, { weekStartsOn: 1 });

    const sameYear = start.getFullYear() === end.getFullYear();
    const sameMonth = start.getMonth() === end.getMonth();

    if (sameYear) {
        const left = format(start, "yyyy년 MM월 dd일", { locale: ko });
        const right = sameMonth
            ? format(end, "dd일", { locale: ko })
            : format(end, "MM월 dd일", { locale: ko });
        return `${left} ~ ${right}`;
    }

    const left = format(start, "yyyy년 MM월 dd일", { locale: ko });
    const right = format(end, "yyyy년 MM월 dd일", { locale: ko });
    return `${left} ~ ${right}`;
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
                                         onSaved,
                                         currentDate,
                                     }: GoalAddPopupProps) {
    const [algorithms, setAlgorithms] = useState<Algorithm[]>([]);
    const [algorithmSearch, setAlgorithmSearch] = useState("");
    const [selectedAlgorithmId, setSelectedAlgorithmId] =
        useState<number | null>(null);

    const [weeklyCountInput, setWeeklyCountInput] = useState(3);
    const [goals, setGoals] = useState<SelectedGoal[]>([]);

    const [distributionMode, setDistributionMode] =
        useState<"AUTO" | "MANUAL">("AUTO");

    const [saving, setSaving] = useState(false);

    // 1) 알고리즘 목록 불러오기
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

    const filteredAlgorithms = useMemo(
        () =>
            algorithms.filter((a) =>
                a.algorithmName
                    .toLowerCase()
                    .includes(algorithmSearch.toLowerCase())
            ),
        [algorithms, algorithmSearch]
    );

    // 검색/리스트 변경 시 선택 알고리즘 보정
    useEffect(() => {
        if (!isOpen) return;

        if (filteredAlgorithms.length === 0) {
            setSelectedAlgorithmId(null);
            return;
        }

        const existsInFiltered = filteredAlgorithms.some(
            (a) => a.algorithmId === selectedAlgorithmId
        );

        if (!existsInFiltered) {
            setSelectedAlgorithmId(filteredAlgorithms[0].algorithmId);
        }
    }, [filteredAlgorithms, isOpen, selectedAlgorithmId]);

    // 2) 이번 주 기존 주간 목표 불러오기 (있는 경우 isLocked: true로 세팅)
    useEffect(() => {
        if (!isOpen) return;
        if (!algorithms.length) return;

        const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
        const weekStartDate = format(weekStart, "yyyy-MM-dd");

        (async () => {
            try {
                const res = await api.get<WeeklySummaryResponse>(
                    "/api/goal/weekly-summary",
                    {
                        params: { weekStartDate },
                    }
                );

                const serverAlgorithms = res.data?.algorithms ?? [];

                if (!serverAlgorithms.length) {
                    // 이번 주 목표가 아예 없음 → 완전 초기화
                    setGoals([]);
                    setWeeklyCountInput(3);
                    setAlgorithmSearch("");
                    setDistributionMode("AUTO");
                    return;
                }

                const existingGoals: SelectedGoal[] = serverAlgorithms.map(
                    (item, idx) => ({
                        id: idx + 1,
                        algorithmId: item.algorithmId,
                        algorithmName: item.algorithmName,
                        weeklyCount: item.weeklyCount,
                        dailyCounts: item.dailyPlan ?? Array(7).fill(0),
                        isLocked: true, // ✅ 기존 주간 목표
                    })
                );

                setGoals(existingGoals);
                setSelectedAlgorithmId(existingGoals[0]?.algorithmId ?? null);
            } catch (e: any) {
                console.error("이번 주 주간 목표 요약 불러오기 실패", e);
                // 에러 시에는 일단 새로 작성 모드로 둔다
                setGoals([]);
            }
        })();
    }, [isOpen, algorithms, currentDate]);

    const handleAddGoal = () => {
        if (!selectedAlgorithmId) return;
        if (weeklyCountInput <= 0) return;

        const algo = algorithms.find(
            (a) => a.algorithmId === selectedAlgorithmId
        );
        if (!algo) return;

        setGoals((prev) => {
            const newDaily = createEvenDailyCounts(weeklyCountInput);

            // 이미 "편집 가능한" 같은 알고리즘이 있다면 그 친구만 업데이트
            const existedEditable = prev.find(
                (g) =>
                    g.algorithmId === selectedAlgorithmId && !g.isLocked
            );

            if (existedEditable) {
                return prev.map((g) =>
                    g.id === existedEditable.id
                        ? {
                            ...g,
                            weeklyCount: weeklyCountInput,
                            dailyCounts: newDaily,
                        }
                        : g
                );
            }

            // 기존 서버 값(isLocked)은 그대로 두고,
            // 새로 추가하는 목표는 isLocked: false 로 별도 row 추가
            const newGoal: SelectedGoal = {
                id: Date.now(),
                algorithmId: algo.algorithmId,
                algorithmName: algo.algorithmName,
                weeklyCount: weeklyCountInput,
                dailyCounts: newDaily,
                isLocked: false,
            };

            return [...prev, newGoal];
        });
    };

    const handleRemoveGoal = (id: number) => {
        setGoals((prev) =>
            prev.filter((g) => g.id !== id || g.isLocked)
        ); // isLocked는 삭제 불가
    };

    const handleChangeWeeklyCount = (id: number, value: number) => {
        setGoals((prev) =>
            prev.map((g) => {
                if (g.id !== id) return g;
                if (g.isLocked) return g; // 기존 목표는 수정 불가

                const weeklyCount = Math.max(0, value);

                const dailyCounts =
                    distributionMode === "AUTO"
                        ? createEvenDailyCounts(weeklyCount)
                        : g.dailyCounts;

                return { ...g, weeklyCount, dailyCounts };
            })
        );
    };

    const handleChangeDailyCell = (
        goalId: number,
        dayIndex: number,
        newValue: number
    ) => {
        setGoals((prev) =>
            prev.map((g) => {
                if (g.id !== goalId) return g;
                if (g.isLocked) return g; // 기존 목표는 수정 불가

                const dailyCounts = [...g.dailyCounts];
                dailyCounts[dayIndex] = Math.max(0, newValue);

                const weeklyCount = dailyCounts.reduce((sum, v) => sum + v, 0);
                return { ...g, dailyCounts, weeklyCount };
            })
        );
    };

    const applyAutoDistribution = () => {
        setGoals((prev) =>
            prev.map((g) =>
                g.isLocked
                    ? g
                    : {
                        ...g,
                        dailyCounts: createEvenDailyCounts(g.weeklyCount),
                    }
            )
        );
    };

    const totalWeeklyCount = goals.reduce((sum, g) => sum + g.weeklyCount, 0);

    const dayTotals = (() => {
        const arr = Array(DAY_KEYS.length).fill(0);
        goals.forEach((g) => {
            g.dailyCounts.forEach((v, idx) => {
                arr[idx] += v;
            });
        });
        return arr;
    })();

    const handleSubmit = async () => {
        // ✅ 서버는 누적만 하니까, 새로 추가/수정한 것만 보낸다
        const validGoals = goals.filter(
            (g) => !g.isLocked && g.weeklyCount > 0
        );
        if (!validGoals.length) return;

        const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
        const weekStartDate = format(weekStart, "yyyy-MM-dd");

        const payload = {
            weekStartDate,
            algorithms: validGoals.map((g) => ({
                algorithmId: g.algorithmId,
                dailyPlan: [...g.dailyCounts],
            })),
        };

        try {
            setSaving(true);
            const res = await api.post("/api/goal/weekly", payload);
            console.log("주간 목표 저장 성공:", res.data);

            onSaved?.();
            // 닫고, 다시 열면 weekly-summary로 최신값을 다시 읽어올 거라 여기선 비우지 않아도 됨
            setWeeklyCountInput(3);
            setAlgorithmSearch("");
            onClose();
        } catch (e) {
            console.error("주간 목표 저장 실패", e);
            alert("주간 목표를 저장하는 데 실패했어요 ㅠㅠ");
        } finally {
            setSaving(false);
        }
    };

    if (!isOpen) return null;

    const totalDailySum = dayTotals.reduce((s, v) => s + v, 0);
    const totalRemain = totalWeeklyCount - totalDailySum;
    const weekLabel = formatWeekRangeLabel(currentDate);

    return (
        <div className="fixed inset-0 z-[99999999] flex items-center justify-center bg-black/40 backdrop-blur-[2px] px-4">
            {/* 전체 기본 폰트: 한 단계 업 (text-lg / md:text-xl) */}
            <div className="w-full max-w-6xl bg-base-100 rounded-3xl shadow-2xl border border-base-300/70 px-8 py-7 max-h-[90vh] overflow-y-auto relative text-lg md:text-xl">
                {/* 닫기 버튼 */}
                <button
                    type="button"
                    className="absolute right-4 top-4 text-2xl text-base-content/40 hover:text-base-content/70 transition"
                    onClick={onClose}
                >
                    ✕
                </button>

                {/* 제목 */}
                <div className="mb-6 text-center">
                    <h2 className="text-2xl md:text-3xl font-extrabold flex items-center justify-center gap-2">
                        🌟 <span>주간 목표 설정</span> 🌟
                    </h2>
                    <p className="mt-3 text-2xl md:text-2xl text-base-content/60">
                        이번 주에 풀고 싶은 알고리즘별 문제 수를 정하고, 요일별로 나눠보세요.
                    </p>
                </div>

                {/* ====================== 상단: 주간 목표 설정 ====================== */}
                <section className="mb-8">
                    <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
                        {/* 왼쪽: 타이틀 + 주간 범위 */}
                        <div className="flex flex-col gap-2">
                            <div className="flex items-center gap-3 flex-wrap">
                                <h3 className="text-xl md:text-2xl font-bold flex items-center gap-1">
                                    📘 <span>주간 목표</span>
                                </h3>
                                <span
                                    className="
                                        inline-flex items-center
                                        rounded-full border border-blue-100
                                        bg-blue-50 text-blue-600
                                        px-3 py-1.5
                                        text-sm md:text-base
                                        font-semibold
                                    "
                                >
                                    {weekLabel}
                                </span>
                            </div>
                            <span className="text-xl md:text-xl text-base-content/70 leading-snug">
                                원하는 알고리즘을 선택하고 이번 주 목표 개수를 설정하세요.
                            </span>
                        </div>

                        {/* 오른쪽: 총 문제 수 */}
                        <div
                            className="
                                inline-flex items-baseline
                                rounded-2xl bg-base-200/80
                                px-5 py-3
                                text-base md:text-lg
                                gap-2
                            "
                        >
                            <span className="text-base-content/70">총</span>
                            <span className="text-2xl md:text-3xl font-extrabold text-blue-600">
                                {totalWeeklyCount}
                            </span>
                            <span className="text-base-content/70">문제</span>
                        </div>
                    </div>

                    {/* 알고리즘 검색 + 선택 + 추가 */}
                    <div
                        className="
                            mb-6 p-5 rounded-2xl
                            bg-base-200/60
                            flex flex-col md:flex-row
                            gap-4 md:items-end
                        "
                    >
                        <div className="flex-1 flex flex-col gap-3">
                            <input
                                type="text"
                                className="input input-md w-full text-base md:text-lg"
                                placeholder="알고리즘 이름 검색"
                                value={algorithmSearch}
                                onChange={(e) =>
                                    setAlgorithmSearch(e.target.value)
                                }
                            />
                            <select
                                className="select select-md w-full text-base md:text-lg"
                                value={selectedAlgorithmId ?? ""}
                                onChange={(e) =>
                                    setSelectedAlgorithmId(
                                        e.target.value
                                            ? Number(e.target.value)
                                            : null
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
                        <div className="flex items-center gap-3">
                            <input
                                type="number"
                                min={1}
                                className="input input-md w-28 text-center text-base md:text-lg"
                                value={weeklyCountInput}
                                onChange={(e) =>
                                    setWeeklyCountInput(
                                        Math.max(
                                            1,
                                            Number(e.target.value) || 1
                                        )
                                    )
                                }
                            />
                            <span className="text-base md:text-lg whitespace-nowrap">
                                문제
                            </span>
                        </div>

                        {/* 추가 버튼 */}
                        <button
                            type="button"
                            className="
                                btn
                                bg-blue-500 text-white border-blue-500 shadow-sm
                                rounded-xl
                                h-11 min-h-0
                                px-6
                                normal-case
                                text-sm md:text-base
                                hover:brightness-110
                            "
                            onClick={handleAddGoal}
                        >
                            추가
                        </button>
                    </div>

                    {/* 주간 목표 테이블 */}
                    <div className="border border-base-300 rounded-2xl overflow-hidden">
                        <table className="table table-sm mb-0 w-full">
                            <thead className="bg-base-200">
                            <tr className="text-center">
                                <th className="text-base md:text-lg text-center">
                                    알고리즘
                                </th>
                                <th className="w-60 text-base md:text-lg text-center">
                                    주간 목표 수
                                </th>
                                <th className="w-12 text-center"></th>
                            </tr>
                            </thead>

                            <tbody>
                            {goals.map((g) => (
                                <tr
                                    key={g.id}
                                    className="align-middle text-base md:text-lg"
                                >
                                    <td>
                                        <div className="h-10 flex items-center">
                                            {g.algorithmName}
                                            {g.isLocked && (
                                                <span className="ml-2 text-md text-base-content/50">
                                                        (기존)
                                                    </span>
                                            )}
                                        </div>
                                    </td>

                                    <td>
                                        <div className="flex items-center justify-center gap-3">
                                            <input
                                                type="number"
                                                min={0}
                                                className="input input-sm w-24 text-center text-base md:text-lg"
                                                value={g.weeklyCount}
                                                disabled={g.isLocked}
                                                onChange={(e) =>
                                                    handleChangeWeeklyCount(
                                                        g.id,
                                                        Number(
                                                            e.target.value
                                                        ) || 0
                                                    )
                                                }
                                            />
                                            <span className="text-sm md:text-base text-base-content/60">
                                                    문제
                                                </span>
                                        </div>
                                    </td>

                                    <td className="text-center">
                                        {!g.isLocked && (
                                            <button
                                                type="button"
                                                className="btn btn-ghost btn-sm text-base-content/40 hover:text-red-500 text-lg"
                                                onClick={() =>
                                                    handleRemoveGoal(g.id)
                                                }
                                            >
                                                ✕
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}

                            {goals.length === 0 && (
                                <tr>
                                    <td
                                        colSpan={3}
                                        className="text-center text-base md:text-lg text-base-content/40 py-6"
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
                    <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
                        <div className="flex flex-col gap-2">
                            <h3 className="text-xl md:text-2xl font-bold">
                                🗓 일간 목표 설정
                            </h3>
                            <span className="text-xl md:text-xl text-base-content/70 leading-snug">
                                각 알고리즘을 요일별로 몇 문제씩 풀지 나눠주세요.
                            </span>
                        </div>

                        <div className="inline-flex items-center rounded-full bg-base-200/70 p-1 gap-1">
                            <button
                                type="button"
                                className={`
                                    px-5 py-2 text-md md:text-md rounded-full normal-case
                                    ${
                                    distributionMode === "AUTO"
                                        ? "bg-blue-500 text-white"
                                        : "bg-transparent text-base-content/70 hover:bg-base-100"
                                }
                                `}
                                onClick={() => {
                                    setDistributionMode("AUTO");
                                    applyAutoDistribution();
                                }}
                            >
                                자동
                            </button>

                            <button
                                type="button"
                                className={`
                                    px-5 py-2 text-md md:text-md rounded-full normal-case
                                    ${
                                    distributionMode === "MANUAL"
                                        ? "bg-blue-500 text-white"
                                        : "bg-transparent text-base-content/70 hover:bg-base-100"
                                }
                                `}
                                onClick={() =>
                                    setDistributionMode("MANUAL")
                                }
                            >
                                직접 입력
                            </button>
                        </div>
                    </div>

                    {/* 테이블 영역 */}
                    <div className="border border-base-300 rounded-2xl overflow-hidden">
                        <table className="table table-sm mb-0 w-full">
                            <thead className="bg-base-200">
                            <tr>
                                <th className="min-w-[220px] text-base md:text-lg">
                                    <div className="h-10 flex items-center justify-center">
                                        알고리즘
                                    </div>
                                </th>
                                {DAY_KEYS.map((key) => (
                                    <th
                                        key={key}
                                        className="text-sm md:text-base text-center"
                                    >
                                        <div className="h-10 flex items-center justify-center">
                                            {DAY_LABELS[key]}
                                        </div>
                                    </th>
                                ))}
                                <th className="w-24 text-center text-base md:text-lg">
                                    <div className="h-10 flex items-center justify-center">
                                        남은
                                    </div>
                                </th>
                            </tr>
                            </thead>

                            <tbody>
                            {goals.map((g) => {
                                const rowSum = g.dailyCounts.reduce(
                                    (s, v) => s + v,
                                    0
                                );
                                const diff = g.weeklyCount - rowSum;

                                const diffClass =
                                    diff === 0
                                        ? "text-success"
                                        : diff > 0
                                            ? "text-warning"
                                            : "text-error";

                                return (
                                    <tr
                                        key={g.id}
                                        className="align-middle text-base md:text-lg"
                                    >
                                        <td>
                                            <div className="h-10 flex items-center">
                                                {g.algorithmName}
                                                {g.isLocked && (
                                                    <span className="ml-2 text-md text-base-content/50">
                                                            (기존)
                                                        </span>
                                                )}
                                            </div>
                                        </td>

                                        {DAY_KEYS.map((_, dayIndex) => (
                                            <td key={dayIndex}>
                                                <div className="h-10 flex items-center justify-center">
                                                    <input
                                                        type="number"
                                                        min={0}
                                                        className="input input-sm w-16 text-center text-base md:text-lg leading-none"
                                                        value={
                                                            g.dailyCounts[
                                                                dayIndex
                                                                ]
                                                        }
                                                        disabled={
                                                            distributionMode ===
                                                            "AUTO" ||
                                                            g.isLocked
                                                        }
                                                        onChange={(e) =>
                                                            handleChangeDailyCell(
                                                                g.id,
                                                                dayIndex,
                                                                Number(
                                                                    e.target
                                                                        .value
                                                                ) || 0
                                                            )
                                                        }
                                                    />
                                                </div>
                                            </td>
                                        ))}

                                        <td
                                            className={`text-center font-semibold ${diffClass}`}
                                        >
                                            {diff}
                                        </td>
                                    </tr>
                                );
                            })}

                            {goals.length === 0 && (
                                <tr>
                                    <td
                                        colSpan={DAY_KEYS.length + 2}
                                        className="text-center text-base md:text-lg text-base-content/40 py-6"
                                    >
                                        목표가 없습니다.
                                    </td>
                                </tr>
                            )}
                            </tbody>

                            <tfoot className="bg-base-200">
                            <tr>
                                <th className="p-0 text-base md:text-lg">
                                    <div className="h-10 flex items-center justify-center">
                                        요일 합계
                                    </div>
                                </th>

                                {DAY_KEYS.map((_, idx) => (
                                    <th
                                        key={idx}
                                        className="p-0 text-center text-sm md:text-base"
                                    >
                                        <div className="h-10 flex items-center justify-center">
                                            {dayTotals[idx]}
                                        </div>
                                    </th>
                                ))}

                                <th className="p-0 text-center text-base md:text-lg">
                                    <div
                                        className={`h-10 flex items-center justify-center font-semibold ${
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
                <div className="flex justify-end gap-3 mt-8">
                    <button
                        type="button"
                        className="
                            btn
                            h-11 min-h-0
                            px-5
                            normal-case
                            border-base-300
                            bg-base-100
                            text-sm md:text-base text-base-content/80
                            hover:bg-base-200
                        "
                        onClick={onClose}
                        disabled={saving}
                    >
                        취소
                    </button>
                    <button
                        type="button"
                        className="
                            btn
                            bg-blue-500 text-white border-blue-500 shadow-sm
                            rounded-xl
                            h-11 min-h-0
                            px-6
                            normal-case
                            text-sm md:text-base
                            hover:brightness-110
                        "
                        onClick={handleSubmit}
                        disabled={
                            goals.filter((g) => !g.isLocked).length === 0 ||
                            saving
                        }
                    >
                        {saving ? "저장 중..." : "저장하기"}
                    </button>
                </div>
            </div>
        </div>
    );
}
