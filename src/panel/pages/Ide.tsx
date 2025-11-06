import IdeUI from "../components/ide/IdeUI.tsx";
import IdeHeader from "../components/ide/IdeHeader.tsx";

export default function Ide() {
    return (
        <div
            className="rounded-lg border border-base-300 m-4 grid"
            style={{
                height: "calc((100vh - 64px) / 2)", // nav바 제외 높이의 절반
                gridTemplateRows: "12% 88%", // 헤더:에디터 비율
            }}
        >
            {/* 헤더 */}
            <div className="relative z-50 w-full min-w-0 flex flex-wrap items-center justify-end gap-2 sm:gap-3 px-4 py-2 border-b border-base-300 bg-base-200">
                <IdeHeader />
            </div>

            {/* 에디터 */}
            <div className="min-h-0 rounded-b-lg overflow-hidden">
                <IdeUI />
            </div>
        </div>
    );
}
