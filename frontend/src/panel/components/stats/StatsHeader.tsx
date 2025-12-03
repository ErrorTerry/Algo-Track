import { format } from "date-fns";
import { ko } from "date-fns/locale";

interface StatsHeaderProps {
    currentDate: Date;
    onPrev: () => void;
    onNext: () => void;
    onToday?: () => void;
}

export default function StatsHeader({
                                        currentDate,
                                        onPrev,
                                        onNext,
                                        onToday,
                                    }: StatsHeaderProps) {
    const title = format(currentDate, "yyyy년 MM월", { locale: ko });

    return (
        <div className="flex items-center justify-between gap-4 py-3 px-4 bg-base-100 border-b border-base-300">

            {/* 왼쪽: 아무것도 없음 (레이아웃 유지용) */}
            <div className="flex-1" />

            {/* 가운데: 월 이동 + 날짜 */}
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

            {/* 오른쪽: 이번 달 버튼 */}
            <div className="flex-1 flex justify-end">
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
                        이번 달
                    </button>
                )}
            </div>
        </div>
    );
}
