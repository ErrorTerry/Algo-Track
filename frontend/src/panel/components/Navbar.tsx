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
    // ============================
    // 0) 로그인 유저 정보
    // ============================
    const [nickname, setNickname] = useState<string | null>(null);
    const [profileImageUrl, setProfileImageUrl] = useState<string | null>(null);

    // chrome.storage.local 에서 유저 정보 가져오기
    useEffect(() => {
        if (extChrome?.storage?.local) {
            extChrome.storage.local.get(
                ["nickname", "profileImageUrl"],
                (res: any) => {
                    setNickname(res.nickname ?? null);
                    setProfileImageUrl(res.profileImageUrl ?? null);
                }
            );

            // 변경 감지 (선택사항이지만 있으면 더 안전)
            const listener = (changes: any, areaName: string) => {
                if (areaName !== "local") return;
                if (changes.nickname) {
                    setNickname(changes.nickname.newValue ?? null);
                }
                if (changes.profileImageUrl) {
                    setProfileImageUrl(changes.profileImageUrl.newValue ?? null);
                }
            };

            extChrome.storage.onChanged.addListener(listener);
            return () => extChrome.storage.onChanged.removeListener(listener);
        } else {
            // dev 환경 fallback
            const nick = localStorage.getItem("nickname");
            const img = localStorage.getItem("profileImageUrl");
            setNickname(nick);
            setProfileImageUrl(img);
        }
    }, []);

    const handleLogout = () => {
        // 로그아웃: 토큰 + 유저 정보 제거
        if (extChrome?.storage?.local) {
            extChrome.storage.local.remove(
                ["accessToken", "nickname", "profileImageUrl"],
                () => {
                    console.log("[AlgoTrack] logged out");
                }
            );
        }
        // dev 환경 fallback
        localStorage.removeItem("accessToken");
        localStorage.removeItem("nickname");
        localStorage.removeItem("profileImageUrl");
    };

    // ============================
    // 1) 기존 검색/네비 관련 상태
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

    // 검색 결과 선택 시
    const selectAndNavigate = (r: SearchResult) => {
        setIsSearching(false);
        setQ("");
        setResults([]);
        navigate(`/dictionary/${r.id}`);
    };

    // 닉네임 첫 글자 (아바타에 사용)
    const initial = nickname ? nickname.trim().charAt(0) : "?";

    return (
        <div className="relative z-[10000]">
            <div ref={containerRef} className="navbar bg-base-100 shadow-sm px-6 py-3">
                <div className="navbar-start" />

                {/* 검색 중일 때 중앙 강제 고정 */}
                <div className={`navbar-center ${isSearching ? "w-full justify-center" : ""}`}>
                    {isSearching ? (
                        // 검색 UI
                        <div className="relative w-[560px] max-w-[70vw]">
                            <div className="relative">
                                <input
                                    ref={inputRef}
                                    value={q}
                                    onChange={(e) => setQ(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === "ArrowDown") {
                                            e.preventDefault();
                                            setActiveIndex((i) => Math.min(i + 1, results.length - 1));
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
                                    className="input input-bordered w-full text-[16px] md:text-[18px] pr-[84px] pl-[42px] h-[42px] rounded-[12px] focus:outline-none"
                                />

                                {/* 돋보기 */}
                                <span className="absolute left-[10px] top-1/2 -translate-y-1/2 pointer-events-none">
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="h-5 w-5 opacity-70"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                                        />
                                    </svg>
                                </span>

                                {/* 지우기 버튼 */}
                                <button
                                    onClick={() => setQ("")}
                                    className="absolute right-[44px] top-1/2 -translate-y-1/2 btn btn-ghost btn-xs rounded-full"
                                >
                                    ✕
                                </button>

                                {/* 닫기 */}
                                <button
                                    onClick={() => {
                                        setIsSearching(false);
                                        setQ("");
                                        setResults([]);
                                    }}
                                    className="absolute right-[8px] top-1/2 -translate-y-1/2 btn btn-ghost btn-xs rounded-full"
                                >
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="h-[18px] w-[18px]"
                                        viewBox="0 0 24 24"
                                        fill="currentColor"
                                    >
                                        <path d="M10.5 3a7.5 7.5 0 105.356 12.806l3.668 3.668a.75.75 0 101.06-1.06l-3.668-3.669A7.5 7.5 0 0010.5 3z" />
                                    </svg>
                                </button>
                            </div>

                            {/* 드롭다운 */}
                            {(q.trim() || results.length > 0) && (
                                <div className="absolute left-0 right-0 top-[46px] z-[99999] rounded-[12px] border border-base-300 bg-base-100 shadow-xl max-h-[280px] overflow-auto">
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
                        // 기본 Navbar 메뉴
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

                {/* 오른쪽: 검색 버튼 + 프로필 드롭다운 */}
                <div className="navbar-end gap-2">
                    {!isSearching && (
                        <button
                            className="btn btn-ghost btn-circle hover:bg-gray-100"
                            onClick={() => setIsSearching(true)}
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-[26px] w-[26px]"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                strokeWidth="2"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                                />
                            </svg>
                        </button>
                    )}

                    {/* 프로필 아바타 드롭다운 */}
                    <div className="dropdown dropdown-end">
                        <div
                            tabIndex={0}
                            role="button"
                            className="btn btn-ghost btn-circle avatar"
                        >
                            {profileImageUrl ? (
                                <div className="w-9 rounded-full">
                                    <img src={profileImageUrl} alt="profile" />
                                </div>
                            ) : (
                                <div className="w-9 rounded-full bg-primary text-primary-content flex items-center justify-center text-sm font-bold">
                                    {initial}
                                </div>
                            )}
                        </div>
                        <ul className="mt-3 z-[100000] p-2 shadow menu menu-sm dropdown-content bg-base-100 rounded-box w-44">
                            <li className="px-2 py-1 text-xs opacity-70 cursor-default">
                                {nickname ? `${nickname}님` : "로그인됨"}
                            </li>
                            <li>
                                <button onClick={handleLogout}>로그아웃</button>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}
