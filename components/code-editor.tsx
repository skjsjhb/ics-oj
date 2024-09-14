import { Editor } from "@monaco-editor/react";
import { ReactNode, useState, useEffect } from "react";
import { Select, SelectItem } from "@nextui-org/select";

const languages = [
  ["bin", "机器代码"],
  ["asm", "LC-3 汇编"],
];

export function useCodeEditor(): [string, string, ReactNode] {
  const [code, setCode] = useState(localStorage.getItem("editor.code") || "");
  const [languageId, setLanguageId] = useState<string>(
    localStorage.getItem("editor.lang") || "asm",
  );

  useEffect(() => {
    localStorage.setItem("editor.code", code);
  }, [code]);

  useEffect(() => {
    localStorage.setItem("editor.lang", languageId);
  }, [languageId]);

  const node = (
    <div className="flex flex-col gap-4 items-center w-full h-full">
      <Select
        disallowEmptySelection
        label="语言"
        selectedKeys={[languageId]}
        size="sm"
        onChange={(e) => setLanguageId(e.target.value)}
      >
        {languages.map(([id, displayName]) => (
          <SelectItem key={id}>{displayName}</SelectItem>
        ))}
      </Select>
      <CodeEditor code={code} setCode={setCode} />
    </div>
  );

  return [code, languageId, node];
}

function CodeEditor({
  code,
  setCode,
}: {
  code: string;
  setCode: (c: string) => void;
}) {
  return (
    <div className="w-full h-full rounded-lg overflow-hidden">
      <Editor
        height="100%"
        language="LC3"
        options={{
          fontSize: 16,
          fontFamily:
            "'JetBrains Mono', Consolas, Monaco, 'Fira Code', 'Courier New', monospace",
        }}
        theme="vs-dark"
        value={code}
        onChange={(s) => setCode(s || "")}
      />
    </div>
  );
}
