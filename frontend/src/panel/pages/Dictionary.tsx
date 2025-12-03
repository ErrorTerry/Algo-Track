import { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import api from "../../shared/api";

type AlgorithmCategoryApi = {
    algorithmId: number;
    algorithmName: string;
    definition: string;
};

type AlgorithmDictionaryApi = {
    algorithmDictionaryId: number;
    algorithmId: number;
    algorithmName: string;
    definition: string;
    example?: string;
};

type AlgoCard = {
    id: string;
    title: string;
    description: string;
    detail?: string;
};

type Category = {
    id: string;
    name: string;
    summary?: string;
    algorithms: AlgoCard[];
};

export default function Dictionary() {
    const { algoId } = useParams<{ algoId?: string }>();

    const [categories, setCategories] = useState<Category[]>([]);
    const [openCategoryId, setOpenCategoryId] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const cardRefs = useRef<Record<string, HTMLDivElement | null>>({});

    const toggleCategory = (id: string) =>
        setOpenCategoryId((prev) => (prev === id ? null : id));

    /** 1) 서버 데이터 불러오기 */
    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                setError(null);

                const [algRes, dictRes] = await Promise.all([
                    api.get<AlgorithmCategoryApi[]>("/api/algorithm"),
                    api.get<AlgorithmDictionaryApi[]>("/api/algorithm--dictionary"),
                ]);

                const algos = algRes.data;
                const dicts = dictRes.data;

                const mapped: Category[] = algos.map((alg) => ({
                    id: String(alg.algorithmId),
                    name: alg.algorithmName,
                    summary: alg.definition,
                    algorithms: dicts
                        .filter((d) => d.algorithmId === alg.algorithmId)
                        .map((d) => ({
                            id: String(d.algorithmDictionaryId),
                            title: d.algorithmName,
                            description: d.definition,
                            detail: d.example,
                        })),
                }));

                setCategories(mapped);
                setOpenCategoryId(mapped[0]?.id ?? null);
            } catch (e: any) {
                setError(e.message ?? "알고리즘 사전을 불러올 수 없어요.");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    /** 2) /dictionary/:id 접근 시 해당 카드로 스크롤 */
    useEffect(() => {
        if (!algoId || categories.length === 0) return;

        const foundCat = categories.find((cat) =>
            cat.algorithms.some((a) => a.id === algoId)
        );

        if (foundCat) {
            setOpenCategoryId(foundCat.id);

            setTimeout(() => {
                const el = cardRefs.current[algoId];
                if (el) {
                    el.scrollIntoView({ behavior: "smooth", block: "center" });
                }
            }, 120);
        }
    }, [algoId, categories]);

    /** 3) 로딩 UI */
    if (loading) {
        return (
            <div className="w-full h-full flex items-center justify-center">
                <span className="loading loading-spinner loading-lg"></span>
                <span className="ml-3 text-lg opacity-80">알고리즘 사전 불러오는 중...</span>
            </div>
        );
    }

    /** 4) 에러 UI */
    if (error) {
        return (
            <div className="w-full h-full flex items-center justify-center text-red-500">
                {error}
            </div>
        );
    }

    /** 5) 실제 화면 */
    return (
        <div className="w-full h-full flex flex-col min-h-0 p-5 md:p-6">

            <div className="flex-1 min-h-0 overflow-y-auto pr-1 space-y-4">

                {categories.map((cat) => {
                    const isOpen = openCategoryId === cat.id;

                    return (
                        <div
                            key={cat.id}
                            className={`
                                rounded-2xl border transition-colors duration-300
                                ${
                                isOpen
                                    ? "bg-blue-50/50 border-blue-100"
                                    : "bg-base-100 border-base-300 hover:bg-base-100/70"
                            }
                            `}
                        >
                            {/* 아코디언 헤더 */}
                            <button
                                type="button"
                                onClick={() => toggleCategory(cat.id)}
                                className="w-full flex items-center justify-between px-5 py-5 text-left"
                            >
                                <div className="flex-1">
                                    <div className="text-2xl md:text-3xl font-bold text-base-content/90">
                                        {cat.name}
                                    </div>

                                    {cat.summary && (
                                        <p className="text-base md:text-lg opacity-70 mt-1 leading-relaxed">
                                            {cat.summary}
                                        </p>
                                    )}
                                </div>

                                <span
                                    className={`ml-4 transition-transform duration-300 ${
                                        isOpen ? "rotate-90" : ""
                                    }`}
                                >
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        strokeWidth="2"
                                        stroke="currentColor"
                                        className="w-7 h-7 opacity-70"
                                    >
                                        <path d="M9 5l7 7-7 7" />
                                    </svg>
                                </span>
                            </button>

                            {/* 아코디언 내용 */}
                            {isOpen && (
                                <div className="px-5 pb-6 space-y-4">
                                    {cat.algorithms.map((algo) => {
                                        const selected = algoId === algo.id;

                                        return (
                                            <div
                                                key={algo.id}
                                                ref={(el: HTMLDivElement | null) => {
                                                    cardRefs.current[algo.id] = el ?? null;
                                                }}
                                                className={`
                                                    rounded-xl border bg-base-100/90 p-5 md:p-6
                                                    transition-colors duration-300
                                                    ${
                                                    selected
                                                        ? "border-primary/40 bg-primary/5"
                                                        : "border-base-300 hover:bg-base-100"
                                                }
                                                `}
                                            >
                                                <div className="text-xl md:text-2xl font-bold mb-2 text-base-content/90">
                                                    {algo.title}
                                                </div>

                                                <div className="text-lg md:text-xl opacity-90 leading-relaxed whitespace-pre-line mb-2">
                                                    {algo.description}
                                                </div>

                                                {algo.detail && (
                                                    <div className="text-base md:text-lg opacity-80 leading-relaxed whitespace-pre-line">
                                                        {algo.detail}
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}

                                    {cat.algorithms.length === 0 && (
                                        <div className="text-lg opacity-70">
                                            아직 이 카테고리에 등록된 알고리즘이 없어요.
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    );
                })}

            </div>
        </div>
    );
}
