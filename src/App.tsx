import "./index.css";
import Dictionary from "./panel/pages/Dictionary";

export default function App() {
    // 여기서 라우팅/상태/그래프 등을 구현
    return (
        <div style={{height: "100%", display: "flex", flexDirection: "column"}}>
            <Dictionary />
            <header style={{
                padding: "12px 16px",
                borderBottom: "1px solid #e5e7eb",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                fontWeight: 600
            }}>
                <span>백준 헬퍼 📘</span>
                <small style={{color: "#6b7280"}}>beta</small>
            </header>

            <main style={{padding: 16, overflow: "auto"}}>
                <section style={{marginBottom: 16}}>
                    <h2 style={{fontSize: 14, fontWeight: 700, marginBottom: 8}}>지금 문제</h2>
                    <p style={{fontSize: 14}}>문제 번호/제목/태그 파싱 영역</p>
                </section>

                <section style={{marginBottom: 16}}>
                    <h2 style={{fontSize: 14, fontWeight: 700, marginBottom: 8}}>힌트</h2>
                    <ul style={{paddingLeft: 18, fontSize: 14, lineHeight: 1.5}}>
                        <li>입력 크기 보고 O(N log N) 이하로 낮출 수 있는지 확인</li>
                        <li>예외 케이스를 먼저 정리: 빈 자료구조, 경계 값</li>
                    </ul>
                </section>

                <section>
                    <h2 style={{fontSize: 14, fontWeight: 700, marginBottom: 8}}>목표/통계</h2>
                    <p style={{fontSize: 14}}>이번 주 2/5 달성 · 레이다 차트 영역</p>
                </section>
            </main>
        </div>
    );
}
