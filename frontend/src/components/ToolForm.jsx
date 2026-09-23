/** Renders a tool's input schema (from GET /api/ai/tools/) as a form. */
export default function ToolForm({ fields, values, onChange, errors }) {
  return (
    <div>
      {fields.map((f) => {
        const val = values[f.name] ?? "";
        const err = errors?.[f.name];
        return (
          <div className="field" key={f.name}>
            <label htmlFor={`f_${f.name}`}>
              {f.label} {f.required !== false && <span className="req">*</span>}
            </label>
            {f.type === "textarea" ? (
              <textarea
                id={`f_${f.name}`}
                value={val}
                placeholder={f.placeholder || ""}
                onChange={(e) => onChange(f.name, e.target.value)}
              />
            ) : f.type === "select" ? (
              <select
                id={`f_${f.name}`}
                value={val || f.options?.[0] || ""}
                onChange={(e) => onChange(f.name, e.target.value)}
              >
                {f.options.map((o) => (
                  <option key={o} value={o}>{o}</option>
                ))}
              </select>
            ) : (
              <input
                id={`f_${f.name}`}
                type="text"
                value={val}
                placeholder={f.placeholder || ""}
                onChange={(e) => onChange(f.name, e.target.value)}
              />
            )}
            {err ? (
              <div className="err">{err}</div>
            ) : f.placeholder && f.type === "text" ? null : null}
          </div>
        );
      })}
    </div>
  );
}

/** Build initial values: selects default to first option. */
export function initialValues(fields) {
  const v = {};
  for (const f of fields) v[f.name] = f.type === "select" ? f.options?.[0] ?? "" : "";
  return v;
}
