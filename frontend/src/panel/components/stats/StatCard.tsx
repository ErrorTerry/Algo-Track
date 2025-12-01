import React from "react";

export type StatCardProps = {
    icon: React.ReactNode;
    title: string;
    value: string | number;
    sub?: string;
};

export default function StatCard({
                                     icon,
                                     title,
                                     value,
                                     sub,
                                 }: StatCardProps) {
    return (
        <div
            className="
        relative overflow-hidden
        rounded-2xl border border-base-200 bg-base-100/80
        p-5
        shadow-sm
        transition
      "
        >
            {/* 제목 + 아이콘 */}
            <div className="flex items-center gap-3">
                <div
                    className="
            flex h-10 w-10 items-center justify-center
            rounded-xl bg-base-200/80
            shadow-sm
          "
                >
                    {/* 아이콘도 baseline 보정용으로 살짝 올리기 */}
                    <div className="translate-y-[1px]">
                        {icon}
                    </div>
                </div>

                {/* 여기! 제목 살짝 아래로 내리기 */}
                <p className="text-xl font-semibold text-base-content/80 leading-none translate-y-[5px]">
                    {title}
                </p>
            </div>

            {/* 메인 값 */}
            <div className="mt-3 flex items-baseline gap-2">
        <span className="text-3xl font-bold text-base-content">
          {value}
        </span>
            </div>

            {/* 서브 텍스트 */}
            {sub && (
                <p className="pt-2 text-md text-base-content/60 leading-relaxed">
                    {sub}
                </p>
            )}
        </div>
    );
}
