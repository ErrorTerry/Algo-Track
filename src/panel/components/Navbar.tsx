export default function Navbar() {
    return (
        <>
            <div className="navbar bg-base-100 shadow-sm px-6 py-3">
                {/* 왼쪽 여백 */}
                <div className="navbar-start" />

                {/* 가운데 메뉴 */}
                <div className="navbar-center">
                    <ul className="menu menu-horizontal gap-4 text-[18px] md:text-[22px] font-semibold">
                        <li><a>IDE</a></li>
                        <li><a>사전</a></li>
                        <li><a>목표</a></li>
                        <li><a>통계</a></li>
                    </ul>
                </div>

                {/* 오른쪽 검색 버튼 */}
                <div className="navbar-end">
                    <button
                        className="btn btn-ghost btn-circle hover:bg-gray-100"
                        title="검색"
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
                </div>
            </div>
        </>
    );
}
