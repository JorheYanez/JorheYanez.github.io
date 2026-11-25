(function () {
  "use strict";
  const CATS = window.BC_CATEGORIES;
  const KEY = "buildcircle.v1";
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  /* ---------- state ---------- */
  function load() {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) return migrate(JSON.parse(raw));
    } catch (e) { /* storage unavailable */ }
    const seed = JSON.parse(JSON.stringify(window.BC_SEED));
    return migrate({ pros: seed.pros, reviews: seed.reviews, myId: null, network: [], helpfulVotes: [], events: [] });
  }
  /* Fill in fields added after a visitor's data was first saved. */
  function migrate(d) {
    d.plan = d.plan === "pro" ? "pro" : "free";
    d.billing = d.billing || null;
    d.pros.forEach((p) => {
      if (!p.contact) {
        const s = window.BC_SEED.pros.find((x) => x.id === p.id);
        p.contact = s ? { ...s.contact } : {};
      }
    });
    return d;
  }
  let db = load();
  function save() { try { localStorage.setItem(KEY, JSON.stringify(db)); } catch (e) { /* ignore */ } }

  const ui = { cat: "", q: "", sub: "", state: "", licType: "", exp: 0, rating: 0, verified: false, avail: false, sort: "rating", view: "browse", cycle: "monthly" };

  /* ---------- membership ---------- */
  const PLANS = window.BC_PLANS;
  const isPro = () => db.plan === "pro";
  /* Pro members see everything; everyone always sees their own profile in full. */
  const canSee = (p) => isPro() || p.id === db.myId;
  const LOCK = '<svg class="lock-ic" viewBox="0 0 16 16" width="13" height="13" aria-hidden="true"><path fill="currentColor" d="M4 7V5a4 4 0 1 1 8 0v2h.5A1.5 1.5 0 0 1 14 8.5v5a1.5 1.5 0 0 1-1.5 1.5h-9A1.5 1.5 0 0 1 2 13.5v-5A1.5 1.5 0 0 1 3.5 7H4Zm2 0h4V5a2 2 0 1 0-4 0v2Z"/></svg>';
  function lockedBox(title, text, reason) {
    return `<div class="locked">
      <div class="locked-title">${LOCK} ${esc(title)}</div>
      <p class="muted">${esc(text)}</p>
      <button class="btn primary small" data-upgrade="${esc(reason)}">Unlock with Pro</button>
    </div>`;
  }
  const money = (n) => "$" + n.toLocaleString("en-US");
  const fmtDate = (iso) => new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

  /* ---------- derived ---------- */
  const reviewsFor = (id) => db.reviews.filter((r) => r.proId === id).sort((a, b) => b.date.localeCompare(a.date));
  function stats(id) {
    const rs = reviewsFor(id);
    const n = rs.length;
    const avg = n ? rs.reduce((s, r) => s + r.rating, 0) / n : 0;
    const dist = [5, 4, 3, 2, 1].map((k) => rs.filter((r) => r.rating === k).length);
    return { n, avg, dist };
  }
  const proById = (id) => db.pros.find((p) => p.id === id);
  const me = () => db.myId && proById(db.myId);
  const isVerified = (p) => p.licenses.some((l) => l.verified && !isExpired(l));
  const isExpired = (l) => l.expires && new Date(l.expires) < new Date();
  const connCount = (p) => p.connections + (db.network.includes(p.id) ? 1 : 0);
  const initials = (n) => n.replace(/,.*$/, "").split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]).join("").toUpperCase();
  const catColor = (c) => (CATS[c] ? CATS[c].color : "#888");
  function starStr(v) {
    const full = Math.round(v);
    return "★".repeat(full) + "☆".repeat(5 - full);
  }
  function ago(iso) {
    const s = (Date.now() - new Date(iso)) / 1000;
    if (s < 60) return "just now";
    const m = s / 60, h = m / 60, d = h / 24;
    if (m < 60) return Math.floor(m) + "m ago";
    if (h < 24) return Math.floor(h) + "h ago";
    if (d < 30) return Math.floor(d) + "d ago";
    if (d < 365) return Math.floor(d / 30) + "mo ago";
    return Math.floor(d / 365) + "y ago";
  }

  /* ---------- filters ---------- */
  function fillSelect(sel, values, keep) {
    const cur = keep ? sel.value : "";
    sel.innerHTML = '<option value="">Any</option>' + values.map((v) => `<option>${esc(v)}</option>`).join("");
    if (values.includes(cur)) sel.value = cur;
  }
  function refreshFilterOptions() {
    const cats = ui.cat ? [ui.cat] : Object.keys(CATS);
    fillSelect($("#fSub"), cats.flatMap((c) => CATS[c].subs), true);
    fillSelect($("#fLicType"), cats.flatMap((c) => CATS[c].licenseTypes), true);
    const states = [...new Set(db.pros.flatMap((p) => p.licenses.map((l) => l.state)))].sort();
    fillSelect($("#fState"), states, true);
    ui.sub = $("#fSub").value; ui.licType = $("#fLicType").value; ui.state = $("#fState").value;
  }
  function renderChips() {
    const counts = {};
    db.pros.forEach((p) => (counts[p.category] = (counts[p.category] || 0) + 1));
    const chip = (val, label, color) =>
      `<button class="chip ${ui.cat === val ? "active" : ""}" data-cat="${esc(val)}">${color ? `<span class="dot" style="background:${color}"></span>` : ""}${esc(label)} <small>${val ? counts[val] || 0 : db.pros.length}</small></button>`;
    $("#catChips").innerHTML = chip("", "All pros") + Object.keys(CATS).map((c) => chip(c, c + "s", CATS[c].color)).join("");
  }

  function filtered() {
    const q = ui.q.trim().toLowerCase();
    let list = db.pros.filter((p) => {
      if (ui.cat && p.category !== ui.cat) return false;
      if (ui.sub && p.sub !== ui.sub) return false;
      if (ui.state && !p.licenses.some((l) => l.state === ui.state)) return false;
      if (ui.licType && !p.licenses.some((l) => l.type === ui.licType)) return false;
      if (p.years < ui.exp) return false;
      if (ui.verified && !isVerified(p)) return false;
      if (ui.avail && !p.available) return false;
      if (ui.rating && stats(p.id).avg < ui.rating) return false;
      if (q) {
        const hay = [p.name, p.sub, p.category, p.location, p.headline, p.bio, ...(p.tags || []),
          ...(canSee(p) ? p.licenses.map((l) => l.type + " " + l.number + " " + l.state) : [])].join(" ").toLowerCase();
        if (!q.split(/\s+/).every((t) => hay.includes(t))) return false;
      }
      return true;
    });
    const by = {
      rating: (a, b) => stats(b.id).avg - stats(a.id).avg || stats(b.id).n - stats(a.id).n,
      reviews: (a, b) => stats(b.id).n - stats(a.id).n,
      experience: (a, b) => b.years - a.years,
      connections: (a, b) => connCount(b) - connCount(a),
      name: (a, b) => a.name.localeCompare(b.name)
    };
    return list.sort(by[ui.sort]);
  }

  /* ---------- cards ---------- */
  function cardHTML(p) {
    const s = stats(p.id);
    const verified = isVerified(p);
    const connected = db.network.includes(p.id);
    return `<article class="card" data-open="${p.id}" style="--cat:${catColor(p.category)}" tabindex="0">
      <div class="card-head">
        <div class="avatar">${esc(initials(p.name))}</div>
        <div>
          <h3>${esc(p.name)}</h3>
          <div class="sub">${esc(p.category)} · ${esc(p.sub)}</div>
        </div>
      </div>
      <div class="muted" style="font-size:.9rem">${esc(p.headline || "")}</div>
      <div class="meta">
        <span><span class="stars">${starStr(s.avg)}</span> ${s.n ? s.avg.toFixed(1) : "—"} (${s.n})</span>
        <span>${p.years} yrs exp.</span>
        <span>📍 ${esc(p.location)}</span>
      </div>
      <div class="tags">
        ${verified ? '<span class="badge ok">✔ Verified license</span>' : '<span class="badge warn">License unverified</span>'}
        ${p.available ? '<span class="badge avail">Accepting projects</span>' : ""}
        ${canSee(p)
          ? p.licenses.slice(0, 2).map((l) => `<span class="tag">${esc(l.type)} · ${esc(l.state)}</span>`).join("")
          : `<span class="tag lock-tag">${LOCK} ${p.licenses.length} license${p.licenses.length === 1 ? "" : "s"} on file</span>`}
        ${p.id === db.myId && isPro() ? '<span class="badge pro">PRO</span>' : ""}
      </div>
      <div class="card-foot">
        <span class="muted" style="font-size:.8rem">${connCount(p)} connections</span>
        ${p.id === db.myId ? '<span class="tag">You</span>' : `<button class="btn small ${connected ? "on" : ""}" data-connect="${p.id}">${connected ? "✓ Connected" : "+ Connect"}</button>`}
      </div>
    </article>`;
  }
  function renderGrid() {
    const list = filtered();
    $("#count").textContent = `${list.length} professional${list.length === 1 ? "" : "s"}`;
    $("#grid").innerHTML = list.length ? list.map(cardHTML).join("") : '<div class="empty">No pros match these filters. Try widening your search.</div>';
  }
  function renderNetwork() {
    const list = db.network.map(proById).filter(Boolean);
    $("#netCount").textContent = list.length;
    $("#networkGrid").innerHTML = list.length ? list.map(cardHTML).join("") : '<div class="empty">You haven\'t connected with anyone yet. Browse the directory and hit “Connect”.</div>';
  }

  /* ---------- feed ---------- */
  function renderFeed() {
    const items = [
      ...db.reviews.map((r) => ({ date: r.date, kind: "review", r })),
      ...db.pros.map((p) => ({ date: p.joined, kind: "join", p })),
      ...db.events
    ].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 40);
    $("#feed").innerHTML = items.map((it) => {
      if (it.kind === "review") {
        const p = proById(it.r.proId); if (!p) return "";
        return `<div class="feed-item"><div class="avatar" style="--cat:${catColor(p.category)}">${esc(initials(it.r.author))}</div><div>
          <div><b>${esc(it.r.author)}</b> <span class="muted">(${esc(it.r.role)})</span> reviewed <a data-open="${p.id}">${esc(p.name)}</a> <span class="stars">${starStr(it.r.rating)}</span></div>
          ${canSee(p) ? `<div>“${esc(it.r.text)}”</div>` : `<div class="muted">${LOCK} <button class="linkbtn" data-upgrade="Reading reviews of other businesses">Upgrade to Pro</button> to read this review</div>`}<time>${ago(it.date)} · ${esc(it.r.project)}</time></div></div>`;
      }
      if (it.kind === "join") {
        const p = it.p;
        return `<div class="feed-item"><div class="avatar" style="--cat:${catColor(p.category)}">${esc(initials(p.name))}</div><div>
          <div><a data-open="${p.id}">${esc(p.name)}</a> joined as a <b>${esc(p.sub)}</b> ${esc(p.category.toLowerCase())}</div><time>${ago(it.date)} · ${esc(p.location)}</time></div></div>`;
      }
      if (it.kind === "connect") {
        const p = proById(it.proId); if (!p) return "";
        return `<div class="feed-item"><div class="avatar" style="--cat:var(--accent)">✓</div><div>
          <div>You connected with <a data-open="${p.id}">${esc(p.name)}</a></div><time>${ago(it.date)}</time></div></div>`;
      }
      return "";
    }).join("");
  }

  /* ---------- profile ---------- */
  function contactHTML(c) {
    const rows = [];
    if (c.phone) rows.push(`<div class="contact-row"><span>📞</span><a href="tel:${esc(c.phone.replace(/[^\d+]/g, ""))}">${esc(c.phone)}</a></div>`);
    if (c.email) rows.push(`<div class="contact-row"><span>✉️</span><a href="mailto:${esc(c.email)}">${esc(c.email)}</a></div>`);
    if (c.website) {
      const host = c.website.replace(/^[a-z][a-z0-9+.-]*:\/*/i, "");
      rows.push(`<div class="contact-row"><span>🌐</span><a href="https://${esc(host)}" target="_blank" rel="noopener noreferrer">${esc(host)}</a></div>`);
    }
    return rows.length ? `<div class="contact">${rows.join("")}</div>` : '<span class="muted">No contact info listed.</span>';
  }

  let draftRating = 0;
  let currentProfile = null;
  function openProfile(id) {
    const p = proById(id); if (!p) return;
    currentProfile = id;
    const s = stats(id);
    const rs = reviewsFor(id);
    const connected = db.network.includes(id);
    const mine = id === db.myId;
    draftRating = 0;
    $("#profileBody").innerHTML = `
      <div class="p-head" style="--cat:${catColor(p.category)}">
        <button class="x close" data-close aria-label="Close">×</button>
        <div class="avatar lg">${esc(initials(p.name))}</div>
        <div>
          <h2>${esc(p.name)} ${mine && isPro() ? '<span class="badge pro">PRO</span>' : ""}</h2>
          <div class="sub">${esc(p.category)} · ${esc(p.sub)}</div>
          <div class="muted">${esc(p.headline || "")}</div>
          <div class="p-actions">
            ${mine ? '<span class="tag">This is your profile</span>' : `<button class="btn ${connected ? "on" : "primary"} small" data-connect="${p.id}">${connected ? "✓ Connected" : "+ Connect"}</button>
            <button class="btn small" data-msg="${p.id}">Message</button>
            <a class="btn small" href="#write-review" data-jump>Write a review</a>`}
          </div>
        </div>
      </div>
      <div class="pbody">
        <div class="stat-row">
          <div class="stat"><b>${s.n ? s.avg.toFixed(1) : "—"}</b><span>${s.n} review${s.n === 1 ? "" : "s"}</span></div>
          <div class="stat"><b>${p.years}</b><span>years experience</span></div>
          <div class="stat"><b>${p.licenses.length}</b><span>licenses</span></div>
          <div class="stat"><b>${connCount(p)}</b><span>connections</span></div>
          ${p.rate ? `<div class="stat"><b>$${p.rate}</b><span>per hour</span></div>` : ""}
        </div>
        <div class="p-grid">
          <div class="box">
            <h4>About</h4>
            <p style="margin:0 0 8px">${esc(p.bio || "No bio yet.")}</p>
            <div class="meta"><span>📍 ${esc(p.location)}</span><span>${p.available ? "🟢 Accepting new projects" : "⚪ Not taking projects"}</span></div>
            <div class="tags" style="margin-top:8px">${(p.tags || []).map((t) => `<span class="tag">${esc(t)}</span>`).join("")}</div>
          </div>
          <div class="box">
            <h4>Licenses & certifications</h4>
            ${!p.licenses.length ? '<span class="muted">No licenses listed.</span>'
              : canSee(p) ? p.licenses.map((l) => `<div class="lic"><div><b>${esc(l.type)}</b><br><span class="muted">#${esc(l.number)} · ${esc(l.state)} · exp. ${esc(l.expires || "n/a")}</span></div>
              <div>${isExpired(l) ? '<span class="badge warn">Expired</span>' : l.verified ? '<span class="badge ok">✔ Verified</span>' : '<span class="badge warn">Pending</span>'}</div></div>`).join("")
              : lockedBox(`${p.licenses.length} license${p.licenses.length === 1 ? "" : "s"} on file`,
                  "See license numbers, issuing states, expiry dates and verification status.", "Full license details")}
          </div>
        </div>
        <div class="box">
          <h4>Contact</h4>
          ${canSee(p) ? contactHTML(p.contact || {})
            : lockedBox("Contact info is for Pro members", "See their phone number, email address and website.", "Contact information")}
        </div>
        <div class="box">
          <h4>Rating breakdown</h4>
          ${[5, 4, 3, 2, 1].map((k, i) => `<div class="dist"><span>${k}★</span><div class="bar"><i style="width:${s.n ? (s.dist[i] / s.n) * 100 : 0}%"></i></div><span>${s.dist[i]}</span></div>`).join("")}
        </div>

        ${mine ? "" : `<form id="write-review" class="box" style="display:flex;flex-direction:column;gap:10px">
          <h4>Write a review</h4>
          <div class="star-input" role="radiogroup" aria-label="Rating">${[1, 2, 3, 4, 5].map((k) => `<button type="button" data-star="${k}" aria-label="${k} stars">★</button>`).join("")}</div>
          <div class="row2">
            <label>Your name<input name="author" required maxlength="50" value="${esc(me() ? me().name : "")}"></label>
            <label>You are a…<select name="role"><option>Homeowner</option><option>Contractor</option><option>Architect</option><option>Engineer</option><option>Developer</option><option>Property owner</option><option>Business owner</option></select></label>
          </div>
          <label>Project type<input name="project" maxlength="50" placeholder="Kitchen remodel" required></label>
          <label>Your review<textarea name="text" rows="3" maxlength="800" required placeholder="What was it like working with them? Quality, timeline, communication, budget…"></textarea></label>
          <div class="dlg-actions"><button class="btn primary" type="submit">Post review</button></div>
        </form>`}

        <div>
          <h3>Reviews (${s.n})</h3>
          ${rs.length && !canSee(p) ? `<div class="review-lock">
              ${[0, 1].map(() => `<div class="review ghost-review" aria-hidden="true"><div class="ghost-line w40"></div><div class="ghost-line w20"></div><div class="ghost-line w90"></div><div class="ghost-line w70"></div></div>`).join("")}
              ${lockedBox(`${s.n} review${s.n === 1 ? "" : "s"} from clients and pros`, "Read what homeowners, developers and other pros say about working with them.", "Reading reviews of other businesses")}
            </div>`
          : rs.length ? rs.map((r) => `<div class="review">
            <div class="review-head"><span><b>${esc(r.author)}</b> <span class="muted">· ${esc(r.role)} · ${esc(r.project)}</span></span><span class="muted">${ago(r.date)}</span></div>
            <div class="stars">${starStr(r.rating)}</div>
            <p>${esc(r.text)}</p>
            <button class="btn ghost small helpful" data-helpful="${r.id}" ${db.helpfulVotes.includes(r.id) ? "disabled" : ""}>👍 Helpful (${r.helpful})</button>
          </div>`).join("") : '<p class="muted">No reviews yet — be the first.</p>'}
        </div>
      </div>`;
    const dlg = $("#profileDlg");
    if (!dlg.open) dlg.showModal();
    const form = $("#write-review");
    if (form) {
      form.role.value = me() ? me().category : "Homeowner";
      form.addEventListener("submit", (e) => {
        e.preventDefault();
        if (!draftRating) return toast("Pick a star rating first");
        const f = new FormData(form);
        db.reviews.push({ id: "r" + Date.now(), proId: id, author: f.get("author").trim(), role: f.get("role"), rating: draftRating,
          project: f.get("project").trim(), text: f.get("text").trim(), date: new Date().toISOString(), helpful: 0 });
        save(); rerender(); openProfile(id); toast("Review posted — thanks!");
      });
    }
  }
  function paintStars(n) { $$(".star-input button").forEach((b) => b.classList.toggle("on", +b.dataset.star <= n)); }

  /* ---------- join form ---------- */
  function licRowHTML(cat) {
    const types = CATS[cat].licenseTypes;
    return `<div class="lic-row">
      <select name="lt" aria-label="License type">${types.map((t) => `<option>${esc(t)}</option>`).join("")}</select>
      <input name="ln" placeholder="License #" maxlength="30" aria-label="License number">
      <input name="ls" placeholder="State" maxlength="2" aria-label="State" style="text-transform:uppercase">
      <input name="le" type="date" aria-label="Expires">
      <button type="button" class="x" data-rmlic aria-label="Remove">×</button></div>`;
  }
  function setupJoin() {
    const jCat = $("#jCat"), jSub = $("#jSub");
    jCat.innerHTML = Object.keys(CATS).map((c) => `<option>${c}</option>`).join("");
    const syncSubs = () => {
      jSub.innerHTML = CATS[jCat.value].subs.map((s) => `<option>${esc(s)}</option>`).join("");
      $("#licRows").innerHTML = licRowHTML(jCat.value);
    };
    jCat.addEventListener("change", syncSubs);
    syncSubs();
    $("#addLic").addEventListener("click", () => $("#licRows").insertAdjacentHTML("beforeend", licRowHTML(jCat.value)));
    $("#licRows").addEventListener("click", (e) => { if (e.target.matches("[data-rmlic]")) e.target.closest(".lic-row").remove(); });
    $("#joinBtn").addEventListener("click", () => {
      if (me()) return openProfile(db.myId);
      $("#joinDlg").showModal();
    });
    $("#joinForm").addEventListener("submit", (e) => {
      e.preventDefault();
      const f = new FormData(e.target);
      const licenses = $$(".lic-row", e.target).map((row) => ({
        type: $("[name=lt]", row).value, number: $("[name=ln]", row).value.trim(), state: $("[name=ls]", row).value.trim().toUpperCase(),
        expires: $("[name=le]", row).value, verified: false
      })).filter((l) => l.number);
      const p = {
        id: "u" + Date.now(), name: f.get("name").trim(), category: f.get("category"), sub: f.get("sub"), location: f.get("location").trim(),
        years: +f.get("years") || 0, rate: +f.get("rate") || null, available: !!f.get("available"), headline: f.get("headline").trim(),
        bio: f.get("bio").trim(),
        contact: { phone: f.get("phone").trim(), email: f.get("email").trim(), website: f.get("website").trim() },
        tags: f.get("tags").split(",").map((t) => t.trim()).filter(Boolean), licenses, connections: 0, joined: new Date().toISOString()
      };
      db.pros.push(p); db.myId = p.id; save();
      $("#joinDlg").close(); e.target.reset(); syncSubs();
      rerender(); openProfile(p.id);
      toast("Profile published! Licenses show as pending until verified.");
    });
  }

  /* ---------- pricing & plans ---------- */
  const proPrice = (cycle) => (cycle === "annual" ? PLANS.pro.annual : PLANS.pro.monthly);
  const perLabel = (cycle) => (cycle === "annual" ? "/year" : "/month");
  /* Annual savings, worked out from the prices so they stay right if prices change. */
  const savePct = () => Math.round((1 - PLANS.pro.annual / (PLANS.pro.monthly * 12)) * 100);
  const monthsFree = () => Math.round((PLANS.pro.monthly * 12 - PLANS.pro.annual) / PLANS.pro.monthly);
  /* One free trial per visitor. */
  const trialAvailable = () => !db.usedTrial && PLANS.pro.trialDays > 0;
  const addDays = (iso, n) => new Date(new Date(iso).getTime() + n * 864e5).toISOString();
  const inTrial = (b) => b && b.trialEnds && new Date(b.trialEnds) > new Date();

  /* ---------- Stripe Payment Links ---------- */
  const STRIPE = window.BC_STRIPE || {};
  /* Real checkout only when both Payment Links are configured; otherwise the demo checkout. */
  const stripeOn = () => /^https:\/\/(buy|checkout)\.stripe\.com\//.test(STRIPE.monthlyLink || "") && /^https:\/\/(buy|checkout)\.stripe\.com\//.test(STRIPE.annualLink || "");
  const portalOn = () => /^https:\/\/billing\.stripe\.com\//.test(STRIPE.portalLink || "");
  const isStripeBilling = () => db.billing && db.billing.provider === "stripe";
  function visitorId() {
    if (!db.visitorId) { db.visitorId = "v_" + Math.random().toString(36).slice(2, 12) + Date.now().toString(36); save(); }
    return db.visitorId;
  }
  function goToStripe(cycle) {
    const url = new URL(cycle === "annual" ? STRIPE.annualLink : STRIPE.monthlyLink);
    url.searchParams.set("client_reference_id", visitorId());
    db.pendingCheckout = { cycle, at: new Date().toISOString() }; save();
    window.location.href = url.toString();
  }
  /* Stripe sends buyers back to ?checkout=success&plan=...&session_id=...
     A static site can't verify the session with Stripe (that needs a secret key on a
     server), so this trusts the redirect. Fine for testing demand; add a backend before
     relying on it to protect paid content. */
  function handleStripeReturn() {
    const params = new URLSearchParams(window.location.search);
    if (params.get("checkout") !== "success") return;
    const cycle = params.get("plan") === "annual" ? "annual" : "monthly";
    const now = new Date().toISOString();
    const days = PLANS.pro.trialDays;
    db.plan = "pro";
    db.billing = { provider: "stripe", cycle, since: now, price: proPrice(cycle), trialEnds: days ? addDays(now, days) : null,
      sessionId: (params.get("session_id") || "").slice(0, 200) };
    db.usedTrial = true; db.pendingCheckout = null; save();
    history.replaceState(null, "", window.location.pathname + window.location.hash);
    setTimeout(() => toast(days ? `You're on Pro! Your ${days}-day free trial has started.` : "Payment confirmed. Welcome to Pro!"), 300);
  }
  function renderPricing() {
    $$(".cycle-btn").forEach((b) => {
      const on = b.dataset.cycle === ui.cycle;
      b.classList.toggle("on", on); b.setAttribute("aria-checked", on); b.setAttribute("role", "radio");
    });
    const feats = (list) => `<ul class="feats">${list.map((f, i) =>
      `<li class="${f.endsWith(":") ? "lead" : ""}">${f.endsWith(":") && i === 0 ? "" : '<span class="ck">✓</span>'}${esc(f)}</li>`).join("")}</ul>`;
    const pro = PLANS.pro, free = PLANS.free;
    const monthlyEquiv = (pro.annual / 12).toFixed(2);
    $("#savePct").textContent = `Save ${savePct()}%`;
    const cta = trialAvailable() ? `Start ${pro.trialDays}-day free trial` : "Upgrade to Pro";
    $("#plans").innerHTML = `
      <div class="plan ${!isPro() ? "current" : ""}">
        <div class="plan-name">${free.name}</div>
        <div class="muted">${esc(free.tagline)}</div>
        <div class="price"><b>$0</b><span>forever</span></div>
        ${isPro() ? '<button class="btn" data-downgrade>Switch to Free</button>' : '<button class="btn" disabled>Your current plan</button>'}
        ${feats(free.features)}
      </div>
      <div class="plan featured ${isPro() ? "current" : ""}">
        <div class="ribbon">Launch price</div>
        <div class="plan-name">${pro.name}</div>
        <div class="muted">${esc(pro.tagline)}</div>
        <div class="price"><b>${money(proPrice(ui.cycle))}</b><span>${perLabel(ui.cycle)}</span></div>
        <div class="muted small-note">${ui.cycle === "annual" ? `That's $${monthlyEquiv}/month, billed yearly` : `Or ${money(pro.annual)}/year — ${monthsFree()} months free`}</div>
        ${isPro() ? '<button class="btn primary" data-manage>Manage plan</button>' : `<button class="btn primary" data-upgrade="">${cta}</button>`}
        ${!isPro() && trialAvailable() ? `<div class="muted small-note">No charge for ${pro.trialDays} days · cancel any time</div>` : ""}
        ${feats(pro.features)}
      </div>`;
    const rows = [
      ["Browse the directory", true, true],
      ["Filter by category, specialty, experience & rating", true, true],
      ["Star ratings & review counts", true, true],
      ["Create a profile, connect & write reviews", true, true],
      ["Read reviews of other businesses", false, true],
      ["Contact info (phone, email, website)", false, true],
      ["License numbers, states, expiry & verification", false, true],
      ["Filter by license state & type", false, true],
      ["Search by license number", false, true],
      ["Pro badge on your profile", false, true]
    ];
    const cell = (v) => (v ? '<span class="ck">✓</span>' : '<span class="muted">—</span>');
    $("#compare").innerHTML = `<h3>Compare plans</h3><table><thead><tr><th>Feature</th><th>Free</th><th>Pro</th></tr></thead>
      <tbody>${rows.map((r) => `<tr><td>${esc(r[0])}</td><td>${cell(r[1])}</td><td>${cell(r[2])}</td></tr>`).join("")}</tbody></table>`;
  }

  /* Upgrade (checkout) dialog. `reason` names the feature that prompted it. */
  function openCheckout(reason) {
    if (isPro()) return openManage();
    let cycle = ui.cycle;
    const body = $("#checkoutBody");
    const trial = trialAvailable();
    const days = PLANS.pro.trialDays;
    const paint = () => {
      const firstCharge = fmtDate(addDays(new Date().toISOString(), days));
      body.innerHTML = `
        <button class="x close" data-close aria-label="Close">×</button>
        <div class="plan-name">Upgrade to BuildCircle Pro</div>
        ${reason ? `<p class="reason">${LOCK} ${esc(reason)} is a Pro feature.</p>` : ""}
        <div class="cycle-pick" role="radiogroup" aria-label="Billing cycle">
          ${["monthly", "annual"].map((c) => `<label class="cycle-opt ${cycle === c ? "on" : ""}">
            <input type="radio" name="cyc" value="${c}" ${cycle === c ? "checked" : ""}>
            <span><b>${c === "annual" ? "Annual" : "Monthly"}</b><br><span class="muted">${money(proPrice(c))}${perLabel(c)}${c === "annual" ? ` · save ${savePct()}%` : ""}</span></span>
          </label>`).join("")}
        </div>
        <ul class="feats">${PLANS.pro.features.slice(1).map((f) => `<li><span class="ck">✓</span>${esc(f)}</li>`).join("")}</ul>
        <div class="summary"><span>Due today</span><b>${trial ? "$0" : money(proPrice(cycle))}</b></div>
        ${trial ? `<p class="muted then">Then ${money(proPrice(cycle))}${perLabel(cycle)} starting ${firstCharge}. Cancel before then and you won't be charged.</p>` : ""}
        ${stripeOn()
          ? `<p class="demo-note">🔒 You'll finish on Stripe's secure checkout. A card is needed to start${trial ? " the trial, but nothing is charged until it ends" : ""}.${STRIPE.mode === "test" ? " <b>Test mode:</b> use card 4242 4242 4242 4242, any future date and any CVC." : ""}</p>`
          : `<p class="demo-note">Demo checkout — no payment is collected and no card is needed. Cancel any time from <i>Manage plan</i>.</p>`}
        <div class="dlg-actions">
          <button class="btn ghost" data-close>Not now</button>
          <button class="btn primary" id="confirmPro">${stripeOn() ? "Continue to secure checkout" : trial ? `Start ${days}-day free trial` : "Start Pro"}</button>
        </div>`;
      $$("input[name=cyc]", body).forEach((r) => r.addEventListener("change", () => { cycle = r.value; paint(); }));
      $("#confirmPro", body).addEventListener("click", () => {
        if (stripeOn()) return goToStripe(cycle);
        const now = new Date().toISOString();
        db.plan = "pro";
        db.billing = { cycle, since: now, price: proPrice(cycle), trialEnds: trial ? addDays(now, days) : null };
        if (trial) db.usedTrial = true;
        save();
        $("#checkoutDlg").close();
        afterPlanChange();
        toast(trial ? `Your ${days}-day Pro trial has started. Everything is unlocked.` : "Welcome to Pro! Reviews, contact info and license details are unlocked.");
      });
    };
    paint();
    const dlg = $("#checkoutDlg");
    if (!dlg.open) dlg.showModal();
  }

  /* Next charge: the end of the trial, then every month or year after it. */
  function renewalDate(b) {
    const d = new Date(b.trialEnds || b.since);
    const now = new Date();
    while (d <= now) b.cycle === "annual" ? d.setFullYear(d.getFullYear() + 1) : d.setMonth(d.getMonth() + 1);
    return d.toISOString();
  }
  function openManage() {
    const b = db.billing || { cycle: "monthly", since: new Date().toISOString(), price: PLANS.pro.monthly };
    const other = b.cycle === "annual" ? "monthly" : "annual";
    $("#checkoutBody").innerHTML = `
      <button class="x close" data-close aria-label="Close">×</button>
      <div class="plan-name">Your plan: Pro <span class="badge pro">PRO</span></div>
      <div class="manage-grid">
        <div><span class="muted">Billing</span><b>${money(proPrice(b.cycle))}${perLabel(b.cycle)}</b></div>
        ${inTrial(b)
          ? `<div><span class="muted">Free trial ends</span><b>${fmtDate(b.trialEnds)}</b></div>
             <div><span class="muted">First charge</span><b>${fmtDate(b.trialEnds)}</b></div>`
          : `<div><span class="muted">Member since</span><b>${fmtDate(b.since)}</b></div>
             <div><span class="muted">Renews</span><b>${fmtDate(renewalDate(b))}</b></div>`}
      </div>
      ${isStripeBilling()
        ? `<p class="demo-note">Billing is handled by Stripe. Update your card, switch between monthly and annual, see invoices or cancel there.</p>
           <div class="dlg-actions">
             <button class="btn ghost" data-downgrade>Switch this browser to Free</button>
             ${portalOn() ? `<a class="btn primary" href="${esc(STRIPE.portalLink)}" target="_blank" rel="noopener noreferrer">Manage billing on Stripe</a>` : ""}
           </div>`
        : `<p class="demo-note">Demo billing — nothing is charged.</p>
           <div class="dlg-actions">
             <button class="btn" data-switch="${other}">Switch to ${other} (${money(proPrice(other))}${perLabel(other)})</button>
             <button class="btn danger" data-downgrade>Cancel Pro</button>
           </div>`}`;
    const dlg = $("#checkoutDlg");
    if (!dlg.open) dlg.showModal();
  }
  function downgrade() {
    const msg = isStripeBilling()
      ? "Switch this browser back to Free? This doesn't cancel your Stripe subscription: to stop being charged, use \"Manage billing on Stripe\" first."
      : "Cancel Pro and switch to the Free plan? Reviews, contact info and license details will be locked again.";
    if (!confirm(msg)) return;
    db.plan = "free"; db.billing = null; save();
    if ($("#checkoutDlg").open) $("#checkoutDlg").close();
    afterPlanChange();
    toast("You're now on the Free plan.");
  }
  function afterPlanChange() {
    if (!isPro()) {
      ui.state = ""; ui.licType = "";
      $("#fState").value = ""; $("#fLicType").value = "";
    }
    rerender();
    if ($("#profileDlg").open && currentProfile) openProfile(currentProfile);
  }

  /* ---------- misc ---------- */
  let toastTimer;
  function toast(msg) {
    const t = $("#toast"); t.textContent = msg; t.classList.add("show");
    clearTimeout(toastTimer); toastTimer = setTimeout(() => t.classList.remove("show"), 2600);
  }
  function toggleConnect(id) {
    const i = db.network.indexOf(id);
    if (i >= 0) { db.network.splice(i, 1); db.events = db.events.filter((e) => !(e.kind === "connect" && e.proId === id)); toast("Connection removed"); }
    else { db.network.push(id); db.events.push({ kind: "connect", proId: id, date: new Date().toISOString() }); toast("Connected with " + proById(id).name); }
    save(); rerender();
    if ($("#profileDlg").open) openProfile(id);
  }
  function setView(v) {
    ui.view = v;
    $$(".view").forEach((s) => s.classList.toggle("hidden", s.id !== "view-" + v));
    $$(".tab").forEach((t) => t.classList.toggle("active", t.dataset.view === v));
    rerender();
  }
  function rerender() {
    renderChips(); renderGrid(); renderNetwork();
    if (ui.view === "feed") renderFeed();
    if (ui.view === "pricing") renderPricing();
    const badge = $("#planBadge");
    badge.textContent = isPro() ? "PRO" : "Free plan";
    badge.classList.toggle("is-pro", isPro());
    $$("[data-pro-only]").forEach((el) => el.classList.toggle("hidden", isPro()));
    $("#meLabel").textContent = me() ? "Signed in as " + me().name : "";
    $("#joinBtn").textContent = me() ? "My profile" : "Join as a pro";
  }

  /* ---------- events ---------- */
  document.addEventListener("click", (e) => {
    const t = e.target;
    const up = t.closest("[data-upgrade]"); if (up) { e.preventDefault(); return openCheckout(up.dataset.upgrade); }
    if (t.closest("[data-manage]")) return openManage();
    if (t.closest("[data-downgrade]")) return downgrade();
    const sw = t.closest("[data-switch]");
    if (sw) {
      db.billing = { ...db.billing, cycle: sw.dataset.switch, price: proPrice(sw.dataset.switch) };
      save(); openManage(); rerender();
      return toast("Billing switched to " + sw.dataset.switch);
    }
    const cy = t.closest("[data-cycle]"); if (cy) { ui.cycle = cy.dataset.cycle; return renderPricing(); }
    const c = t.closest("[data-connect]"); if (c) { e.stopPropagation(); return toggleConnect(c.dataset.connect); }
    const st = t.closest("[data-star]"); if (st) { draftRating = +st.dataset.star; return paintStars(draftRating); }
    const h = t.closest("[data-helpful]");
    if (h) {
      const r = db.reviews.find((x) => x.id === h.dataset.helpful);
      if (r && !db.helpfulVotes.includes(r.id)) { r.helpful++; db.helpfulVotes.push(r.id); save(); h.textContent = `👍 Helpful (${r.helpful})`; h.disabled = true; }
      return;
    }
    const m = t.closest("[data-msg]"); if (m) return toast("Messaging is coming soon — connect to stay in touch.");
    if (t.closest("[data-jump]")) { e.preventDefault(); $("#write-review")?.scrollIntoView({ behavior: "smooth" }); return; }
    if (t.closest("[data-close]")) { t.closest("dialog").close(); return; }
    const o = t.closest("[data-open]"); if (o) return openProfile(o.dataset.open);
    const chip = t.closest("[data-cat]"); if (chip) { ui.cat = chip.dataset.cat; refreshFilterOptions(); return rerender(); }
    const v = t.closest("[data-view]"); if (v) { e.preventDefault(); return setView(v.dataset.view); }
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && e.target.matches(".card[data-open]")) openProfile(e.target.dataset.open);
  });
  $$("dialog").forEach((d) => d.addEventListener("click", (e) => { if (e.target === d) d.close(); }));

  $("#q").addEventListener("input", (e) => { ui.q = e.target.value; renderGrid(); });
  $("#fSub").addEventListener("change", (e) => { ui.sub = e.target.value; renderGrid(); });
  /* License filters are Pro-only: Free users get the upgrade prompt instead. */
  const proFilter = (key, reason) => (e) => {
    if (!isPro() && e.target.value) { e.target.value = ""; ui[key] = ""; return openCheckout(reason); }
    ui[key] = e.target.value; renderGrid();
  };
  $("#fState").addEventListener("change", proFilter("state", "Filtering by license state"));
  $("#fLicType").addEventListener("change", proFilter("licType", "Filtering by license type"));
  $("#fExp").addEventListener("input", (e) => { ui.exp = +e.target.value; $("#fExpVal").textContent = ui.exp; renderGrid(); });
  $("#fRating").addEventListener("change", (e) => { ui.rating = +e.target.value; renderGrid(); });
  $("#fVerified").addEventListener("change", (e) => { ui.verified = e.target.checked; renderGrid(); });
  $("#fAvail").addEventListener("change", (e) => { ui.avail = e.target.checked; renderGrid(); });
  $("#sort").addEventListener("change", (e) => { ui.sort = e.target.value; renderGrid(); });
  $("#clearFilters").addEventListener("click", () => {
    Object.assign(ui, { cat: "", q: "", sub: "", state: "", licType: "", exp: 0, rating: 0, verified: false, avail: false });
    $("#q").value = ""; $("#fExp").value = 0; $("#fExpVal").textContent = 0; $("#fRating").value = 0;
    $("#fVerified").checked = false; $("#fAvail").checked = false;
    refreshFilterOptions(); rerender();
  });
  $("#resetData").addEventListener("click", () => {
    if (!confirm("Reset all demo data? Your profile, reviews and connections will be removed.")) return;
    try { localStorage.removeItem(KEY); } catch (e) { /* ignore */ }
    db = load(); rerender(); toast("Demo data reset");
  });

  handleStripeReturn();
  setupJoin();
  refreshFilterOptions();
  rerender();
})();
