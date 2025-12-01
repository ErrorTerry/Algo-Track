// src/components/goal/GoalHeader.tsx
import { format, startOfWeek, endOfWeek } from "date-fns";
import { ko } from "date-fns/locale";

interface GoalHeaderProps {
    currentDate: Date;
    onPrev: () => void;
    onNext: () => void;
    onToday?: () => void;
    onOpenAdd?: () => void;
}

// 주간 날짜 범위 포맷
function formatWeekRange(date: Date) {
    const start = startOfWeek(date, { weekStartsOn: 1 });
    const end = endOfWeek(date, { weekStartsOn: 1 });

    const left = format(start, "yy년 MM월 dd일", { locale: ko });
    const right =
        start.getMonth() === end.getMonth()
            ? format(end, "MM월 dd일", { locale: ko })
            : format(end, "yy년 MM월 dd일", { locale: ko });

    return `${left} ~ ${right}`;
}

export default function GoalHeader({
                                       currentDate,
                                       onPrev,
                                       onNext,
                                       onToday,
                                       onOpenAdd,
                                   }: GoalHeaderProps) {
    const title = formatWeekRange(currentDate);

    return (
        <div className="flex items-center justify-between py-1 min-h-[80px] bg-base-200 px-4">
            {/* 왼쪽 공백 (레이아웃 균형용) */}
            <div className="flex-1" />

            {/* 가운데: 주간 범위 + 이동 버튼 */}
            <div className="flex items-center gap-3">
                <button
                    type="button"
                    className="btn btn-md h-12 min-h-12 normal-case px-3 btn-outline"
                    onClick={onPrev}
                >
                    ◀
                </button>

                <span className="font-bold text-base md:text-xl whitespace-nowrap">
                    {title}
                </span>

                <button
                    type="button"
                    className="btn btn-md h-12 min-h-12 normal-case px-3 btn-outline"
                    onClick={onNext}
                >
                    ▶
                </button>
            </div>

            {/* 오른쪽: 오늘 버튼 + 목표추가 버튼 */}
            <div className="flex-1 flex justify-end items-center gap-2">
                {onToday && (
                    <button
                        type="button"
                        className="btn btn-md h-12 min-h-12 normal-case px-4 btn-success text-white"
                        onClick={onToday}
                    >
                        오늘
                    </button>
                )}

                {onOpenAdd && (
                    <button
                        type="button"
                        className="btn btn-md h-12 min-h-12 normal-case px-4 btn-warning text-white"
                        onClick={onOpenAdd}
                    >
                        +
                    </button>
                )}
            </div>
        </div>
    );
}
