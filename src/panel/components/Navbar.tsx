import {useEffect, useMemo, useRef, useState} from "react";

type SearchResult = { id: string; title: string; description?: string };
type NavbarProps = {
    onSearch?: (q: string) => Promise<SearchResult[]>;
};

export default function Navbar({ onSearch }: NavbarProps) {
    const [isSearching, setIsSearching] = useState(false);
    const [q, setQ] = useState("");
    const [results, setResults] = useState<SearchResult[]>([]);
    const [activeIndex, setActiveIndex] = useState(0); // ↑/↓ 하이라이트
    const [pinned, setPinned] = useState<SearchResult | null>(null); // 하단 고정 하나만
    const containerRef = useRef<HTMLDivElement | null>(null);
    const inputRef = useRef<HTMLInputElement | null>(null);

    const localDict = useMemo<SearchResult[]>(
        () => [
            { id: "queue", title: "큐 (Queue)", description: "FIFO 자료구조, 뒤에서 삽입·앞에서 삭제" },
            { id: "stack", title: "스택 (Stack)", description: "LIFO 자료구조, 한쪽 끝에서 삽입/삭제" },
            { id: "bfs", title: "BFS", description: "너비 우선 탐색, 큐 사용" },
            { id: "dfs", title: "DFS", description: "깊이 우선 탐색, 스택/재귀 사용" },
            { id: "heap", title: "힙 (Heap)", description: "우선순위 큐의 구현체" },
        ],
        []
    );

    // 검색(디바운스)
    useEffect(() => {
        if (!isSearching) return;
        const t = setTimeout(async () => {
            const lower = q.trim().toLowerCase();
            let r: SearchResult[] = [];
            if (onSearch) r = await onSearch(q);
            else r = lower ? localDict.filter(x =>
                x.title.toLowerCase().includes(lower) ||
                (x.description ?? "").toLowerCase().includes(lower)
            ) : [];
            setResults(r);
            setActiveIndex(0);
        }, 150);
        return () => clearTimeout(t);
    }, [q, isSearching, onSearch, localDict]);

    // 바깥 클릭 닫기
    useEffect(() => {
        if (!isSearching) return;
        const onDocClick = (e: MouseEvent) => {
            if (!containerRef.current) return;
            if (!containerRef.current.contains(e.target as Node)) {
                setIsSearching(false);
                setQ("");
                setResults([]);
            }
        };
        document.addEventListener("mousedown", onDocClick);
        return () => document.removeEventListener("mousedown", onDocClick);
    }, [isSearching]);

    // 포커스/ESC
    useEffect(() => {
        if (isSearching && inputRef.current) inputRef.current.focus();
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                setIsSearching(false);
                setQ(""); setResults([]);
            }
        };
        document.addEventListener("keydown", onKey);
        return () => document.removeEventListener("keydown", onKey);
    }, [isSearching]);

    const selectResult = (r: SearchResult) => {
        setPinned(r);                 // 한 개만 고정
        setIsSearching(false);
        setQ(""); setResults([]);
    };

    return (
        <div className="relative z-[10000]">
            {/* NAVBAR */}
            <div ref={containerRef} className="navbar bg-base-100 shadow-sm px-6 py-3">
                <div className="navbar-start" />
                <div className="navbar-center">
                    {isSearching ? (
                        <div className="relative w-[560px] max-w-[70vw]">
                            <div className="relative">
                                <input
                                    ref={inputRef}
                                    value={q}
                                    onChange={(e) => setQ(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (results.length === 0) return;
                                        if (e.key === "ArrowDown") {
                                            e.preventDefault();
                                            setActiveIndex(i => Math.min(i + 1, results.length - 1));
                                        } else if (e.key === "ArrowUp") {
                                            e.preventDefault();
                                            setActiveIndex(i => Math.max(i - 1, 0));
                                        } else if (e.key === "Enter") {
                                            e.preventDefault();
                                            selectResult(results[activeIndex]); // Enter로 고정
                                        }
                                    }}
                                    placeholder="검색어를 입력하세요 (↑/↓, Enter · ESC 닫기)"
                                    className="input input-bordered w-full text-[16px] md:text-[18px] pr-[84px] pl-[42px] h-[42px] rounded-[12px] focus:outline-none"
                                />
                                <span className="absolute left-[10px] top-1/2 -translate-y-1/2 pointer-events-none">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-[20px] w-[20px] opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </span>
                                <button onClick={() => setQ("")} className="absolute right-[44px] top-1/2 -translate-y-1/2 btn btn-ghost btn-xs rounded-full" aria-label="지우기">✕</button>
                                <button
                                    onClick={() => { setIsSearching(false); setQ(""); setResults([]); }}
                                    className="absolute right-[8px] top-1/2 -translate-y-1/2 btn btn-ghost btn-xs rounded-full"
                                    aria-label="닫기"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-[18px] w-[18px]" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M10.5 3a7.5 7.5 0 105.356 12.806l3.668 3.668a.75.75 0 101.06-1.06l-3.668-3.669A7.5 7.5 0 0010.5 3z" />
                                    </svg>
                                </button>
                            </div>

                            {/* 결과 패널 */}
                            {(q.trim().length > 0 || results.length > 0) && (
                                <div className="absolute left-0 right-0 mt-2 rounded-[12px] border border-base-300 bg-base-100 shadow-xl max-h-[280px] overflow-auto">
                                    {results.length === 0 ? (
                                        <div className="p-4 text-[14px] opacity-70">검색 결과가 없습니다.</div>
                                    ) : (
                                        <ul className="p-2">
                                            {results.map((r, idx) => (
                                                <li key={r.id}>
                                                    <button
                                                        className={`w-full text-left p-3 rounded-[10px] transition ${
                                                            idx === activeIndex ? "bg-base-200" : "hover:bg-base-200"
                                                        }`}
                                                        onMouseEnter={() => setActiveIndex(idx)}
                                                        onClick={() => selectResult(r)}
                                                    >
                                                        <div className="text-[16px] font-semibold">{r.title}</div>
                                                        {r.description && (
                                                            <div className="text-[13px] opacity-80 mt-1">{r.description}</div>
                                                        )}
                                                    </button>
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </div>
                            )}
                        </div>
                    ) : (
                        <ul className="menu menu-horizontal gap-4 text-[18px] md:text-[20px] font-semibold">
                            <li><a className="hover:bg-base-200 rounded-[10px] px-3 py-2">Item 1</a></li>
                            <li><a className="hover:bg-base-200 rounded-[10px] px-3 py-2">Item 2</a></li>
                            <li><a className="hover:bg-base-200 rounded-[10px] px-3 py-2">Item 3</a></li>
                            <li><a className="hover:bg-base-200 rounded-[10px] px-3 py-2">Item 4</a></li>
                        </ul>
                    )}
                </div>

                {/* 오른쪽: 검색 열기 버튼 */}
                <div className="navbar-end">
                    {!isSearching && (
                        <button
                            className="btn btn-ghost btn-circle hover:bg-gray-100"
                            aria-label="검색 열기"
                            onClick={() => setIsSearching(true)}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-[26px] w-[26px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </button>
                    )}
                </div>
            </div>

            {/* 하단 고정 카드(한 개만) */}
            {pinned && (
                <div className="px-6 mt-3">
                    <div className="rounded-[12px] border border-base-300 bg-base-100 shadow-lg p-4 relative">
                        <button
                            className="btn btn-ghost btn-xs rounded-full absolute right-2 top-2"
                            aria-label="고정 해제"
                            onClick={() => setPinned(null)}
                        >
                            ✕
                        </button>
                        <div className="text-[16px] font-bold mb-1">{pinned.title}</div>
                        {pinned.description && (
                            <div className="text-[14px] opacity-90">{pinned.description}</div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
