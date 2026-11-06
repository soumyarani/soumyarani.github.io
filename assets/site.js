/* The wheel on the home page spins while a thank-you streams in.
   Chinni, a small guide in the corner, shows findings from my work. */
(function () {
  "use strict";
  var el = document.getElementById("wheel");
  if (!el) return;

  var INK = "#0F1B2D", GOLD = "#F5B82E", GOOD = "#1DB36B", BAD = "#E5484D";
  // Hub: RL and LLMs. Outside: the topics, in a soft spectrum of light colours.
  var RLC = "#4C4AA6", LLMC = "#F2AE57";
  // Two anchor colours in the hub (indigo RL, amber LLMs); the slices form one loop from the warm family into the cool one.
  var THREADS = [
    { label: "POST-TRAINING", color: "#F6C65B", dark: true },
    { label: "REASONING", color: "#F2AE57", dark: true },
    { label: "RLVR TRACES", color: "#EE8F5A" },
    { label: "EVALUATION", color: "#E67373" },
    { label: "AGENTS", color: "#E082B0" },
    { label: "PROMPT AUG", color: "#A08BE6" },
    { label: "DEEP LEARNING", color: "#7471D8", fs: 10.5 },
    { label: "ROBOTICS", color: "#6593E8" },
    { label: "DECISION MAKING", color: "#62B7E4", fs: 10 },
    { label: "ONLINE LEARNING", color: "#56B8A9", fs: 10 }
  ];
  // One message per spin. The first plays by itself when the page opens.
  var ROUNDS = [
    { tokens: ["Thank", "you", "for", "visiting", "my", "profile,", "\n", "I", "appreciate", "you"], pop: "Thank you!" },
    { tokens: ["You", "spun", "again,", "\n", "I", "really", "appreciate", "it"], pop: "Appreciate it!" },
    { tokens: ["Still", "here?", "\n", "That", "means", "a", "lot"], pop: "You are awesome!" }
  ];
  var round = 0, TOKENS = ROUNDS[0].tokens;
  // Findings for Chinni to show, each with its own label, all from the November 2026 resume.
  var FACTS = [
    { l: "Where she started", k: "From Civil Engineering to RL Research", t: "Before computer science, Soumya was an Assistant Executive Engineer in the Roads and Buildings Department of the Government of Telangana." },
    { l: "A milestone", k: "Rank 136", t: "Soumya ranked 136 out of 107,893 in GATE Computer Science and Engineering 2018." },
    { l: "Impactful result", k: "Real robots", t: "Her M.Tech method doubled sample efficiency on a real robot arm and quadruped (ICRA\u00a02022)." },
    { l: "Engineering result", k: "Microseconds", t: "She wrote a quadruped controller in lightweight C++ that runs in microseconds, down from the milliseconds in the source paper." },
    { l: "Industry impact", k: "A patent", t: "She is a co-inventor on a US patent application for scheduling manufacturing jobs." },
    { l: "Industry research", k: "Energy markets", t: "At Microsoft Research India she built the RL framework for a renewable-energy market, with carbon arbitrage and profit maximization." },
    { l: "A collaboration", k: "Rollouts", t: "She worked with Prof.\u00a0Dimitri\u00a0Bertsekas on rollouts at every decoding step of an LLM, tested on Game\u00a0of\u00a024." },
    { l: "Key insight", k: "The hinge", t: "With binary rewards, the clipped GRPO update is a weighted hinge loss. That is the idea behind her ongoing work, GRPO-Unhinged." },
    { l: "Surprising finding", k: "Right answer, wrong reasons", t: "After RLVR, correct answers reached through incoherent reasoning go up in every setting she tested." }
  ];
  var N = THREADS.length, SEG = 360 / N, R = 200, HUB = 66, NS = "http://www.w3.org/2000/svg";
  var theta = -SEG / 2; // wheel rotation in degrees, clockwise. Starts centred on segment 0.
  var spinning = false;

  function polar(r, deg) { var a = deg * Math.PI / 180; return [r * Math.cos(a), r * Math.sin(a)]; }
  function node(name, attrs, parent) {
    var n = document.createElementNS(NS, name);
    for (var k in attrs) n.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(n);
    return n;
  }

  el.setAttribute("viewBox", "-232 -270 464 500");
  node("circle", { cx: 0, cy: 0, r: R + 24, fill: INK }, el);
  // trail of tokens that grows toward the pointer
  for (var k = 0; k < 20; k++) {
    var ang = -90 - (19 - k) * 13.5 - 7, p = polar(R + 12, ang);
    node("circle", { cx: p[0], cy: p[1], r: 1.4 + 4.4 * Math.pow(k / 19, 1.15), fill: k === 19 ? GOLD : "#fff", "fill-opacity": (0.45 + 0.55 * k / 19).toFixed(2) }, el);
  }
  var g = node("g", {}, el);
  THREADS.forEach(function (t, i) {
    var a0 = -90 + i * SEG, a1 = a0 + SEG;
    var p0 = polar(R, a0), p1 = polar(R, a1), p2 = polar(HUB, a1), p3 = polar(HUB, a0);
    if (t.split) {
      var am = a0 + SEG / 2, pm = polar(R, am), pmh = polar(HUB, am);
      node("path", { d: "M" + p0 + " A" + R + "," + R + " 0 0 1 " + pm + " L" + pmh + " A" + HUB + "," + HUB + " 0 0 0 " + p3 + " Z", fill: t.split[0] }, g);
      node("path", { d: "M" + pm + " A" + R + "," + R + " 0 0 1 " + p1 + " L" + p2 + " A" + HUB + "," + HUB + " 0 0 0 " + pmh + " Z", fill: t.split[1] }, g);
      node("path", { d: "M" + p0 + " A" + R + "," + R + " 0 0 1 " + p1 + " L" + p2 + " A" + HUB + "," + HUB + " 0 0 0 " + p3 + " Z", fill: "none", stroke: INK, "stroke-width": 3 }, g);
    } else {
      node("path", { d: "M" + p0 + " A" + R + "," + R + " 0 0 1 " + p1 + " L" + p2 + " A" + HUB + "," + HUB + " 0 0 0 " + p3 + " Z", fill: t.color, stroke: INK, "stroke-width": 3 }, g);
    }
    var mid = a0 + SEG / 2, m = polar((R + HUB) / 2 + 8, mid);
    var tx = node("text", { x: m[0], y: m[1], transform: "rotate(" + mid + " " + m[0] + " " + m[1] + ")", "text-anchor": "middle", "dominant-baseline": "central", "font-size": t.fs || 11.5, "font-weight": 800, "letter-spacing": 1, style: "fill:" + (t.dark ? INK : "#fff") + (!t.dark ? ";paint-order:stroke;stroke:rgba(15,27,45,.35);stroke-width:2px" : "") + (t.split ? ";paint-order:stroke;stroke:#0F1B2D;stroke-width:3px;stroke-linejoin:round" : "") }, g);
    tx.textContent = t.label;
  });
  // hub: RL on one half, LLMs on the other. The dividing line runs through the two shared slices.
  node("circle", { cx: 0, cy: 0, r: HUB, fill: INK }, g);
  var dr = HUB - 9, hub = node("g", { transform: "rotate(" + (SEG * 0.75 + 4) + ")" }, g); // offset so the hub split never lines up with a slice edge
  node("path", { d: "M0," + (-dr) + " A" + dr + "," + dr + " 0 0 0 0," + dr + " Z", fill: RLC }, hub);
  node("path", { d: "M0," + (-dr) + " A" + dr + "," + dr + " 0 0 1 0," + dr + " Z", fill: LLMC }, hub);
  node("circle", { cx: 0, cy: 0, r: dr, fill: "none", stroke: "#FFFFFF", "stroke-width": 3 }, hub);
  var t1 = node("text", { x: -dr / 2 + 2, y: 1, "text-anchor": "middle", "dominant-baseline": "central", "font-size": 20, "font-weight": 800, style: "fill:#fff" }, hub); t1.textContent = "RL";
  var t2 = node("text", { x: dr / 2 - 2, y: 1, "text-anchor": "middle", "dominant-baseline": "central", "font-size": 15, "font-weight": 800, style: "fill:#0F1B2D" }, hub); t2.textContent = "LLMs";
  // pointer (fixed)
  node("path", { d: "M-17,-270 L17,-270 L17,-244 L0,-224 L-17,-244 Z", fill: GOLD, stroke: INK, "stroke-width": 4, "stroke-linejoin": "round" }, el);
  node("circle", { cx: 0, cy: -257, r: 3.5, fill: INK }, el);

  var box = el.parentNode;
  var stream = document.getElementById("stream");

  function apply() { g.setAttribute("transform", "rotate(" + theta.toFixed(2) + ")"); }
  function tok(text) {
    if (text === "\n") { var br = document.createElement("i"); br.className = "tok-br"; stream.appendChild(br); return; }
    var s = document.createElement("span"); s.className = "tok"; s.textContent = text;
    // colour each word with the wheel's palette, in order
    var k = stream.querySelectorAll(".tok").length, t = THREADS[k % THREADS.length];
    s.style.background = t.color; s.style.color = t.dark ? INK : "#fff"; s.style.borderColor = "transparent";
    stream.appendChild(s);
  }
  function fullStream() { stream.innerHTML = ""; TOKENS.forEach(function (t) { tok(t); }); }

  // The wheel spins slowly and glides to a stop while the thank-you writes itself out, word by word.
  function spin() {
    if (spinning) return;
    var R0 = ROUNDS[Math.min(round, ROUNDS.length - 1)]; TOKENS = R0.tokens; round++;
    var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) { fullStream(); return; }
    spinning = true;
    var D = 7000, t0 = performance.now(), from = theta, turns = 360 * (2.2 + Math.random() * 0.8), n = 0;
    var gap = (D * 0.8) / TOKENS.length;
    stream.innerHTML = ""; stream.classList.add("typing");
    function frame(now) {
      var t = Math.min(1, (now - t0) / D);
      theta = from + turns * (1 - Math.pow(1 - t, 4)); apply();
      while (n < TOKENS.length && now - t0 >= n * gap) { tok(TOKENS[n]); n++; }
      if (t < 1) { requestAnimationFrame(frame); return; }
      while (n < TOKENS.length) { tok(TOKENS[n]); n++; }
      stream.classList.remove("typing"); spinning = false;
    }
    requestAnimationFrame(frame);
  }
  // Reserve room for the longest thank-you, so nothing below the wheel moves while it streams.
  function sizeStream() {
    if (spinning) return;
    var keep = stream.innerHTML, max = 0, saved = TOKENS; stream.style.minHeight = "";
    ROUNDS.forEach(function (r) { TOKENS = r.tokens; fullStream(); max = Math.max(max, stream.offsetHeight); });
    TOKENS = saved; stream.innerHTML = keep; stream.style.minHeight = max + "px";
  }
  apply(); sizeStream();
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(sizeStream);
  window.addEventListener("resize", sizeStream);
  el.addEventListener("click", spin);
  setTimeout(spin, 900); // spins once by itself when the page opens; click the wheel to spin again

  /* ---------- Chinni: a small guide in the corner, separate from the page ---------- */
  var RES = ["Surprising finding", "Key insight", "Impactful result", "A collaboration"];
  function shuffled(a) { return a.sort(function () { return Math.random() - 0.5; }); }
  var idx = FACTS.map(function (_, i) { return i; });
  var order = shuffled(idx.filter(function (i) { return RES.indexOf(FACTS[i].l) >= 0; }))
    .concat(shuffled(idx.filter(function (i) { return RES.indexOf(FACTS[i].l) < 0; }))), pos = -1, typeT = null;

  var root = document.createElement("div"); root.className = "chinni";
  root.innerHTML =
    '<div class="ch-bubble" hidden><button class="ch-x" type="button" aria-label="Dismiss">×</button>' +
      '<p><b>Hi, I’m Chinni.</b> Want to see something from Soumya’s work?</p><button class="ch-yes" type="button">Show me</button></div>' +
    '<div class="ch-panel" role="dialog" aria-label="Chinni" hidden>' +
      '<div class="ch-head"><span class="ch-av" aria-hidden="true">✦</span><div><b>Chinni</b><small>A guide to Soumya’s work</small></div>' +
      '<button class="ch-close" type="button" aria-label="Close">×</button></div>' +
      '<div class="ch-body" aria-live="polite"></div>' +
      '<div class="ch-foot"><button class="ch-next" type="button">Show me another</button></div></div>' +
    '<button class="ch-fab" type="button" aria-label="Open Chinni"><span class="ch-av" aria-hidden="true">✦</span><span class="ch-name">Chinni</span></button>';
  document.body.appendChild(root);
  var bubble = root.querySelector(".ch-bubble"), panel = root.querySelector(".ch-panel"), body = root.querySelector(".ch-body"), fab = root.querySelector(".ch-fab");

  function store(k, v) { try { if (v === undefined) return sessionStorage.getItem(k); sessionStorage.setItem(k, v); } catch (e) { return null; } }
  function showFact() {
    pos = (pos + 1) % order.length; var f = FACTS[order[pos]];
    body.innerHTML = '<p class="ch-label"></p><h3></h3><p class="ch-text"></p>';
    body.querySelector(".ch-label").textContent = f.l; body.querySelector("h3").textContent = f.k;
    var p = body.querySelector(".ch-text"), words = f.t.split(" "), i = 0; clearTimeout(typeT);
    (function next() { if (i >= words.length) return; p.textContent += (i ? " " : "") + words[i++]; typeT = setTimeout(next, 90); })();
  }
  function open() { bubble.hidden = true; panel.hidden = false; root.classList.add("open"); store("chinni-seen", "1"); if (pos < 0) { body.innerHTML = '<p class="ch-hi">Hi, I’m Chinni. Here is something from Soumya’s work.</p>'; setTimeout(showFact, 700); } }
  function close() { panel.hidden = true; root.classList.remove("open"); clearTimeout(typeT); }
  fab.addEventListener("click", function () { panel.hidden ? open() : close(); });
  root.querySelector(".ch-yes").addEventListener("click", open);
  bubble.querySelector("p").addEventListener("click", open);
  root.querySelector(".ch-x").addEventListener("click", function () { bubble.hidden = true; store("chinni-seen", "1"); });
  root.querySelector(".ch-close").addEventListener("click", close);
  root.querySelector(".ch-next").addEventListener("click", showFact);
  document.addEventListener("keydown", function (e) { if (e.key === "Escape" && !panel.hidden) close(); });
  // the bubble says hello once the wheel has stopped, and only once per visit
  if (!store("chinni-seen")) setTimeout(function () { if (panel.hidden) bubble.hidden = false; }, 9500);
})();
