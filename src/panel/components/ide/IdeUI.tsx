import { useEffect, useRef } from "react";
import * as monaco from "monaco-editor/esm/vs/editor/editor.api";

// ✅ CSS는 esm가 아니라 "min" 경로에서 가져와야 함
import "monaco-editor/min/vs/editor/editor.main.css";

// 언어 하이라이트 등록
import "monaco-editor/esm/vs/basic-languages/python/python.contribution";

// 워커들 (ESM)
import EditorWorker from "monaco-editor/esm/vs/editor/editor.worker?worker";
import JsonWorker   from "monaco-editor/esm/vs/language/json/json.worker?worker";
import CssWorker    from "monaco-editor/esm/vs/language/css/css.worker?worker";
import HtmlWorker   from "monaco-editor/esm/vs/language/html/html.worker?worker";
import TsWorker     from "monaco-editor/esm/vs/language/typescript/ts.worker?worker";

declare global {
    interface WorkerGlobalScope {
        MonacoEnvironment: { getWorker: (moduleId: string, label: string) => Worker };
    }
}
declare const self: WorkerGlobalScope;

export default function IdeUI() {
    const containerRef = useRef<HTMLDivElement | null>(null);
    const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);

    useEffect(() => {
        self.MonacoEnvironment = {
            getWorker(_moduleId, label) {
                if (label === "json") return new JsonWorker();
                if (["css","scss","less"].includes(label)) return new CssWorker();
                if (["html","handlebars","razor"].includes(label)) return new HtmlWorker();
                if (["typescript","javascript","ts","js"].includes(label)) return new TsWorker();
                return new EditorWorker();
            },
        };

        if (containerRef.current && !editorRef.current) {
            const model = monaco.editor.createModel("", "python");
            editorRef.current = monaco.editor.create(containerRef.current, {
                model,
                theme: "vs-dark",
                automaticLayout: true,
                fontSize: 14,
                minimap: { enabled: false },
            });
        }
        return () => {
            editorRef.current?.dispose();
            editorRef.current = null;
        };
    }, []);

    return <div ref={containerRef} className="w-full h-full" />;
}
