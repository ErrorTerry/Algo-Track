import Editor from "@monaco-editor/react";

export default function IdeUI() {
    return (
        <>
            <Editor
                height="100%"
                defaultLanguage="python"
                defaultValue="print('Hello, world!')"
                theme="vs-dark"
                options={{minimap: {enabled: false}}}
            />

        </>
    );
}
