import { useEffect, useRef } from "react";

/**
 * Lightweight WYSIWYG editor (contentEditable + execCommand).
 * Produces clean HTML stored on BlogPost.content / SiteContent.content.
 */
export default function RichEditor({ value, onChange, placeholder }) {
  const ref = useRef(null);
  const lastHtml = useRef(value || "");

  useEffect(() => {
    if (ref.current && value !== lastHtml.current) {
      ref.current.innerHTML = value || "";
      lastHtml.current = value || "";
    }
  }, [value]);

  const emit = () => {
    const html = ref.current?.innerHTML || "";
    lastHtml.current = html;
    onChange(html);
  };

  const cmd = (command, arg = null) => {
    ref.current?.focus();
    document.execCommand(command, false, arg);
    emit();
  };

  const buttons = [
    { label: "B", cmd: () => cmd("bold"), title: "Bold" },
    { label: "I", cmd: () => cmd("italic"), title: "Italic", style: { fontStyle: "italic" } },
    { label: "U", cmd: () => cmd("underline"), title: "Underline", style: { textDecoration: "underline" } },
    { label: "H2", cmd: () => cmd("formatBlock", "<h2>"), title: "Heading" },
    { label: "H3", cmd: () => cmd("formatBlock", "<h3>"), title: "Subheading" },
    { label: "¶", cmd: () => cmd("formatBlock", "<p>"), title: "Paragraph" },
    { label: "• List", cmd: () => cmd("insertUnorderedList"), title: "Bullet list" },
    { label: "1. List", cmd: () => cmd("insertOrderedList"), title: "Numbered list" },
    { label: "❝", cmd: () => cmd("formatBlock", "<blockquote>"), title: "Quote" },
    {
      label: "🔗",
      title: "Link",
      cmd: () => {
        const url = window.prompt("Link URL:", "https://");
        if (url) cmd("createLink", url);
      },
    },
    { label: "✕", cmd: () => cmd("removeFormat"), title: "Clear formatting" },
  ];

  return (
    <div className="rte">
      <div className="rte-toolbar">
        {buttons.map((b) => (
          <button key={b.label} type="button" title={b.title} onMouseDown={(e) => e.preventDefault()} onClick={b.cmd} style={b.style}>
            {b.label}
          </button>
        ))}
      </div>
      <div
        ref={ref}
        className="rte-content"
        contentEditable
        suppressContentEditableWarning
        data-placeholder={placeholder || "Start writing…"}
        onInput={emit}
      />
    </div>
  );
}
