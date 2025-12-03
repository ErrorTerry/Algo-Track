type IdeHeaderProps = {
    language: string;
    onChangeLanguage: (lang: string) => void;
    onRun: () => void;
    loading: boolean;
};

export default function IdeHeader({
                                      language,
                                      onChangeLanguage,
                                      onRun,
                                      loading,
                                  }: IdeHeaderProps) {
    const disabled = loading || !language;

    return (
        <div className="flex items-center justify-end flex-wrap gap-3 max-w-full">

            {/* 언어 선택 */}
            <div className="flex items-center gap-2">
                <label className="text-[13px] text-base-content/70 hidden sm:inline-block">
                    언어
                </label>

                <select
                    value={language}
                    onChange={(e) => onChangeLanguage(e.target.value)}
                    className="
                                w-40 sm:w-48 md:w-56

                                /* 완전 수동 스타일로 DaisyUI 기본값 제거 */
                                bg-base-100
                                border border-base-300
                                rounded-lg

                                text-[14px]
                                leading-[1.2]
                                px-3 py-[9px]     /* 세로 여백을 직접 지정해서 잘림 해결 */

                                appearance-none   /* 브라우저 기본 화살표 제거 */
                                outline-none
                                shadow-none

                                /* 눌림/호버/active 다 제거 */
                                active:bg-base-100
                                active:shadow-none
                                focus:ring-0
                                focus:outline-none
                                hover:bg-base-100

                                transition-none
                            "
                >
                    <option value="">언어를 선택해 주세요</option>
                    <option value="python">Python</option>
                    <option value="java" disabled>Java (준비 중)</option>
                    <option value="c" disabled>C (준비 중)</option>
                </select>

            </div>

            {/* Run 버튼 */}
            <button
                type="button"
                onClick={onRun}
                disabled={disabled}
                className={`
                    btn bg-blue-500 text-white border-blue-500 shadow-sm
                    rounded-xl
                    h-10 md:h-11
                    px-4 md:px-5
                    gap-2
                    transition-all duration-150
                    ${
                    disabled
                        ? "btn-disabled opacity-70 cursor-not-allowed"
                        : "hover:brightness-110"
                }
                `}
            >
                {loading ? (
                    <>
                        <span className="loading loading-spinner loading-sm"/>
                        <span className="text-sm md:text-base">실행 중...</span>
                    </>
                ) : (
                    <>
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                            className="size-5 md:size-6"
                        >
                            <path
                                fillRule="evenodd"
                                d="M4.5 5.653c0-1.427 1.529-2.33 2.779-1.643l11.54 6.347c1.295.712 1.295 2.573 0 3.286L7.28 19.99c-1.25.687-2.779-.217-2.779-1.643V5.653Z"
                                clipRule="evenodd"
                            />
                        </svg>
                        <span className="text-sm md:text-base font-medium hidden sm:inline">
                            코드 실행
                        </span>
                        <span className="text-sm md:text-base font-medium sm:hidden">
                            Run
                        </span>
                    </>
                )}
            </button>
        </div>
    );
}
