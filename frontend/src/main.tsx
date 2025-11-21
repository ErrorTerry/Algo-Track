import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css';
import App from './App.tsx'


// window.Kakao 타입 선언 (TS 에러 방지)
declare global {
    interface Window {
        Kakao: any;
    }
}

// Kakao SDK 초기화
if (window.Kakao && !window.Kakao.isInitialized()) {
    window.Kakao.init(import.meta.env.VITE_KAKAO_JS_KEY);
    console.log("✅ Kakao SDK Initialized!");
}


const mount = document.getElementById("bj-helper-react-root");
if (!mount) {
    // 혹시 모를 안전망
    const el = document.createElement("div");
    el.id = "bj-helper-react-root";
    document.body.appendChild(el);
}

createRoot(document.getElementById("bj-helper-react-root")!).render(
    <StrictMode>
        <App />
    </StrictMode>
);