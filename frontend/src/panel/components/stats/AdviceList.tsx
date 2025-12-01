import { CircleHelp, CircleCheck, TriangleAlert } from "lucide-react";

type AdviceType = "warn" | "info" | "success";

type AdviceItem = {
    type: AdviceType;
    text: string;
};

const STYLE_MAP: Record<AdviceType, string> = {
    warn: "bg-yellow-50 border-yellow-200",
    info: "bg-blue-50 border-blue-200",
    success: "bg-emerald-50 border-emerald-200",
};

const ICON_MAP: Record<AdviceType, React.ReactNode> = {
    info: <CircleHelp className="w-6 h-6 text-blue-500 stroke-[1.5]" />,
    success: <CircleCheck className="w-6 h-6 text-emerald-500 stroke-[1.5]" />,
    warn: <TriangleAlert className="w-6 h-6 text-yellow-500 stroke-[1.5]" />,
};

export default function AdviceList() {
    const items: AdviceItem[] = [
        {
            type: "warn",
            text: "DP는 이번 달 5/54 문제로 풀이 비중이 낮아요. 다음 주 목표에 DP 3문제를 추가해보는 건 어떨까요?",
        },
        {
            type: "info",
            text: "이번 탐색 문제 비중이 낮습니다. 추천 문제를 드릴까요?",
        },
        {
            type: "success",
            text: "그리디 알고리즘 학습이 잘 진행되고 있어요! 이 페이스를 유지해보세요.",
        },
    ];

    return (
        <div className="flex flex-col gap-4 mt-6">
            {items.map((ad, i) => (
                <div
                    key={i}
                    className={`
            flex items-center gap-3
            rounded-2xl border p-4 shadow-sm
            ${STYLE_MAP[ad.type]}
          `}
                    style={{
                        backdropFilter: "blur(12px)", // iOS 느낌
                    }}
                >
                    {/* 아이콘 조금 아래로 */}
                    <div className="">
                        {ICON_MAP[ad.type]}
                    </div>

                    {/* 텍스트는 살짝 위로 */}
                    <p className="text-xl font-medium text-gray-700 leading-normal translate-y-[5px]">
                        {ad.text}
                    </p>
                </div>
            ))}
        </div>
    );
}
