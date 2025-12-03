import { useEffect, useRef, forwardRef, useImperativeHandle } from "react";
import * as monaco from "monaco-editor/esm/vs/editor/editor.api";

// CSS
import "monaco-editor/min/vs/editor/editor.main.css";

// Languages
import "monaco-editor/esm/vs/basic-languages/python/python.contribution";

// Workers
import EditorWorker from "monaco-editor/esm/vs/editor/editor.worker?worker";
import JsonWorker from "monaco-editor/esm/vs/language/json/json.worker?worker";
import CssWorker from "monaco-editor/esm/vs/language/css/css.worker?worker";
import HtmlWorker from "monaco-editor/esm/vs/language/html/html.worker?worker";
import TsWorker from "monaco-editor/esm/vs/language/typescript/ts.worker?worker";

declare global {
    interface WorkerGlobalScope {
        MonacoEnvironment: { getWorker: (moduleId: string, label: string) => Worker };
    }
}
declare const self: WorkerGlobalScope;

// 부모가 사용할 핸들
export type IdeUIHandle = {
    getCode: () => string;
    setCode: (code: string) => void;
};

// ⭐ 부모에서 받을 props 타입 정의
export type IdeUIProps = {
    onChange?: () => void;
};

const IdeUI = forwardRef<IdeUIHandle, IdeUIProps>((props, ref) => {
    const containerRef = useRef<HTMLDivElement | null>(null);
    const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);

    useEffect(() => {
        self.MonacoEnvironment = {
            getWorker(_moduleId, label) {
                if (label === "json") return new JsonWorker();
                if (["css", "scss", "less"].includes(label)) return new CssWorker();
                if (["html", "handlebars", "razor"].includes(label)) return new HtmlWorker();
                if (["typescript", "javascript", "ts", "js"].includes(label)) return new TsWorker();
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
                lineHeight: 22,
                minimap: { enabled: false },
                smoothScrolling: true,
                scrollBeyondLastLine: false,
                wordWrap: "on",
                padding: { top: 8, bottom: 8 },
                scrollbar: {
                    verticalScrollbarSize: 8,
                    horizontalScrollbarSize: 8,
                },
                // ⭐ 커서/정렬 깨지지 않게 고정폭 폰트 강제
                fontFamily:
                    "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Courier New', monospace",
            });

            // ⭐ 코드 변경 이벤트 → 부모에게 알려줌!
            editorRef.current.onDidChangeModelContent(() => {
                props.onChange?.();
            });
        }

        return () => {
            editorRef.current?.dispose();
            editorRef.current = null;
        };
    }, []);

    // 부모가 사용할 메서드 전달
    useImperativeHandle(ref, () => ({
        getCode: () => editorRef.current?.getValue() ?? "",
        setCode: (code: string) => {
            if (editorRef.current) {
                editorRef.current.setValue(code ?? "");
            }
        },
    }));

    return (
        <div className="w-full h-full bg-base-900/90 rounded-b-2xl overflow-hidden algo-ide-editor">
            <div ref={containerRef} className="w-full h-full" />
        </div>
    );
});

export default IdeUI;
