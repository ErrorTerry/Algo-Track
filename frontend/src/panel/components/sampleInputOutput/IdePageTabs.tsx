import { useState } from "react";
import InputOutputTabs from "./InputOutputTabs";
import TestResultTabs from "./TestResultTabs";

export default function IdePageTabs() {
    const [activeTab, setActiveTab] = useState<"io" | "test">("io");

    const base =
        "relative flex-1 h-10 md:h-11 flex items-center justify-center " +
        "text-[14px] md:text-[15px] font-medium transition-colors duration-150";

    // 안쪽 동그란 pill 스타일
    const pillBase = "px-10 py-1.5 transition-colors duration-150";
    const pillActive = "rounded-full bg-base-300/80 text-base-content";
    const pillInactive =
        "text-base-content/60 hover:text-base-content hover:bg-base-200/60 rounded-full";

    return (
        <div className="w-full h-full flex flex-col min-h-0 pb-3">
            {/* 상단 탭 바 */}
            <div className="shrink-0 border-b border-base-300/70 bg-base-100/95 pb-3">
                <div className="flex gap-2">
                    <button
                        type="button"
                        onClick={() => setActiveTab("io")}
                        className={base}
                    >
                        <span
                            className={
                                pillBase +
                                " " +
                                (activeTab === "io" ? pillActive : pillInactive)
                            }
                        >
                            예제 입출력
                        </span>
                    </button>

                    <button
                        type="button"
                        onClick={() => setActiveTab("test")}
                        className={base}
                    >
                        <span
                            className={
                                pillBase +
                                " " +
                                (activeTab === "test" ? pillActive : pillInactive)
                            }
                        >
                            테스트 결과
                        </span>
                    </button>
                </div>
            </div>

            {/* 아래 콘텐츠 영역 */}
            <div className="flex-1 min-h-0 w-full overflow-hidden">
                {activeTab === "io" ? <InputOutputTabs /> : <TestResultTabs />}
            </div>
        </div>
    );
}
