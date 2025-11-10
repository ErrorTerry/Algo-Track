import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css';
import App from './App.tsx'

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