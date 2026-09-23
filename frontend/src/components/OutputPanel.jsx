import { Check, Copy, Save, Sparkles } from "lucide-react";
import { useState } from "react";
import { api } from "../api/client";

export default function OutputPanel({ output, generating, toolKey, toolName }) {
  const [copied, setCopied] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(output);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* clipboard unavailable */
    }
  };

  const save = async () => {
    const title = window.prompt("Save as:", `${toolName} — ${new Date().toLocaleDateString()}`);
    if (!title) return;
    setSaving(true);
    try {
      await api("/ai/documents/", {
        method: "POST",
        body: { tool_key: toolKey, title, content: output },
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2200);
    } catch (e) {
      alert(e.message || "Could not save.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="output-card">
      <div className="output-head">
        <Sparkles size={17} color="var(--brand-700)" />
        <span className="t">Result</span>
        {output && (
          <div className="output-actions">
            <button className="icon-btn" onClick={copy}>
              {copied ? <Check size={14} /> : <Copy size={14} />} {copied ? "Copied" : "Copy"}
            </button>
            <button className="icon-btn" onClick={save} disabled={saving}>
              {saved ? <Check size={14} /> : <Save size={14} />} {saved ? "Saved" : "Save"}
            </button>
          </div>
        )}
      </div>
      {generating ? (
        <div className="generating">
          <div className="pulse-dot"><Sparkles size={24} /></div>
          <div>
            <div style={{ fontWeight: 600, color: "var(--ink-700)" }}>Working on it…</div>
            <div className="small">Your AI assistant is drafting. This takes a few seconds.</div>
          </div>
        </div>
      ) : output ? (
        <div className="output-body fade-in">{output}</div>
      ) : (
        <div className="output-empty">
          <div>
            <Sparkles size={40} />
            <div style={{ fontWeight: 600, color: "var(--ink-500)", marginBottom: 6 }}>
              Your result will appear here
            </div>
            <div className="small">Fill in the form and press Generate.</div>
          </div>
        </div>
      )}
    </div>
  );
}
