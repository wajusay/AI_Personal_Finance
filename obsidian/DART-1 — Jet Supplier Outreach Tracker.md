---
title: DART-1 — Jet Supplier Outreach Tracker
aliases: [Jet Supplier Tracker, Turbojet Outreach, DART-1 Propulsion Sourcing]
tags: [dart-1, propulsion, procurement, outreach, tracker]
project: DART-1 (Mach 1 RC record attempt)
program-lead: Jonas Jusay
sponsor: Michael Mente (external contacts + spend >$1k route through sponsor)
created: 2026-07-10
updated: 2026-07-28
source: Gmail (jonas.jusay@gmail.com)
status: active
---

# 🛩️ DART-1 — Jet Supplier Outreach Tracker

> [!info] What this tracks
> Every turbojet-engine supplier contacted by email for **DART-1** propulsion sourcing, whose turn it is to act, and when contact last happened.
> **Design point driving every inquiry:** ~30,000 ft / Mach 1.08 → engine-face **~61 kPa / ~282 K**, strict MTOW (~18 kg vehicle), **two flights same day** on one engine with a restart between.
> **Last refreshed:** 2026-07-28 · **Suppliers tracked:** 19 (6 core + 13 expansion) · **Ball in my court:** 2 · **Ball with supplier:** 15 · **Declined:** 2
> *07-28: **Rotorsan** mutual NDA (accepted 07-26) **sent for DocuSign signature**. **Frank Turbine** — follow-up drafted 07-28 requesting remaining engine-agnostic interface/limits data (fallback #2). Engine-agnostic data-request sheet created (see Shared artifacts). In my court: KingTech, DG Propulsion.*

---

## 📊 Status at a glance

| Supplier | Engine | Class | Stage | 🎾 Ball | Last contact | Who spoke last |
|---|---|---|---|---|---|---|
| **PBS Aerospace** | TJ40-G2 / custom | ~400+ N | 🔒 NDA in legal review | **Theirs** | 2026-07-17 | PBS (Frank Jones) |
| **AMT Netherlands** | Orion + Titan | ~600 / ~392 N | 📤 Replied to open items (07-24) | **Theirs** | 2026-07-24 | Me (answered Bennie) |
| **KingTech** | K450G4+ | ~450 N | 📄 Data packet received | **Mine** | 2026-07-16 | KingTech (Jack) |
| **JetCat** | P550-PRO-GH | ~550 N | 📤 No reply — 3rd follow-up sent | **Theirs** | 2026-07-17 | Me (3rd nudge) |
| **Jet Italia** | Tanus 500N | ~500 N | 📤 No reply — email + WhatsApp sent | **Theirs** | 2026-07-17 | Me (WhatsApp) |
| **TDI / Kratos** | TDI-J70 | ~560 N | ❌ Declined — will not support project (07-23) | **—** | 2026-07-23 | TDI (Kevin O'Brien) |

**Legend:** 🎾 *Mine* = I owe the next move · *Theirs* = waiting on supplier.

---

## ✅ Next actions (my court)

- [ ] **Rotorsan (RTJ-900 PRO)** — Mutual NDA **sent for DocuSign signature 07-28** (efficiency; may sign, reassign, or use their own process; heads-up emailed). Await execution → RTJ-900 PRO data + **Fri 7/31 8am PDT** call. Front-runner.
- [ ] **KingTech** — Review the K450G4+ data packet Jack sent **2026-07-16** against the design point (61 kPa / 282 K, installed mass vs MTOW, two-flight/restart). Note his caveat: significant thrust loss in cold/thin air.
- [ ] **AMT (Titan/Orion)** — Bennie sent **partial answers 2026-07-20**; review and reply on the still-open items (Titan 8,000 m ceiling hard-vs-tested, altitude thrust/fuel). Orion remains a Q1-2027 availability risk.
- [ ] **DG Propulsion (DG J100)** — Spec sheet received 2026-07-21 (Chirag Gupta). Review vs the design point (altitude thrust/fuel at 61 kPa/282 K, installed mass vs MTOW, alt/Mach limits) and reply with follow-up queries.
- [ ] **Rotorsan (RTJ-900 PRO)** — Replied 07-22 with full specs; offered **mutual NDA + online meeting**. Reply drafted proposing **Fri 7/31 8:00 AM PDT** (tentative hold placed); send it, then sign/return the NDA when it arrives. Strongest expansion lead (PRO's 10,000 m ceiling covers our point).
- [ ] **Pratt & Whitney (Valox)** — Help-desk email **sent 2026-07-21**; awaiting routing to Military Engines / BD. Long shot (class/mass + ITAR); no action unless they reply.
- [ ] **PBS** — Stand by for PBS legal on the redlined NDA; be ready to counter-sign quickly so technical data can flow.
- [x] **TDI / Kratos** — ❌ **Declined 07-23** — Kevin: "due to overwhelming demand… decided not to support your project." Closed.
- [ ] **Hongbo (JT-1000N)** — Email bounced; **web-form inquiry submitted 2026-07-21**. Awaiting reply; WhatsApp **+86 18242549666** as backup if silent.
- [ ] **JetCat / Jet Italia** — 3rd follow-ups sent 2026-07-17 (Jet Italia also WhatsApp); call if still silent by ~2026-07-24.
- [ ] **ZofiTech** — Replied 07-23 declining for "manned" use; you clarified 07-23 it's unmanned/RC. Awaiting their reconsideration.
- [ ] **Frank Turbine** — Answered fully 07-27 (installed ~4.5 kg, two-flight OK, exportable to US, standard nozzle only; **untested at 9 km, no altitude data**). **Follow-up drafted 07-28** in-thread to Sandro (cc office@) requesting the remaining engine-agnostic interface/limits data — CG + bolt pattern, fuel grade/pressure/filtration + 50%/75% flow, ECU voltage/start energy/battery, connector pinouts, throttle protocol + telemetry/fault codes + kill method, redline table (RPM/EGT/fuel pressure/bay temp), duty/cool-down/restarts-per-hour/TBO, vibration/mount temps (framed as integration/W&B due diligence, no test-plan disclosure). Viable fallback (#2) behind Rotorsan.
- [ ] **Expansion batch** — Rotorsan & ZofiTech replied; 8 others still awaiting first reply; follow up any silent by ~2026-07-28.

---

## 🧾 Supplier detail

### 🔒 PBS Aerospace — TJ40-G2 / custom variant
- **Ball:** Theirs (NDA with PBS legal) · **Stage:** NDA redline in legal review · **Last contact:** 2026-07-17 (them)
- **Contacts:** `info@pbsaerospace.com` · Frank A. Jones, VP Customer Support — `jones@pbsaerospace.com`, +1 (404) 429-4911, Roswell, GA
- **Read:** Furthest along of any supplier. They will not release *any* pricing/technical data without a fully executed NDA — process is moving.
- **Timeline**
    - 2026-07-10 — 📤 Me: initial engineering inquiry (TJ40-G2 / derivative)
    - 2026-07-14 — 📤 Me: follow-up / confirm receipt
    - 2026-07-15 — 📥 PBS: "Where are you located?"
    - 2026-07-15 — 📤 Me: Henderson, NV
    - 2026-07-15 — 📥 PBS: no data without executed NDA (proprietary)
    - 2026-07-15 — 📤 Me: ready for mutual NDA, attached my draft
    - 2026-07-16 — 📥 PBS: prefer their NDA form, redline in the attached doc
    - 2026-07-16 — 📤 Me: returned proposed redlines
    - 2026-07-17 — 📥 PBS: "Sent the marked-up NDA to PBS legal yesterday"

### 📄 AMT Netherlands — Orion (~600 N)
- **Ball:** Mine (answer/re-ask open items) · **Stage:** Partial answers received (Titan + Orion) · **Last contact from AMT:** 2026-07-20
- **Contacts:** `email@amtjets.com` · Bennie van de Goor, **CEO**, AMT Netherlands
- **Read:** Technically promising — right thrust class, CEO engaged, technical info shared. **Risk:** Orion prototype is finished but **not in production; planned Q1 2027** — likely too late depending on our schedule.
- **Timeline**
    - 2026-07-10 — 📤 Me: preliminary inquiry (500–600 N class, incl. Orion)
    - 2026-07-13 — 📥 AMT: Orion prototype done, not in production, target Q1 2027; attached technical info
    - 2026-07-16 — 🔁 Me: forwarded thread to Michael (sponsor) for guidance
    - 2026-07-18 — 📤 Me: replied to Bennie — Titan follow-up (contact corrected to Bennie.vandeGoor@amtjets.com)
    - 2026-07-20 — 📥 AMT: **partial** answers returned (Titan 8,000 m ceiling hard-vs-tested + altitude thrust/fuel still open)

### 📄 KingTech — K450G4+
- **Ball:** Mine (review the data) · **Stage:** Data packet received · **Last contact:** 2026-07-16 (them)
- **Contacts:** Jack — `kingtech5512@gmail.com` *(note: `info@`/`sales@kingtechtw.com` bounced — misconfigured server)*
- **Read:** Most responsive supplier; data is in hand, no NDA required. **Caveat from vendor:** designed for model aircraft, skeptical about supersonic; confirms it runs in cold/thin air but with **significant thrust loss**.
- **Timeline**
    - 2026-07-10 — 📤 Me: technical data request (bounced on official addresses) → resent to Jack's Gmail
    - 2026-07-12 — 📥 Jack: "cannot fly above Mach 1"; model engine, can't provide real-jet data
    - 2026-07-12 — 📤 Me: reframed — hobbyist RC build, asking about thin/cold air at altitude, not supersonic at the compressor face
    - 2026-07-13 — 📥 Jack: engine operates in cold, thin air but thrust loss is significant
    - 2026-07-15 — 📤 Me: can you share the data/specs? happy to sign a mutual NDA
    - 2026-07-16 — 📥 Jack: "Attached" — sent data/specs

### 📤 JetCat — P550-PRO-GH (P500-PRO-GH as alt)
- **Ball:** Theirs (no reply) · **Stage:** Awaiting first response · **Last contact:** 2026-07-14 (me)
- **Contacts:** `sales@jetcat.de`
- **Read:** Two touches, no response. Not yet engaged.
- **Timeline**
    - 2026-07-10 — 📤 Me: engineering data request (P550-PRO-GH)
    - 2026-07-14 — 📤 Me: follow-up / confirm receipt
    - 2026-07-17 — ✍️ Me: 3rd-touch follow-up email drafted (pending send)

### 📤 Jet Italia — Tanus 500N
- **Ball:** Theirs (no reply) · **Stage:** Awaiting first response · **Last contact:** 2026-07-14 (me)
- **Contacts:** `info@jet-italia.it`
- **Read:** No email response after two touches; now also nudged over WhatsApp to reach them on a second channel. Not yet engaged.
- **Timeline**
    - 2026-07-10 — 📤 Me: engineering evaluation request (Tanus 500N)
    - 2026-07-14 — 📤 Me: follow-up / confirm receipt (email)
    - 2026-07-17 — 📱 Me: follow-up sent via **WhatsApp**
    - 2026-07-17 — ✍️ Me: 3rd-touch follow-up email drafted (pending send)

### 📄 TDI / Kratos — TDI-J70 (Technical Directions Inc.)
- **Ball:** Theirs (NDA + quote) · **Stage:** NDA intake returned; awaiting NDA/quote · **Last contact:** 2026-07-20 (me)
- **Contacts:** Kevin O'Brien, Director Strategy & Business Development — `kevin.obrien@kratosdefense.com`, +1 (661) 501-3340 · Kratos Unmanned Systems Division (USA)
- **Read:** Most complete data response so far — a serious defense-grade vendor (TDI is a wholly owned Kratos subsidiary, UAS/missile propulsion, 30–200 lbf class). But three real trade-offs: **~$100k/engine ROM**, **~180-day lead (deliveries ~Jan 2027)**, and **ITAR/export-controlled** (US State Dept marketing license + TAA). The **J70** (~560 N) is the size fit. ⚠️ Its uninstalled mass is a large fraction of the ~18 kg vehicle MTOW; installed mass must be checked hard against the weight budget (figures in local-only copy).
- **⚠️ Handling:** Spec sheets are **TDI Proprietary / ITAR-controlled** — Kevin's email prohibits forwarding/reproducing outside authorized parties. The full engine spec matrix is **held locally only** (not committed to this repo) per that notice — see the local-only copy of this tracker / the original PDF.
- **Timeline**
    - 2026-07-17 — 📤 Me: inquiry via Kratos contact form (J70; design point 61 kPa / 282 K; ITAR + single-unit-sale questions)
    - 2026-07-18 — 📥 TDI (Kevin O'Brien): sent spec sheets (J45/J50/J70/J85 + J110 in dev); NDA required before firm quote; J70 ~$100k, ~Jan-2027 delivery; requested NDA intake info; proposed discovery telecon after NDA
    - 2026-07-20 — 📤 Me: returned NDA intake information to Kevin (ball now with TDI)

---

## 🌐 Expanded outreach — additional manufacturers (batch sent 2026-07-21)
Second-wave inquiries to manufacturers beyond the core six, all in/near the ~400–1,000 N class. Each email requested only the **gaps** not in the vendor's public data (altitude/engine-face thrust & fuel, hard-vs-support limits, full installed mass, two-flight restart/TBO, nozzle, price/lead, export status).

| Supplier | Engine(s) | Country | Recipient | Sent | 🎾 Ball | Notes |
|---|---|---|---|---|---|---|
| **GFA Aviation** | LF90 / Leiting 90 | China | market@bjgfa.com | 2026-07-21 | Theirs | awaiting reply |
| **ZofiTech** | ZT J60 / J80 / J160 | Czechia | Tomas Koutsky (info@zofitech.com) | 2026-07-23 | Theirs | Replied 07-23 — declined for "manned application"; **scope clarified 07-23** (unmanned RC), awaiting reconsideration |
| **Van der Lee Turbo Systems** | custom ~900 N | Netherlands | info@vdlee.com | 2026-07-21 | Theirs | custom-design inquiry |
| **CSIR-NAL** | NJ-100 (~1,000 N) | India | rvenkatesh@nal.res.in | 2026-07-21 | ❌ Declined | **Not available to foreign firms** — no collaboration/eval/licensing (Sreedhara, Head PBMD, 07-21); revisit only if policy changes |
| **Fong Jaw Aerospace** | FJ-100 / FJ-1200 | Taiwan | sales@fong-jaw.com | 2026-07-21 | Theirs | asked to confirm complete engine; claims ~Mach 0.95 cruise |
| **Frank Turbine** | FT400 / FT500 | Austria | Sandro Bombek (s.bombek@frankturbine.com; cc office@) | 2026-07-28 | **Theirs** | 📄 **Full answers 07-27:** installed ~4.5 kg (workable), two-flight/restart OK, **exportable to US private buyer**, standard nozzle only. ⚠️ Untested at 9 km — **no altitude data** (validation on us); 440 N < ~550 N target. **Follow-up drafted 07-28** for remaining engine-agnostic interface/limits data (see Next actions). **Viable fallback (#2)** behind Rotorsan |
| **NEX Power** | 800 N turbojet | UK | info@nex-power.co.uk + web form | 2026-07-21 | Theirs | Email sent + **web-form inquiry submitted 2026-07-21**; little public data |
| **DG Propulsion** | DG J100 (~100 kgf) | India | Chirag Gupta (co-founder) | 2026-07-21 | **Mine** | 📄 **Spec sheet received 07-21** (Cdr. Chirag Gupta, Retd.) — review vs design point + follow up on gaps |
| **Jets Munt** | M250XBL / XM250NG | Spain | info@jets-munt.com | 2026-07-21 | Theirs | ~250 N — below target class |
| **SWIWIN** | SW800Pro-Y / SW400Pro-K | China | sales@swiwin.com | 2026-07-21 | Theirs | ~800 / ~400 N; publishes full SLS specs |
| **Rotorsan** | RTJ-900 / RTJ-900 PRO | Türkiye | Bülent Akyürek (info@rotorsan.com) | 2026-07-28 | **Theirs** | ✅ NDA accepted 07-26 → **sent for DocuSign e-signature 07-28** (for efficiency; Bülent may sign, reassign, or use Rotorsan's own process instead; heads-up emailed). Awaiting execution → RTJ-900 PRO data + call (**Fri 7/31 8am PDT** hold). **Front-runner** |
| **Hongbo Turbo** | JT-1000N (~1,000 N) | China | web form (email bounced) | 2026-07-21 | Theirs | Email to Kevin@hongboturbo.com bounced; **web-form inquiry submitted 2026-07-21** |
| **Pratt & Whitney (RTX)** | Valox family (500–1,800 lbf) | USA | help24@prattwhitney.com (help desk) | 2026-07-21 | Theirs | Surfaced by Michael 07-21. ✅ Amateur-tone help-desk email **sent**; asked to route to Military Engines / BD — awaiting routing. ⚠️ Class too big (min ~500 lbf ≈ 2,200 N) + defense/CCA engine, in development, likely ITAR/not sold to individuals — long shot |

**Batch status (updated 2026-07-24):** **Rotorsan** — full specs + NDA/meeting (strongest lead; ball mine). **DG Propulsion** — spec sheet (ball mine). **ZofiTech replied 07-23** — declined for "manned" use; scope clarified (unmanned), awaiting reconsideration. **Declined:** CSIR-NAL, and **TDI/Kratos (07-23)** — withdrew citing overwhelming demand. **Frank Turbine** sent the FT400 datasheet 07-24 (ball → mine; altitude data declined, marginal fit). 7 still awaiting first reply (Hongbo via web form). **Pratt & Whitney (Valox)** awaiting help-desk routing.

---

## 🔧 TDI (Kratos) engine spec reference
> [!warning] Held locally — not committed
> The TDI engine spec matrix (J45 / J50 / J70 / J85 / J110) is **TDI Proprietary / ITAR-controlled** and is intentionally **kept out of this repo**. It lives in the local-only copy of this tracker and the original `TDI-Engine Spec Sheets.pdf`. **Commercial summary (shared with team):** J70 is the size fit (~560 N); NDA required before firm quote → discovery telecon; ~180-day lead, deliveries ~Jan 2027; ~$100k/engine ROM; ITAR (US State Dept marketing license + TAA).

---

## 📎 Shared artifacts & request templates

- **Engine-Agnostic Data Request & Bench-Test Parameter Sheet** (Google Doc, 2026-07-28) — supplier-neutral 8-section request (physical, hard limits, fuel, electrical/ECU, control/telemetry, SLS performance, duty/thermal/mechanical, commercial) derived from the RTJ-900 PRO gate, engine-agnostic subset. Framed as pre-purchase engineering due diligence (no test-plan disclosure); includes an internal-only bench-station mapping. Use as the standard info request for any new/existing supplier. → https://docs.google.com/document/d/1OJ7vyxPyxsNlXmN5-tx2D0ZQ03Dd4z-Sk01wylrMOc8/edit
- **Iron Bird — Bench Test Game Plan** (Google Doc) — what/how/why for the carry-over avionics-power-control spine.
- **Current-State outreach sheets** (Google Sheets, color-coded green/yellow/red) — shared with Michael & Tino (#black-falcon).

---

## 🧮 Dataview (optional — needs the Dataview plugin)

```dataview
TABLE ball AS "🎾 Ball", stage AS "Stage", last-contact AS "Last contact"
FROM "obsidian"
WHERE contains(tags, "supplier-row")
SORT last-contact DESC
```
> If you use Dataview, split each supplier into its own note with `ball`, `stage`, and `last-contact` fields and this table auto-populates. The static table above works with zero plugins.

---

## 🔄 Keeping this "real time"
This page is a snapshot generated from Gmail on **2026-07-21**. To keep it live I can arm a **recurring refresh** (e.g. a daily/weekday scheduled run) that re-scans the turbojet threads, recomputes ball-in-court + last-contact, and pushes an updated version of this file. Say the word and I'll schedule it.

*Not tracked here (different meaning of "jet"):* private-jet charter brokers (Apollo Jets, Air Charter Service, Fly Alliance, Fly Thrive, etc.) — those are travel-booking threads, not DART-1 propulsion suppliers. Tell me if you want a separate charter tracker.
