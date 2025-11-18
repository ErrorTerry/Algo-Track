import { useState } from "react";
import InputOutputTabs from "./InputOutputTabs";
import TestResultTabs from "./TestResultTabs.tsx";

export default function IdePageTabs() {
    const [activeTab, setActiveTab] = useState("io"); // io = 예제입출력, test = 테스트결과

    return (
        <div className="w-full h-full flex flex-col min-h-0">
            {/* 상단 탭 버튼 */}
            <div className="flex space-x-5 shrink-0">
                <button
                    className={`btn btn-wide min-h-18 gap-4 text-[18px] md:text-[20px] font-semibold ${
                        activeTab === "io" ? "btn-success" : ""
                    }`}
                    onClick={() => setActiveTab("io")}
                >
                    예제 입출력
                </button>

                <button
                    className={`btn btn-wide min-h-18 gap-4 text-[18px] md:text-[20px] font-semibold ${
                        activeTab === "test" ? "btn-success" : ""
                    }`}
                    onClick={() => setActiveTab("test")}
                >
                    테스트 결과
                </button>
            </div>

            {/* 아래 영역 (탭 콘텐츠) */}
            <div className="flex-1 min-h-0 w-full overflow-hidden">
                {activeTab === "io" && <InputOutputTabs />}
                {activeTab === "test" && <TestResultTabs />}
            </div>
        </div>
    );
}
