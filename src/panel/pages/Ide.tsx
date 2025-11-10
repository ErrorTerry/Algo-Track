import IdeUI from "../components/ide/IdeUI.tsx";
import IdeHeader from "../components/ide/IdeHeader.tsx";
import IdePageTabs from "../components/sampleInputOutput/IdePageTabs.tsx";

export default function Ide() {
    return (
        <div className="h-[calc(100vh-100px)] grid grid-rows-2 gap-4 p-4 overflow-hidden">
            {/* 위쪽 IDE 영역 */}
            <div
                className="rounded-lg border border-base-300 grid overflow-hidden"
                style={{
                    gridTemplateRows: "12% 88%",
                }}
            >
                <div className="relative z-50 w-full min-w-0 flex flex-wrap items-center justify-end gap-2 sm:gap-3 px-4 py-2 border-b border-base-300 bg-base-200">
                    <IdeHeader />
                </div>
                <div className="min-h-0 rounded-b-lg overflow-hidden">
                    <IdeUI />
                </div>
            </div>

            {/* 아래쪽 예제 입출력 영역 */}
            <div className="rounded-lg border border-base-300 overflow-hidden">
                <IdePageTabs />
            </div>
        </div>
    );
}
