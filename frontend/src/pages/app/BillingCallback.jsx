import { CheckCircle2, XCircle } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { api } from "../../api/client";
import { useAuth } from "../../store/AuthContext";

export default function BillingCallback() {
  const [params] = useSearchParams();
  const [state, setState] = useState("verifying");
  const { reload } = useAuth();
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;
    const reference = params.get("reference") || params.get("trxref");
    if (!reference) {
      setState("failed");
      return;
    }
    api(`/billing/verify/${reference}/`)
      .then((d) => {
        setState(d.status === "success" ? "success" : "failed");
        reload?.();
      })
      .catch(() => setState("failed"));
  }, [params, reload]);

  return (
    <div className="center" style={{ padding: "90px 20px" }}>
      {state === "verifying" && (
        <>
          <div className="spinner dark" style={{ width: 36, height: 36, margin: "0 auto 20px" }} />
          <h2>Confirming your payment…</h2>
        </>
      )}
      {state === "success" && (
        <div className="fade-in">
          <CheckCircle2 size={52} color="var(--success)" style={{ margin: "0 auto 18px" }} />
          <h2>Payment confirmed</h2>
          <p className="muted mt-1">Your new plan is active. Enjoy the extra headroom.</p>
          <Link to="/app" className="btn btn-primary mt-3">Back to workspace</Link>
        </div>
      )}
      {state === "failed" && (
        <div>
          <XCircle size={52} color="var(--danger)" style={{ margin: "0 auto 18px" }} />
          <h2>Payment not completed</h2>
          <p className="muted mt-1">No charge was made, or verification failed. You can try again.</p>
          <Link to="/app/billing" className="btn btn-primary mt-3">Back to billing</Link>
        </div>
      )}
    </div>
  );
}
