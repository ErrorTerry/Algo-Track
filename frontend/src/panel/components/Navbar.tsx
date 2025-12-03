import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import api from "../../shared/api";

type SearchResult = {
    id: string;
    title: string;
    description?: string;
};

const extChrome = (globalThis as any).chrome;

export default function Navbar() {
    /* ===========================
       0) 로그인 유저 정보
    ============================ */
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
                () => {}
            );
        }
        localStorage.removeItem("accessToken");
        localStorage.removeItem("nickname");
        localStorage.removeItem("profileImageUrl");
    };

    /* ===========================
       1) 검색 상태
    ============================ */
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

    /* ===========================
       프로필 드롭다운 상태 (hover → click)
    ============================ */
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const profileRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        const onClickOutside = (e: MouseEvent) => {
            if (!profileRef.current) return;
            if (!profileRef.current.contains(e.target as Node)) {
                setIsProfileOpen(false);
            }
        };
        document.addEventListener("mousedown", onClickOutside);
        return () => document.removeEventListener("mousedown", onClickOutside);
    }, []);

    /* ===========================
       검색 열릴 때 body 스크롤 막기
    ============================ */
    const bodyOverflowRef = useRef<string>("");

    useEffect(() => {
        const body = document.body;
        if (!bodyOverflowRef.current) {
            bodyOverflowRef.current = body.style.overflow || "";
        }

        if (isSearching) body.style.overflow = "hidden";
        else body.style.overflow = bodyOverflowRef.current;

        return () => {
            body.style.overflow = bodyOverflowRef.current;
        };
    }, [isSearching]);

    /* ===========================
       사전 데이터 로딩
    ============================ */
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

    /* ===========================
       검색 디바운스
    ============================ */
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

    /* ===========================
       외부 클릭 → 검색창 닫기
    ============================ */
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

    /* ===========================
       ESC 눌렀을 때 닫기 + 포커스
    ============================ */
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

    /* ===========================
       메뉴 Active 스타일
       👉 네잎클로버 느낌 초록
    ============================ */
    const linkClass = (path: string) =>
        `px-4 py-2 rounded-xl transition-all
        ${
            location.pathname === path
                ? "bg-blue-100 text-blue-600 font-bold"
                : "hover:bg-base-200/60"
        }`;

    const selectAndNavigate = (r: SearchResult) => {
        setIsSearching(false);
        setQ("");
        setResults([]);
        navigate(`/dictionary/${r.id}`);
    };

    /* ===========================
       실제 Navbar UI
    ============================ */
    return (
        <div className="relative z-[10000]">
            <div
                ref={containerRef}
                className="
                    navbar backdrop-blur-lg bg-base-100/70
                    border-b border-base-300/40 shadow-sm
                    px-6 py-3
                "
            >
                {/* 왼쪽: 프로필 */}
                <div className="navbar-start gap-4">
                    <div
                        ref={profileRef}
                        className={`dropdown dropdown-start ${
                            isProfileOpen ? "dropdown-open" : ""
                        }`}
                    >
                        <button
                            tabIndex={0}
                            type="button"
                            onClick={() =>
                                setIsProfileOpen((prev) => !prev)
                            }
                            className="
                                flex items-center justify-center
                                w-[46px] h-[46px]
                                rounded-full bg-base-200/70
                                hover:bg-base-300/70
                                transition
                            "
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                stroke="currentColor"
                                strokeWidth="2"
                                fill="none"
                                viewBox="0 0 24 24"
                                className="w-[26px] h-[26px] opacity-80"
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
                                dropdown-content
                                bg-base-100/95 backdrop-blur-xl
                                border border-base-300 rounded-2xl shadow-md
                                w-[220px] p-2 z-[120000]
                                mt-2
                            "
                        >
                            <li className="opacity-70 px-3 py-2">
                                {nickname ? `${nickname}님` : "로그인됨"}
                            </li>
                            <li>
                                <button
                                    onClick={handleLogout}
                                    className="
                                        w-full text-left px-3 py-2
                                        rounded-xl
                                        hover:bg-base-200
                                        font-semibold
                                    "
                                >
                                    로그아웃
                                </button>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* 가운데 메뉴 또는 검색창 */}
                <div className={`navbar-center ${isSearching ? "w-full" : ""}`}>
                    {isSearching ? (
                        /* 검색 모드: 가운데 정렬 */
                        <div className="relative w-full max-w-[480px] mx-auto">
                            <input
                                ref={inputRef}
                                value={q}
                                onChange={(e) => setQ(e.target.value)}
                                placeholder={
                                    loadingDict
                                        ? "사전 불러오는 중..."
                                        : "검색어 입력 (↑/↓, Enter · ESC)"
                                }
                                className="
                                    w-full input input-bordered h-[46px]
                                    text-[16px] md:text-[17px]
                                    rounded-2xl px-4
                                    focus:outline-none shadow-sm
                                "
                                onKeyDown={(e) => {
                                    if (e.key === "ArrowDown") {
                                        e.preventDefault();
                                        setActiveIndex((i) =>
                                            Math.min(
                                                i + 1,
                                                results.length - 1
                                            )
                                        );
                                    } else if (e.key === "ArrowUp") {
                                        e.preventDefault();
                                        setActiveIndex((i) =>
                                            Math.max(i - 1, 0)
                                        );
                                    } else if (
                                        e.key === "Enter" &&
                                        results[activeIndex]
                                    ) {
                                        e.preventDefault();
                                        selectAndNavigate(
                                            results[activeIndex]
                                        );
                                    }
                                }}
                            />

                            {/* 결과 드롭다운 */}
                            {(q.trim() || results.length > 0) && (
                                <div
                                    className="
                                        absolute left-0 right-0 top-[50px]
                                        bg-base-100/95 backdrop-blur-xl
                                        border border-base-300
                                        shadow-xl rounded-2xl
                                        max-h-[240px] overflow-y-auto
                                        p-2 z-[99999]
                                    "
                                >
                                    {results.length === 0 ? (
                                        <div className="p-4 text-[14px] opacity-70">
                                            검색 결과가 없습니다.
                                        </div>
                                    ) : (
                                        <ul>
                                            {results.map((r, idx) => (
                                                <li key={r.id}>
                                                    <button
                                                        className={`
                                                            w-full text-left px-4 py-3
                                                            rounded-xl
                                                            ${
                                                            idx ===
                                                            activeIndex
                                                                ? "bg-base-200"
                                                                : "hover:bg-base-200"
                                                        }
                                                        `}
                                                        onMouseEnter={() =>
                                                            setActiveIndex(
                                                                idx
                                                            )
                                                        }
                                                        onClick={() =>
                                                            selectAndNavigate(
                                                                r
                                                            )
                                                        }
                                                    >
                                                        <div className="text-[16px] font-semibold">
                                                            {r.title}
                                                        </div>
                                                        {r.description && (
                                                            <div className="text-[13px] opacity-70 mt-1">
                                                                {
                                                                    r.description
                                                                }
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
                        /* 일반 메뉴 */
                        <ul className="menu menu-horizontal gap-4 text-[18px] md:text-[20px] font-semibold">
                            <li>
                                <Link to="/ide" className={linkClass("/ide")}>
                                    IDE
                                </Link>
                            </li>
                            <li>
                                <Link
                                    to="/dictionary"
                                    className={linkClass("/dictionary")}
                                >
                                    사전
                                </Link>
                            </li>
                            <li>
                                <Link to="/goal" className={linkClass("/goal")}>
                                    목표
                                </Link>
                            </li>
                            <li>
                                <Link
                                    to="/stats"
                                    className={linkClass("/stats")}
                                >
                                    학습관리
                                </Link>
                            </li>
                        </ul>
                    )}
                </div>

                {/* 오른쪽 검색 버튼 */}
                <div className="navbar-end gap-2">
                    {!isSearching && (
                        <button
                            onClick={() => setIsSearching(true)}
                            className="
                                flex items-center justify-center
                                w-[46px] h-[46px]
                                rounded-full bg-base-200/70
                                hover:bg-base-300/70
                                transition
                            "
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                stroke="currentColor"
                                strokeWidth="2"
                                fill="none"
                                viewBox="0 0 24 24"
                                className="w-[22px] h-[22px] opacity-80"
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
