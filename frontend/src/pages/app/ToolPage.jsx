import { AlertTriangle, ArrowLeft, Info, Wand2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link, useOutletContext, useParams } from "react-router-dom";
import { api, ApiError } from "../../api/client";
import OutputPanel from "../../components/OutputPanel";
import ToolForm, { initialValues } from "../../components/ToolForm";

export default function ToolPage() {
  const { toolKey } = useParams();
  const { refreshQuota } = useOutletContext() || {};
  const [catalog, setCatalog] = useState(null);
  const [tool, setTool] = useState(null);
  const [values, setValues] = useState({});
  const [output, setOutput] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});

  useEffect(() => {
    api("/ai/tools/").then(setCatalog).catch((e) => setError(e.message));
  }, []);

  useEffect(() => {
    if (!catalog) return;
    const t = catalog.tools.find((x) => x.key === toolKey);
    setTool(t || null);
    if (t) {
      setValues(initialValues(t.fields));
      setOutput("");
      setError("");
      setFieldErrors({});
    }
  }, [catalog, toolKey]);

  const quota = catalog?.quota;
  const exhausted = useMemo(() => quota && quota.remaining <= 0, [quota]);

  const change = (name, val) => setValues((v) => ({ ...v, [name]: val }));

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    setFieldErrors({});
    try {
      const res = await api("/ai/generate/", {
        method: "POST",
        body: { tool: toolKey, inputs: values },
      });
      setOutput(res.output);
      if (res.quota) setCatalog((c) => ({ ...c, quota: res.quota }));
      refreshQuota?.();
    } catch (err) {
      if (err instanceof ApiError) {
        setFieldErrors(err.data?.field_errors || {});
        if (err.status === 429) {
          setError("quota");
        } else {
          setError(err.message);
        }
      } else {
        setError("Something went wrong. Please try again.");
      }
    } finally {
      setBusy(false);
    }
  };

  if (!catalog) {
    return <div className="center" style={{ padding: 80 }}><div className="spinner dark" style={{ width: 32, height: 32, margin: "0 auto" }} /></div>;
  }
  if (!tool) {
    return (
      <div className="center" style={{ padding: 80 }}>
        <h2>Tool not available</h2>
        <p className="muted mt-1">This tool isn't included in your role's workspace.</p>
        <Link to="/app" className="btn btn-primary mt-3">Back to workspace</Link>
      </div>
    );
  }

  return (
    <div className="fade-in">
      <Link to="/app" className="small flex" style={{ gap: 6, marginBottom: 18 }}>
        <ArrowLeft size={15} /> All tools
      </Link>

      <div className="app-header">
        <div>
          <h1>{tool.name}</h1>
          <div className="sub">{tool.description}</div>
        </div>
        <span className="badge badge-blue" style={{ marginLeft: "auto" }}>
          {quota?.remaining}/{quota?.limit} left this month
        </span>
      </div>

      {tool.integrity_notice && (
        <div className="alert alert-info"><Info size={17} />{tool.integrity_notice}</div>
      )}
      {tool.future_note && (
        <div className="alert alert-info"><Info size={17} />{tool.future_note}</div>
      )}
      {error === "quota" ? (
        <div className="alert alert-warning">
          <AlertTriangle size={17} />
          <div>Monthly quota reached. <Link to="/app/billing">Upgrade</Link> to keep generating.</div>
        </div>
      ) : error ? (
        <div className="alert alert-error"><AlertTriangle size={17} />{error}</div>
      ) : null}

      <div className="tool-runner">
        <div className="tool-form-card">
          <form onSubmit={submit}>
            <ToolForm fields={tool.fields} values={values} onChange={change} errors={fieldErrors} />
            <button className="btn btn-primary btn-block" disabled={busy || exhausted}>
              {busy ? <span className="spinner" /> : <Wand2 size={16} />}
              {busy ? "Generating…" : exhausted ? "Quota reached" : "Generate"}
            </button>
          </form>
        </div>
        <OutputPanel output={output} generating={busy} toolKey={toolKey} toolName={tool.name} />
      </div>
    </div>
  );
}
