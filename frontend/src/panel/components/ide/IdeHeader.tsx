// src/components/ide/IdeHeader.tsx
type IdeHeaderProps = {
    language: string;                      // "python" 같은 값
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
    return (
        <div className="flex items-center flex-wrap gap-2 sm:gap-3 max-w-full">
            {/* 언어 선택 */}
            <select
                value={language}
                onChange={(e) => onChangeLanguage(e.target.value)}
                className="select select-neutral w-36 sm:w-44 md:w-52"
            >
                <option value="">Pick a language</option>
                <option value="python">Python</option>
                {/* 나중에 piston에 맞춰서 추가 */}
                <option value="java" disabled>
                    Java (준비 중)
                </option>
                <option value="c" disabled>
                    C (준비 중)
                </option>
            </select>

            {/* Run 버튼 — hover 시 success 색으로 전환 */}
            <button
                type="button"
                onClick={onRun}
                disabled={loading || !language}
                className={`
          btn btn-neutral btn-sm md:btn-md
          hover:btn-success transition-colors duration-200
          ${loading || !language ? "btn-disabled opacity-70" : ""}
        `}
            >
                {loading ? (
                    <span className="loading loading-spinner loading-sm" />
                ) : (
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
                )}
            </button>
        </div>
    );
}
