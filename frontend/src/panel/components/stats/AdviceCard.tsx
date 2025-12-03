// 개선된 단일 조언 카드 UI
import { CircleHelp, CircleCheck, TriangleAlert } from "lucide-react";
import type { AdviceType } from "./makeAdviceItems";

const STYLE_MAP: Record<AdviceType, string> = {
    warn: "bg-yellow-50 border-yellow-300",
    info: "bg-blue-50 border-blue-300",
    success: "bg-emerald-50 border-emerald-300",
};

const ICON_MAP: Record<AdviceType, React.ReactNode> = {
    info: <CircleHelp className="w-6 h-6 text-blue-500 stroke-[1.5]" />,
    success: <CircleCheck className="w-6 h-6 text-emerald-500 stroke-[1.5]" />,
    warn: <TriangleAlert className="w-6 h-6 text-yellow-500 stroke-[1.5]" />,
};

type Props = {
    type: AdviceType;
    html: string;
};

export default function AdviceCard({ type, html }: Props) {
    return (
        <div
            className={`
                flex items-start gap-4 rounded-2xl border p-5 shadow-sm
                ${STYLE_MAP[type]}
            `}
        >
            {/* 아이콘 */}
            <div className="pt-[2px]">{ICON_MAP[type]}</div>

            {/* 텍스트 */}
            <p
                className="
                    text-[15px]
                    font-normal
                    text-gray-700
                    leading-normal
                    translate-y-[-2px]
                "
                dangerouslySetInnerHTML={{ __html: html }}
            />
        </div>
    );
}
