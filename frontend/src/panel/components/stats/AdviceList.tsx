import { Lightbulb } from "lucide-react";
import AdviceCard from "./AdviceCard";
import { makeAdviceItems } from "./makeAdviceItems";
import type { MonthlySummaryResponse } from "../../../types/statistics";

type Props = {
    advice?: MonthlySummaryResponse["advice"];
};

export default function AdviceList({ advice }: Props) {
    const items = advice ? makeAdviceItems(advice) : [];

    return (
        <div className="rounded-2xl border border-base-200 bg-base-100/90 p-5 shadow-sm space-y-4">
            {/* 헤더 */}
            <div className="flex items-center gap-3 mb-5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-base-200/80">
                    <Lightbulb className="w-5 h-5 text-amber-500" />
                </div>

                <p className="text-2xl font-semibold text-base-content">알고리즘 조언</p>
                <p className="text-xl text-base-content/60">최근 풀이 패턴 기반 분석</p>
            </div>

            {/* 카드 리스트 */}
            <div className="flex flex-col gap-4">
                {items.map((ad, i) => (
                    <AdviceCard key={i} type={ad.type} html={ad.html} />
                ))}

                {items.length === 0 && (
                    <p className="text-base-content/60 text-lg">조언 데이터가 부족해요.</p>
                )}
            </div>
        </div>
    );
}
