import { useState } from "react";
import api from "./shared/api";

export default function TestBackend() {
    const [message, setMessage] = useState("(아직 호출 안 함)");
    const [error, setError] = useState<string | null>(null);

    const callHealth = async () => {
        try {
            setError(null);
            const res = await api.get("/health"); // 백엔드에서 ok 리턴하는 그거
            setMessage(res.data ?? res); // 문자열이면 res.data가 바로 "ok"
        } catch (e: any) {
            console.error(e);
            setError(e.message ?? "요청 실패");
        }
    };

    return (
        <div className="flex flex-col gap-2 mt-4">
            <button className="btn btn-success" onClick={callHealth}>
                백엔드 /health 호출하기
            </button>
            <div>✅ 응답: {message}</div>
            {error && <div className="text-red-500">❌ 에러: {error}</div>}
        </div>
    );
}
