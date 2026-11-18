"use client";

/**
 * /admin/leads/<id>: everything the customer sent (with photos), the emails sent so far, and the
 * workflow (Answers A3.4): call the customer, agree the pickup day + arrival window, then
 * "Send confirmation" emails them. Statuses New / Contacted / Confirmed / Closed.
 */
import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { getLead, leadAction, type AdminAction, type LeadDetail } from "@/app/actions/admin";
import { fmtTime, useAdminSession } from "@/components/admin/session";
import { ARRIVAL_WINDOWS } from "@/lib/leads/constants";

const LABEL: Record<string, string> = { new: "New", contacted: "Contacted", confirmed: "Confirmed", closed: "Closed", completed: "Closed", cancelled: "Closed", booked: "Confirmed", lost: "Closed" };

const torontoDate = (iso?: string | null) => (iso ? new Date(iso).toLocaleDateString("en-CA", { timeZone: "America/Toronto" }) : "");

export default function LeadPage() {
  const { id } = useParams<{ id: string }>();
  const { session, token, ready } = useAdminSession();
  const [d, setD] = useState<LeadDetail | null>(null);
  const [err, setErr] = useState("");
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({ date: "", window: "", address: "", notes: "" });

  const load = useCallback(async () => {
    if (!token) return;
    const r = await getLead(token, id);
    if (!r.ok) return setErr(r.error);
    setD(r);
    const l = r.lead;
    setForm({ date: torontoDate(l.appointment_at), window: l.appointment_window || "", address: l.appointment_address || l.address || "", notes: l.appointment_notes || "" });
  }, [token, id]);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- load on sign-in
    void load();
  }, [load]);

  if (!ready) return <div className="box muted">Loading…</div>;
  if (!session)
    return (
      <div className="box card">
        <p>
          Please <Link href="/admin/">sign in</Link> first.
        </p>
      </div>
    );
  if (err) return <div className="box msg">{err}</div>;
  if (!d) return <div className="box muted">Loading…</div>;
  const l = d.lead;

  async function act(a: AdminAction) {
    if (a === "close" && !window.confirm("Close this enquiry? No email is sent.")) return;
    setBusy(true);
    setMsg("");
    const r = await leadAction(token, id, a, a === "confirm" ? form : undefined);
    setBusy(false);
    if (!r.ok) return setMsg(r.error);
    setMsg(r.email ? `Done. Customer email: ${r.email}.` : "Done.");
    await load();
  }

  const rows: [string, string | number | null | undefined][] = [
    ["Phone", l.phone],
    ["Email", l.email],
    ["Service", l.service_detail || l.service],
    ["Category", l.service_detail ? l.service : null],
    ["Town", l.city],
    ["Address", l.address],
    ["Postal code", l.postal_code],
    ["Preferred callback time", l.callback_time],
    ["Preferred day (old form)", l.preferred_date],
    ["Arrival window (old form)", l.arrival_window],
    ["Pricing truck", l.pricing_selection],
    ["Details", l.details],
    ["Page", l.source_path],
    ["Received", fmtTime(l.created_at)],
    ["gclid", l.gclid],
  ];
  const confirmed = l.status === "confirmed";

  return (
    <div className="box">
      <header>
        <h1>{l.name}</h1>
        <Link className="btn" href="/admin/">
          ← All leads
        </Link>
      </header>
      {msg ? <p className="msg" role="status">{msg}</p> : null}
      <div className="card">
        <p>
          <span className={`pill ${l.status}`}>{LABEL[l.status] ?? l.status}</span>
          {l.appointment_at ? <span className="muted"> · Appointment {fmtTime(l.appointment_at).split(",")[0]}, {l.appointment_window}</span> : null}
        </p>
        <dl>
          {rows
            .filter((r) => r[1])
            .map(([k, v]) => (
              <div key={k} style={{ display: "contents" }}>
                <dt>{k}</dt>
                <dd>{k === "Phone" ? <a href={`tel:${String(v).replace(/\s/g, "")}`}>{v}</a> : k === "Email" ? <a href={`mailto:${v}`}>{v}</a> : v}</dd>
              </div>
            ))}
        </dl>
      </div>

      {d.photos.length ? (
        <div className="card">
          <h2>Photos</h2>
          <div className="photos">
            {d.photos.map((p) => (
              <a key={p.path} href={p.url} target="_blank" rel="noreferrer">
                {/* eslint-disable-next-line @next/next/no-img-element -- signed private-storage URLs */}
                <img src={p.url} alt="Customer photo" />
              </a>
            ))}
          </div>
        </div>
      ) : null}

      <div className="card">
        <h2>Pickup agreed by phone</h2>
        <p className="muted">Call the customer first. Enter the day and arrival window you agreed, then send the confirmation.</p>
        <div className="row">
          <div>
            <label htmlFor="ap-date">Agreed pickup date</label>
            <input id="ap-date" type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
          </div>
          <div>
            <label htmlFor="ap-window">Agreed arrival window</label>
            <input id="ap-window" list="ap-windows" placeholder="e.g. 10 AM - 12 PM" value={form.window} onChange={(e) => setForm({ ...form, window: e.target.value })} />
            <datalist id="ap-windows">
              {ARRIVAL_WINDOWS.map((w) => (
                <option key={w} value={w} />
              ))}
            </datalist>
          </div>
          <div>
            <label htmlFor="ap-address">Service address</label>
            <input id="ap-address" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
          </div>
        </div>
        <p />
        <label htmlFor="ap-notes">Internal notes (not emailed)</label>
        <textarea id="ap-notes" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
        <p className="muted">
          The confirmation email lists the service, address, date and arrival window{l.email ? `, and goes to ${l.email}` : ". There is no email on file, so confirm by phone only"}.
        </p>
        <div className="actions">
          <button className="primary" disabled={busy || !form.date || !form.window.trim()} onClick={() => act("confirm")}>
            {confirmed ? "Update & resend confirmation" : "Mark confirmed & send confirmation"}
          </button>
          {l.status === "new" ? (
            <button disabled={busy} onClick={() => act("contacted")}>
              Mark contacted
            </button>
          ) : null}
          {!["closed", "completed", "cancelled"].includes(l.status) ? (
            <button className="danger" disabled={busy} onClick={() => act("close")}>
              Close
            </button>
          ) : null}
        </div>
      </div>

      <div className="card">
        <h2>Emails</h2>
        {d.emails.length ? (
          <table>
            <tbody>
              {d.emails.map((e, i) => (
                <tr key={i}>
                  <td>{fmtTime(e.created_at)}</td>
                  <td>{e.kind}</td>
                  <td>{e.to_email}</td>
                  <td>
                    {e.status}
                    {e.test_mode ? " (test mode)" : ""}
                    {e.error ? <div className="muted">{e.error}</div> : null}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="muted">No emails logged yet.</p>
        )}
      </div>
    </div>
  );
}
