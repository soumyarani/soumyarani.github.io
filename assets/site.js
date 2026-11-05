/* The wheel on the home page. A thank-you note streams in as it spins, and it stops on a research thread.
   The hub is the verifier: green check or red cross. */
(function () {
  "use strict";
  var el = document.getElementById("wheel");
  if (!el) return;

  var INK = "#0F1B2D", GOLD = "#F5B82E", GOOD = "#1DB36B", BAD = "#E5484D";
  // Hub: RL and LLMs. Outside: the topics, in a soft spectrum of light colours.
  var RLC = "#3730A3", LLMC = "#F59E0B";
  // Two anchor colours in the hub (indigo RL, amber LLMs); the slices form one loop from the warm family into the cool one.
  var THREADS = [
    { label: "POST-TRAINING", color: "#FBBF24", dark: true },
    { label: "REASONING", color: "#F59E0B", dark: true },
    { label: "RLVR TRACES", color: "#F97316" },
    { label: "EVALUATION", color: "#EF4444" },
    { label: "AGENTS", color: "#EC4899" },
    { label: "PROMPT AUG", color: "#8B5CF6" },
    { label: "DEEP LEARNING", color: "#4F46E5", fs: 10.5 },
    { label: "ROBOTICS", color: "#2563EB" },
    { label: "DECISION MAKING", color: "#0EA5E9", fs: 10 },
    { label: "ONLINE LEARNING", color: "#14B8A6", fs: 10 }
  ];
  // One message per spin. The first plays by itself when the page opens.
  var ROUNDS = [
    { tokens: ["Thank", "you", "for", "visiting", "my", "profile,", "\n", "I", "appreciate", "you 😊"], pop: "Thank you!" },
    { tokens: ["You", "spun", "again,", "\n", "I", "really", "appreciate", "it"], pop: "Appreciate it!" },
    { tokens: ["Still", "here?", "\n", "That", "means", "a", "lot"], pop: "You are awesome!" }
  ];
  var round = 0, TOKENS = ROUNDS[0].tokens, FINAL = "✨", THANKS = ROUNDS[0].pop;
  // Surprise facts, all from the November 2026 resume. They play in a loop after the wheel stops.
  var FACTS = [
    { k: "From Civil Engineering to RL Research", t: "Before computer science, I was an Assistant Executive Engineer in the Roads and Buildings Department of the Government of Telangana." },
    { k: "Rank 136", t: "I ranked 136 out of 107,893 in GATE Computer Science and Engineering 2018." },
    { k: "Real robots", t: "My M.Tech method doubled sample efficiency on a real robot arm and quadruped (ICRA 2022)." },
    { k: "Microseconds", t: "I wrote a quadruped controller in lightweight C++ that runs in microseconds, down from the milliseconds in the source paper." },
    { k: "A patent", t: "I am a co-inventor on a US patent application for scheduling manufacturing jobs." },
    { k: "Energy markets", t: "At Microsoft Research India I built the RL framework for a renewable-energy market, with carbon arbitrage and profit maximization." },
    { k: "Rollouts", t: "I worked with Prof. Dimitri Bertsekas on rollouts at every decoding step of an LLM, tested on Game of 24." },
    { k: "The hinge", t: "With binary rewards, the clipped GRPO update is a weighted hinge loss. That is the idea behind GRPO-Unhinged." },
    { k: "Right answer, wrong reasons", t: "After RLVR, correct answers reached through incoherent reasoning go up in every setting we tested." }
  ];
  var factTimer = null, factIdx = 0, landed = null;
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

  var card = document.getElementById("reward");
  var btn = document.getElementById("spin");
  var stages = [];
  var box = el.parentNode;
  var visits = null;
  var stream = document.getElementById("stream");

  function apply() { g.setAttribute("transform", "rotate(" + theta.toFixed(2) + ")"); }
  function indexAt() { var phi = (((-theta) % 360) + 360) % 360; return Math.floor(phi / SEG) % N; }
  function stage(n) { for (var i = 0; i < stages.length; i++) stages[i].classList.toggle("on", i === n); }
  function tok(text, cls) {
    if (text === "\n") { var br = document.createElement("i"); br.className = "tok-br"; stream.appendChild(br); return; }
    var s = document.createElement("span"); s.className = "tok" + (cls ? " " + cls : ""); s.textContent = text;
    // colour each word with the wheel's palette, in order
    var k = stream.querySelectorAll(".tok").length, t = THREADS[k % THREADS.length];
    if (cls === "gold") { s.style.background = LLMC; s.style.color = INK; }
    else if (cls === "ok") { s.style.background = RLC; s.style.color = "#fff"; }
    else { s.style.background = t.color; s.style.color = t.dark ? INK : "#fff"; }
    s.style.borderColor = "transparent";
    stream.appendChild(s);
  }
  function fullStream() { stream.innerHTML = ""; TOKENS.forEach(function (t) { tok(t); }); }
  function show(i) {
    var t = THREADS[i];
    card.innerHTML = "";
    var tg = document.createElement("div"); tg.className = "tagline eyebrow";
    var dot = document.createElement("span"); dot.className = "dot"; dot.style.background = t.color; if (t.dark && t.color !== GOLD) dot.style.boxShadow = "inset 0 0 0 1px " + INK;
    tg.appendChild(dot); tg.appendChild(document.createTextNode(t.tag));
    var h = document.createElement("h3"); var a = document.createElement("a"); a.href = t.href; a.textContent = t.title; h.appendChild(a);
    var p = document.createElement("p"); p.textContent = t.line;
    card.appendChild(tg); card.appendChild(h); card.appendChild(p);
  }

  function spin() {
    if (spinning) return;
    var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) { var Rr = ROUNDS[Math.min(round, ROUNDS.length - 1)]; TOKENS = Rr.tokens; THANKS = Rr.pop; theta = -(Math.floor(Math.random() * N) * SEG + SEG / 2); apply(); fullStream(); landed = indexAt(); startFacts(); round++; btn.hidden = false; return; }
    var R0 = ROUNDS[Math.min(round, ROUNDS.length - 1)]; TOKENS = R0.tokens; THANKS = R0.pop;
    spinning = true; btn.disabled = true;
    var w = 750 + Math.random() * 350, last = performance.now(), k = 1.05, lastSlice = Math.floor(theta / SEG), n = 0;
    stream.innerHTML = "";
    if (round > 0) card.innerHTML = '<div class="tagline eyebrow">✨ Spinning</div><h3>Here comes another surprise…</h3>';
    stage(0);
    function frame(now) {
      var dt = Math.min(0.05, (now - last) / 1000); last = now;
      theta += w * dt; w *= Math.exp(-k * dt);
      apply();
      var slice = Math.floor(theta / SEG);
      if (slice !== lastSlice) { lastSlice = slice; if (n < TOKENS.length) { tok(TOKENS[n]); n++; } }
      if (w > 22) { requestAnimationFrame(frame); return; } // stop before the slow crawl at the end
      spinning = false; btn.disabled = false;
      while (n < TOKENS.length) { tok(TOKENS[n]); n++; }
      stage(1);
      landed = indexAt(); burst(THANKS); startFacts(); round++; btn.hidden = false;
    }
    requestAnimationFrame(frame);
  }

  function burst(msg) {
    var b = document.createElement("div"); b.className = "burst"; b.setAttribute("aria-hidden", "true");
    for (var i = 0; i < 10; i++) {
      var sp = document.createElement("span"); sp.textContent = i % 3 ? "✨" : "★";
      var a = (i / 10) * 2 * Math.PI + Math.random() * 0.3, d = 80 + Math.random() * 60;
      sp.style.setProperty("--dx", (Math.cos(a) * d).toFixed(0) + "px");
      sp.style.setProperty("--dy", (Math.sin(a) * d).toFixed(0) + "px");
      sp.style.animationDelay = (Math.random() * 0.15).toFixed(2) + "s";
      if (!(i % 3)) sp.style.color = ["#F5B82E", "#FF5A1F", "#14A39A", "#7A55E0"][i % 4];
      b.appendChild(sp);
    }
    var t = document.createElement("strong"); t.className = "burst-thanks"; t.textContent = msg || "Thank you!"; b.appendChild(t);
    box.appendChild(b);
    setTimeout(function () { b.remove(); }, 2200);
  }
  function renderFact() {
    var f = FACTS[factIdx % FACTS.length];
    card.innerHTML = "";
    var tg = document.createElement("div"); tg.className = "tagline eyebrow";
    tg.textContent = "✨ Surprise";
    var h = document.createElement("h3"); h.textContent = f.k;
    var p = document.createElement("p"); p.textContent = f.t; p.className = "fact-text";
    card.appendChild(tg); card.appendChild(h); card.appendChild(p);
  }
  // each spin reveals the next surprise, in a shuffled order with no repeats until all are seen
  var order = FACTS.map(function (_, i) { return i; }).sort(function () { return Math.random() - 0.5; }), pos = -1;
  function startFacts() {
    pos = (pos + 1) % order.length; factIdx = order[pos]; renderFact();
    btn.textContent = "Spin the wheel for another surprise ✨";
  }
  function intro() {
    card.innerHTML = '<div class="tagline eyebrow">✨ For you</div><h3>I have a surprise for you, for visiting.</h3><p>Watch the wheel…</p>';
  }

  // Size the surprise box to its longest surprise, so the box never grows or shrinks between spins.
  function sizeCard() {
    card.style.minHeight = ""; var keep = card.innerHTML, max = 0, saved = factIdx;
    for (var i = 0; i < FACTS.length; i++) { factIdx = i; renderFact(); max = Math.max(max, card.offsetHeight); }
    factIdx = saved; card.innerHTML = keep; card.style.minHeight = max + "px";
  }
  apply(); sizeCard(); intro(); stream.innerHTML = "";
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { var k = card.innerHTML; sizeCard(); card.innerHTML = k; });
  window.addEventListener("resize", function () { var k = card.innerHTML; sizeCard(); card.innerHTML = k; });
  btn.addEventListener("click", spin);
  el.addEventListener("click", spin);
  btn.hidden = true;
  setTimeout(spin, 1200); // the first spin plays by itself when the page opens
})();

