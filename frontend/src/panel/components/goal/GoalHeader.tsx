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

export default function GoalHeader({
                                       currentDate,
                                       onPrev,
                                       onNext,
                                       onToday,
                                       onOpenAdd,
                                   }: GoalHeaderProps) {
    const title = formatWeekRange(currentDate);

    return (
        <div className="flex items-center justify-between gap-4 py-3 px-4 bg-base-100 border-b border-base-300">

            {/* 왼쪽: 이제 아무것도 없음. 레이아웃은 유지 */}
            <div className="flex-1" />

            {/* 가운데 날짜 + 이동 버튼 */}
            <div className="flex items-center gap-3">
                <button
                    type="button"
                    className="btn btn-sm md:btn-md btn-ghost rounded-full min-h-0 h-10 md:h-12 px-3"
                    onClick={onPrev}
                >
                    ◀
                </button>

                <div
                    className="
                        px-4 py-2
                        rounded-2xl
                        bg-base-200
                        text-base md:text-xl
                        font-bold
                        text-base-content
                        whitespace-nowrap
                        shadow-inner
                    "
                >
                    {title}
                </div>

                <button
                    type="button"
                    className="btn btn-sm md:btn-md btn-ghost rounded-full min-h-0 h-10 md:h-12 px-3"
                    onClick={onNext}
                >
                    ▶
                </button>
            </div>

            {/* 오른쪽: 버튼 커진 버전 */}
            <div className="flex-1 flex justify-end items-center gap-3">
                {onToday && (
                    <button
                        type="button"
                        className="
                            btn
                            h-10 md:h-12 min-h-0
                            px-4 md:px-5
                            normal-case
                            border-blue-300 text-blue-500
                            bg-blue-50
                            hover:bg-blue-200/80
                            hover:text-blue-700
                            text-base md:text-lg
                            transition-all duration-150
                        "
                        onClick={onToday}
                    >
                        오늘
                    </button>
                )}

                {onOpenAdd && (
                    <button
                        type="button"
                        className="
                            btn
                            bg-blue-500 text-white border-blue-500 shadow-sm
                            rounded-xl
                            h-10 md:h-12 min-h-0
                            px-4 md:px-5
                            text-base md:text-lg
                            gap-2
                            normal-case
                            transition-all duration-150
                            hover:brightness-110
                        "
                        onClick={onOpenAdd}
                    >
                        +
                        <span className="hidden sm:inline">목표 추가</span>
                    </button>
                )}
            </div>
        </div>
    );
}
