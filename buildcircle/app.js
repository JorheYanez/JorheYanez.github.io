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
      if (raw) return JSON.parse(raw);
    } catch (e) { /* storage unavailable */ }
    const seed = JSON.parse(JSON.stringify(window.BC_SEED));
    return { pros: seed.pros, reviews: seed.reviews, myId: null, network: [], helpfulVotes: [], events: [] };
  }
  let db = load();
  function save() { try { localStorage.setItem(KEY, JSON.stringify(db)); } catch (e) { /* ignore */ } }

  const ui = { cat: "", q: "", sub: "", state: "", licType: "", exp: 0, rating: 0, verified: false, avail: false, sort: "rating", view: "browse" };

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
        const hay = [p.name, p.sub, p.category, p.location, p.headline, p.bio, ...(p.tags || []), ...p.licenses.map((l) => l.type + " " + l.number)].join(" ").toLowerCase();
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
        ${p.licenses.slice(0, 2).map((l) => `<span class="tag">${esc(l.type)} · ${esc(l.state)}</span>`).join("")}
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
          <div>“${esc(it.r.text)}”</div><time>${ago(it.date)} · ${esc(it.r.project)}</time></div></div>`;
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
  let draftRating = 0;
  function openProfile(id) {
    const p = proById(id); if (!p) return;
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
          <h2>${esc(p.name)}</h2>
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
            ${p.licenses.length ? p.licenses.map((l) => `<div class="lic"><div><b>${esc(l.type)}</b><br><span class="muted">#${esc(l.number)} · ${esc(l.state)} · exp. ${esc(l.expires || "n/a")}</span></div>
              <div>${isExpired(l) ? '<span class="badge warn">Expired</span>' : l.verified ? '<span class="badge ok">✔ Verified</span>' : '<span class="badge warn">Pending</span>'}</div></div>`).join("") : '<span class="muted">No licenses listed.</span>'}
          </div>
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
          ${rs.length ? rs.map((r) => `<div class="review">
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
        bio: f.get("bio").trim(), tags: f.get("tags").split(",").map((t) => t.trim()).filter(Boolean), licenses, connections: 0, joined: new Date().toISOString()
      };
      db.pros.push(p); db.myId = p.id; save();
      $("#joinDlg").close(); e.target.reset(); syncSubs();
      rerender(); openProfile(p.id);
      toast("Profile published! Licenses show as pending until verified.");
    });
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
    $("#meLabel").textContent = me() ? "Signed in as " + me().name : "";
    $("#joinBtn").textContent = me() ? "My profile" : "Join as a pro";
  }

  /* ---------- events ---------- */
  document.addEventListener("click", (e) => {
    const t = e.target;
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
  $("#fState").addEventListener("change", (e) => { ui.state = e.target.value; renderGrid(); });
  $("#fLicType").addEventListener("change", (e) => { ui.licType = e.target.value; renderGrid(); });
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

  setupJoin();
  refreshFilterOptions();
  rerender();
})();
