/**
 * email-check (QA 18 Nov P1 lead-delivery gate): the customer acknowledgement never reads like a confirmed
 * appointment, and the internal notification goes to the configured recipients (never hard-coded inboxes).
 *
 *   node scripts/checks/email-check.mjs
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";

const ROOT = process.cwd();
let fail = 0;
const ok = (cond, msg) => { console.log(`${cond ? "PASS" : "FAIL"}  ${msg}`); if (!cond) fail++; };
const E = JSON.parse(readFileSync(join(ROOT, "content/emails.json"), "utf8"));

const ack = [E.acknowledgement.subject, E.acknowledgement.preheader, ...E.acknowledgement.paragraphs].join(" ");
ok(!/\{date\}|\{window\}|see you|we['’]ll see you|your pickup is (booked|scheduled|confirmed)|appointment is (booked|confirmed|set)|arrival window/i.test(ack), "acknowledgement has no date, arrival window or 'see you then' wording");
ok(/contact you to discuss next steps and pickup availability/.test(ack), "acknowledgement says the team will contact the customer to arrange a time");
ok(/does not confirm a pickup appointment/.test(ack), "acknowledgement states it does not confirm a pickup appointment");
ok(/confirmed/i.test(E.confirmed.subject) && /\{date\}/.test(E.confirmed.subject), "only the separate staff-sent confirmation email names a date");

const cfg = readFileSync(join(ROOT, "src/lib/email/config.ts"), "utf8");
ok(/LEAD_NOTIFY_EMAIL/.test(cfg) && /LEAD_CC_EMAIL/.test(cfg), "internal notification recipients come from LEAD_NOTIFY_EMAIL (Nav + info@) and LEAD_CC_EMAIL (Manisha)");
const send = readFileSync(join(ROOT, "src/lib/email/lead-emails.tsx"), "utf8");
ok(!/@(gmail|hotmail|outlook|yahoo)\.com/i.test(send + cfg), "no personal inbox is hard-coded");
ok(/EMAIL_TEST_MODE \?\? "true"/.test(cfg) && /cfg\.testMode \? \[cfg\.testTo\]/.test(readFileSync(join(ROOT, "src/lib/email/send.ts"), "utf8")), "test mode is on by default and sends every email to EMAIL_TEST_TO until Manisha's controlled test passes");

console.log(fail ? `email-check: ${fail} failed` : "email-check: all passed");
if (fail) process.exitCode = 1;
