"use client";

/** /admin: sign in (magic link) and the lead list with filters. */
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { listLeads, requestMagicLink, type LeadListItem } from "@/app/actions/admin";
import { STATUSES, fmtTime, useAdminSession } from "@/components/admin/session";

export default function AdminHome() {
  const { session, token, ready, signOut } = useAdminSession();
  if (!ready) return <div className="box muted">Loading…</div>;
  return <div className="box">{session ? <LeadList token={token} email={session.user.email ?? ""} onSignOut={signOut} /> : <SignIn />}</div>;
}

function SignIn() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  return (
    <div className="card" style={{ maxWidth: 440, margin: "10vh auto" }}>
      <h1>Live Junk Free leads</h1>
      <p className="muted">Sign in with your work email. We&apos;ll email you a one-time sign-in link.</p>
      {sent ? (
        <p className="msg">If {email} is on the admin list, a sign-in link is on its way. Open it on this device.</p>
      ) : (
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            await requestMagicLink(email, `${window.location.origin}/admin/`);
            setSent(true);
          }}
        >
          <label htmlFor="adm-email">Email</label>
          <input id="adm-email" type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <p />
          <button className="primary" type="submit">
            Email me a sign-in link
          </button>
        </form>
      )}
    </div>
  );
}

function LeadList({ token, email, onSignOut }: { token: string; email: string; onSignOut: () => void }) {
  const [status, setStatus] = useState("");
  const [q, setQ] = useState("");
  const [days, setDays] = useState(30);
  const [rows, setRows] = useState<LeadListItem[] | null>(null);
  const [err, setErr] = useState("");
  const load = useCallback(async () => {
    const r = await listLeads(token, { status: status || undefined, q, days: days || undefined });
    if (r.ok) {
      setRows(r.leads);
      setErr("");
    } else setErr(r.error);
  }, [token, status, q, days]);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- initial load / filter change
    void load();
  }, [load]);
  return (
    <>
      <header>
        <h1>Leads</h1>
        <span className="muted">
          {email} · <button onClick={onSignOut}>Sign out</button>
        </span>
      </header>
      <div className="card row">
        <div>
          <label htmlFor="f-status">Status</label>
          <select id="f-status" value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="">All</option>
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="f-days">Received</label>
          <select id="f-days" value={days} onChange={(e) => setDays(Number(e.target.value))}>
            <option value={7}>Last 7 days</option>
            <option value={30}>Last 30 days</option>
            <option value={90}>Last 90 days</option>
            <option value={0}>Any time</option>
          </select>
        </div>
        <div>
          <label htmlFor="f-q">Search</label>
          <input id="f-q" placeholder="Name, phone, email, postal code" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
      </div>
      {err ? <p className="msg">{err}</p> : null}
      <div className="card">
        {rows === null ? (
          <p className="muted">Loading…</p>
        ) : rows.length === 0 ? (
          <p className="muted">No leads match.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Received</th>
                <th>Customer</th>
                <th>Service</th>
                <th>Status</th>
                <th>Appointment</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((l) => (
                <tr key={l.id}>
                  <td>{fmtTime(l.created_at)}</td>
                  <td>
                    <Link href={`/admin/leads/${l.id}/`}>{l.name}</Link>
                    <div className="muted">{l.phone}</div>
                  </td>
                  <td>
                    {l.service_detail || l.service || "—"}
                    {l.city ? <div className="muted">{l.city}</div> : null}
                  </td>
                  <td>
                    <span className={`pill ${l.status}`}>{l.status}</span>
                  </td>
                  <td>{l.appointment_at ? `${fmtTime(l.appointment_at).split(",")[0]} · ${l.appointment_window ?? ""}` : "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}
