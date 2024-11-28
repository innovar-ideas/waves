"use client";

import { RefObject, useEffect, useState } from "react";
import dynamic from "next/dynamic";
import type ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

const QuillEditor = dynamic(() => import("react-quill"), {
  ssr: false,
  loading: () => <div className="h-96 animate-pulse bg-muted" />
});

interface TextFileProps {
  value: string
  onChange: (content: string) => void
  quillRef?: RefObject<ReactQuill>
}

function TextFile({ value, onChange }: TextFileProps) {
  const [wordCount, setWordCount] = useState<number>(0);

  const toolbarOptions = [
    [{ "header": "1" }, { "header": "2" }, { "font": [] }],
    [{ size: [] }],
    ["bold", "italic", "underline", "strike", "blockquote"],
    [{ "list": "ordered" }, { "list": "bullet" }, { "indent": "-1" }, { "indent": "+1" }],
    ["link", "image", "video"],
    ["clean"]
  ];

  const modules = { toolbar: toolbarOptions };

  const countWords = (content: string): number => {
    const text = content.replace(/<\/?[^>]+(>|$)/g, "").trim();
    return text === "" ? 0 : text.split(/\s+/).length;
  };

  useEffect(() => {
    setWordCount(countWords(value));
  }, [value]);

  return (
    <div className="flex flex-col gap-2">
      <div>
        <QuillEditor
          // ref={quillRef}
          modules={modules}
          theme="snow"
          value={value}
          onChange={onChange}
          className="h-96 block"
        />
      </div>
      <p className="text-sm mt-12 text-gray-500">Word Count: {wordCount}</p>
    </div>
  );
}

export default TextFile;

