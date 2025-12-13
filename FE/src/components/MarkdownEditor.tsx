import React from "react";
import MDEditor from "@uiw/react-md-editor";
import "@uiw/react-md-editor/markdown-editor.css";

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

const MarkdownEditor: React.FC<MarkdownEditorProps> = ({
  value,
  onChange,
  placeholder = "Enter markdown content...",
}) => {
  return (
    <div className="border-2 border-gray-200 rounded-lg overflow-hidden">
      <MDEditor
        value={value}
        onChange={(val) => onChange(val || "")}
        preview="live"
        hideToolbar={false}
        visibleDragBar={true}
        data-color-mode="light"
        height={400}
        textareaProps={{
          placeholder: placeholder,
        }}
      />
      <div className="bg-gray-50 px-4 py-2 border-t border-gray-200">
        <p className="text-xs text-gray-500">
          💡 Markdown supported: **bold**, *italic*, # headings, - lists, [links](url), etc.
        </p>
      </div>
    </div>
  );
};

export default MarkdownEditor;
