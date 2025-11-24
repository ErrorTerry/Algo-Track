import {useEffect, useRef, useState} from "react";
import {Link, useLocation, useNavigate} from "react-router-dom";
import api from "../../shared/api";

type SearchResult = {
    id: string;
    title: string;
    description?: string;
};

const extChrome = (globalThis as any).chrome;

export default function Navbar() {
    // ============================
    // 0) 로그인 유저 정보
    // ============================
    const [nickname, setNickname] = useState<string | null>(null);

    useEffect(() => {
        if (extChrome?.storage?.local) {
            extChrome.storage.local.get(["nickname"], (res: any) => {
                setNickname(res.nickname ?? null);
            });

            const listener = (changes: any, areaName: string) => {
                if (areaName !== "local") return;
                if (changes.nickname) {
                    setNickname(changes.nickname.newValue ?? null);
                }
            };

            extChrome.storage.onChanged.addListener(listener);
            return () => extChrome.storage.onChanged.removeListener(listener);
        } else {
            const nick = localStorage.getItem("nickname");
            setNickname(nick);
        }
    }, []);

    const handleLogout = () => {
        if (extChrome?.storage?.local) {
            extChrome.storage.local.remove(
                ["accessToken", "nickname", "profileImageUrl"],
                () => {
                    console.log("[AlgoTrack] logged out");
                }
            );
        }
        localStorage.removeItem("accessToken");
        localStorage.removeItem("nickname");
        localStorage.removeItem("profileImageUrl");
    };

    // ============================
    // 1) 검색/네비 상태
    // ============================
    const [isSearching, setIsSearching] = useState(false);
    const [q, setQ] = useState("");
    const [results, setResults] = useState<SearchResult[]>([]);
    const [activeIndex, setActiveIndex] = useState(0);

    const [searchDict, setSearchDict] = useState<SearchResult[]>([]);
    const [loadingDict, setLoadingDict] = useState(true);

    const containerRef = useRef<HTMLDivElement | null>(null);
    const inputRef = useRef<HTMLInputElement | null>(null);
    const navigate = useNavigate();
    const location = useLocation();

    // 🔹 검색 모드일 때 페이지 스크롤 막기
    const bodyOverflowRef = useRef<string>("");

    useEffect(() => {
        const body = document.body;
        if (!bodyOverflowRef.current) {
            bodyOverflowRef.current = body.style.overflow || "";
        }

        if (isSearching) {
            body.style.overflow = "hidden"; // 위아래/양옆 스크롤 모두 제거
        } else {
            body.style.overflow = bodyOverflowRef.current;
        }

        return () => {
            body.style.overflow = bodyOverflowRef.current;
        };
    }, [isSearching]);

    // 1) 서버 API 로 검색 데이터 로딩
    useEffect(() => {
        const fetchData = async () => {
            try {
                const dictRes = await api.get("/api/algorithm--dictionary");
                const mapped = dictRes.data.map((d: any) => ({
                    id: String(d.algorithmDictionaryId),
                    title: d.algorithmName,
                    description: d.definition,
                }));
                setSearchDict(mapped);
            } catch (e) {
                console.error(e);
            } finally {
                setLoadingDict(false);
            }
        };
        fetchData();
    }, []);

    // 2) 검색 디바운스
    useEffect(() => {
        if (!isSearching) return;

        const t = setTimeout(() => {
            const lower = q.trim().toLowerCase();
            if (!lower) {
                setResults([]);
            } else {
                const r = searchDict.filter(
                    (x) =>
                        x.title.toLowerCase().includes(lower) ||
                        (x.description ?? "").toLowerCase().includes(lower)
                );
                setResults(r);
            }
            setActiveIndex(0);
        }, 150);

        return () => clearTimeout(t);
    }, [q, isSearching, searchDict]);

    // 외부 클릭 → 검색 닫기
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

    // ESC 처리
    useEffect(() => {
        if (isSearching && inputRef.current) inputRef.current.focus();

        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                setIsSearching(false);
                setQ("");
                setResults([]);
            }
        };

        document.addEventListener("keydown", onKey);
        return () => document.removeEventListener("keydown", onKey);
    }, [isSearching]);

    // 메뉴 active 표시
    const linkClass = (path: string) =>
        `hover:bg-base-200 rounded-[10px] px-3 py-2 transition ${
            location.pathname === path ? "bg-base-300 font-bold" : ""
        }`;

    const selectAndNavigate = (r: SearchResult) => {
        setIsSearching(false);
        setQ("");
        setResults([]);
        navigate(`/dictionary/${r.id}`);
    };

    return (
        <div className="relative z-[10000]">
            <div ref={containerRef} className="navbar bg-base-100 shadow-sm px-6 py-3">
                {/* 왼쪽: 프로필 드롭다운 */}
                <div className="navbar-start gap-4">
                    <div className="dropdown">
                        <button
                            type="button"
                            tabIndex={0}
                            className="
                                flex items-center justify-center
                                w-[56px] h-[56px]
                                bg-transparent
                                border-none
                                outline-none
                                cursor-pointer
                                hover:bg-transparent
                                active:bg-transparent
                                focus:bg-transparent
                                focus:outline-none
                                shadow-none
                            "
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                strokeWidth={2}
                                stroke="currentColor"
                                className="w-[30px] h-[30px]"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z"
                                />
                            </svg>
                        </button>

                        <ul
                            className="
                                mt-3 z-[100000]
                                py-2 px-1
                                dropdown-content bg-base-100
                                w-[200px] text-[15px]
                                border border-base-300
                                rounded-none
                            "
                        >
                            <li className="opacity-70 select-none cursor-default py-2">
                                {nickname ? `${nickname}님` : "로그인됨"}
                            </li>
                            <li
                                className="
                                    cursor-pointer
                                    hover:bg-base-200
                                    px-2 py-1
                                    rounded-none
                                "
                                onClick={handleLogout}
                            >
                                <span className="font-semibold">로그아웃</span>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* 가운데: 검색/메뉴 */}
                <div className={`navbar-center ${isSearching ? "w-full justify-center" : ""}`}>
                    {isSearching ? (
                        // 검색 UI
                        <div className="relative w-full max-w-[480px]">
                            <div className="relative">
                                <input
                                    ref={inputRef}
                                    value={q}
                                    onChange={(e) => setQ(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === "ArrowDown") {
                                            e.preventDefault();
                                            setActiveIndex((i) =>
                                                Math.min(i + 1, results.length - 1)
                                            );
                                        } else if (e.key === "ArrowUp") {
                                            e.preventDefault();
                                            setActiveIndex((i) => Math.max(i - 1, 0));
                                        } else if (e.key === "Enter" && results[activeIndex]) {
                                            e.preventDefault();
                                            selectAndNavigate(results[activeIndex]);
                                        }
                                    }}
                                    placeholder={
                                        loadingDict
                                            ? "사전 불러오는 중..."
                                            : "검색어 입력 (↑/↓, Enter · ESC)"
                                    }
                                    className="input input-bordered w-full text-[16px] md:text-[18px] px-4 h-[42px] rounded-[12px] focus:outline-none"
                                />
                            </div>

                            {(q.trim() || results.length > 0) && (
                                <div
                                    className="
                                        absolute left-0 right-0 top-[46px] z-[99999]
                                        border border-base-300 bg-base-100 shadow-xl
                                        max-h-[220px]
                                        overflow-y-auto overflow-x-hidden
                                        rounded-[12px]
                                    "
                                >
                                    {results.length === 0 ? (
                                        <div className="p-4 text-[14px] opacity-70">
                                            검색 결과가 없습니다.
                                        </div>
                                    ) : (
                                        <ul className="p-2">
                                            {results.map((r, idx) => (
                                                <li key={r.id}>
                                                    <button
                                                        className={`w-full text-left p-3 rounded-[10px] transition ${
                                                            idx === activeIndex
                                                                ? "bg-base-200"
                                                                : "hover:bg-base-200"
                                                        }`}
                                                        onMouseEnter={() => setActiveIndex(idx)}
                                                        onClick={() => selectAndNavigate(r)}
                                                    >
                                                        <div className="text-[16px] font-semibold">
                                                            {r.title}
                                                        </div>
                                                        {r.description && (
                                                            <div className="text-[13px] opacity-80 mt-1">
                                                                {r.description}
                                                            </div>
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
                            <li>
                                <Link to="/ide" className={linkClass("/ide")}>
                                    IDE
                                </Link>
                            </li>
                            <li>
                                <Link to="/dictionary" className={linkClass("/dictionary")}>
                                    사전
                                </Link>
                            </li>
                            <li>
                                <Link to="/goal" className={linkClass("/goal")}>
                                    목표
                                </Link>
                            </li>
                            <li>
                                <Link to="/stats" className={linkClass("/stats")}>
                                    학습관리
                                </Link>
                            </li>
                        </ul>
                    )}
                </div>

                {/* 오른쪽: 검색 버튼 */}
                <div className="navbar-end gap-2">
                    {!isSearching && (
                        <button
                            type="button"
                            tabIndex={0}
                            onClick={() => setIsSearching(true)}
                            className="
                                flex items-center justify-center
                                w-[56px] h-[56px]
                                bg-transparent
                                border-none
                                outline-none
                                cursor-pointer
                                hover:bg-transparent
                                active:bg-transparent
                                focus:bg-transparent
                                focus:outline-none
                                shadow-none
                            "
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                strokeWidth={2}
                                stroke="currentColor"
                                className="w-[30px] h-[30px]"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                                />
                            </svg>
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
