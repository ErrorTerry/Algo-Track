import {useState, useEffect, useRef} from "react";
import {useParams} from "react-router-dom";
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
    const {algoId} = useParams<{ algoId?: string }>();

    const [categories, setCategories] = useState<Category[]>([]);
    const [openCategoryId, setOpenCategoryId] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const cardRefs = useRef<Record<string, HTMLDivElement | null>>({});

    const toggleCategory = (id: string) => {
        setOpenCategoryId((current) => (current === id ? null : id));
    };

    // 1) 서버에서 데이터 불러오기
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
                console.error(e);
                setError(e.message ?? "알고리즘 사전 데이터를 불러오지 못했어.");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    // 2) /dictionary/:algoId 로 들어왔을 때 해당 카드로 스크롤
    useEffect(() => {
        if (!algoId || categories.length === 0) return;

        const foundCategory = categories.find((cat) =>
            cat.algorithms.some((a) => a.id === algoId)
        );

        if (foundCategory) {
            setOpenCategoryId(foundCategory.id);

            setTimeout(() => {
                const el = cardRefs.current[algoId];
                if (el) {
                    el.scrollIntoView({
                        behavior: "smooth",
                        block: "center",
                    });
                }
            }, 80);
        }
    }, [algoId, categories]);

    if (loading) {
        return (
            <div className="w-full h-full flex items-center justify-center">
                <span className="loading loading-spinner loading-lg"/>
                <span className="ml-3 text-lg">알고리즘 사전 불러오는 중...</span>
            </div>
        );
    }

    if (error) {
        return (
            <div className="w-full h-full flex items-center justify-center text-red-500">
                {error}
            </div>
        );
    }

    return (
        <div className="w-full h-full flex flex-col min-h-0 p-5 md:p-6">
            {/* 아코디언 리스트 */}
            <div className="flex-1 min-h-0 space-y-4 overflow-y-auto pr-2">
                {categories.map((cat) => {
                    const isOpen = openCategoryId === cat.id;

                    return (
                        <div
                            key={cat.id}
                            className={`rounded-[16px] transition-all duration-200 transform
                            ${isOpen
                                ? "bg-neutral-content scale-[1.01] shadow-md border border-base-200"
                                : "bg-base-100 shadow-sm border border-base-300"
                            }`}
                        >
                            {/* 아코디언 헤더 */}
                            <button
                                type="button"
                                className="w-full flex items-center justify-between px-4 md:px-5 py-4 md:py-5 text-left"
                                onClick={() => toggleCategory(cat.id)}
                            >
                                <div className="flex-1 text-left">
                                    <div className="text-2xl md:text-3xl font-bold">
                                        {cat.name}
                                    </div>
                                    {cat.summary && (
                                        <div className="text-base md:text-lg opacity-70 mt-1 leading-relaxed">
                                            {cat.summary}
                                        </div>
                                    )}
                                </div>

                                <span
                                    className={`ml-3 md:ml-4 flex-shrink-0 transition-transform duration-200 ${
                                        isOpen ? "rotate-90" : ""
                                    }`}
                                >
                  <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      className="w-6 h-6 md:w-7 md:h-7"
                  >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M9 5l7 7-7 7"
                    />
                  </svg>
                </span>
                            </button>

                            {/* 아코디언 내용 */}
                            {isOpen && (
                                <div className="px-4 md:px-5 pb-5 md:pb-6 space-y-4">
                                    {cat.algorithms.map((algo) => (
                                        <div
                                            key={algo.id}
                                            ref={(el) => {
                                                cardRefs.current[algo.id] = el;
                                            }}
                                            className={`rounded-[14px] border border-base-300 bg-base-100 shadow p-5 md:p-6 hover:shadow-md transition cursor-default
                        ${
                                                algoId === algo.id
                                                    ? "ring-2 ring-primary shadow-[0_0_12px_rgba(0,0,0,0.2)]"
                                                    : ""
                                            }
                      `}
                                        >
                                            <div className="text-xl md:text-2xl font-bold mb-2">
                                                {algo.title}
                                            </div>

                                            <div
                                                className="text-lg md:text-xl opacity-90 leading-relaxed mb-2 whitespace-pre-line">
                                                {algo.description}
                                            </div>

                                            {algo.detail && (
                                                <div
                                                    className="text-base md:text-lg opacity-80 leading-relaxed whitespace-pre-line">
                                                    {algo.detail}
                                                </div>
                                            )}
                                        </div>
                                    ))}

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
