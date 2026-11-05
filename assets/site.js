/* The wheel on the home page. A thank-you note streams in as it spins, and it stops on a research thread.
   The hub is the verifier: green check or red cross. */
(function () {
  "use strict";
  var el = document.getElementById("wheel");
  if (!el) return;

  var INK = "#0F1B2D", GOLD = "#F5B82E", GOOD = "#1DB36B", BAD = "#E5484D";
  var THREADS = [
    { label: "POST-TRAINING", color: "#FF5A1F", tag: "Paper · NeurIPS 2025 workshop", title: "RL in Name Only?", line: "GRPO-style RL post-training reduces to filtered iterative supervised fine-tuning, and the structure of the LLM MDP explains why responses get longer.", href: "papers/rl-in-name-only.html" },
    { label: "RLVR TRACES", color: GOLD, dark: true, tag: "Paper · NeurIPS 2025 workshop", title: "Local Coherence or Global Validity?", line: "Do the reasoning traces that RL with verifiable rewards produces stay valid from step to step, or only look coherent locally? A study on math problems.", href: "papers/local-coherence.html" },
    { label: "REASONING", color: "#14A39A", tag: "Position paper", title: "Stop Anthropomorphizing Intermediate Tokens", line: "Why we should not read a model's intermediate tokens as human-like thinking traces.", href: "https://arxiv.org/abs/2504.09762" },
    { label: "HINGE LOSS", color: "#2F5BEA", tag: "Ongoing work", title: "GRPO-Unhinged", line: "With binary rewards the clipped GRPO update is a weighted hinge loss on outcome-labeled tokens, which places RLVR in classification-based policy iteration.", href: "projects/grpo-unhinged.html" },
    { label: "PROMPT AUG", color: "#7A55E0", tag: "Paper · under review, ICLR 2027", title: "RLVR as Prompt Augmentation", line: "The optimal RLVR policy is the base policy conditioned on success, so it reinforces any reasoning that reaches the correct answer, valid or not.", href: "papers/prompt-augmentation.html" },
    { label: "RL FOR ROBOTICS", fs: 10.5, color: "#F7F9FB", dark: true, tag: "Paper · ICRA 2022", title: "Dynamic Mirror Descent MPC", line: "Model-based lookahead that makes off-policy RL more sample-efficient, tested on MuJoCo and a real quadruped.", href: "https://soumyarani.github.io/DMD-MPC-RL/" }
  ];
  // One message per spin. The first plays by itself when the page opens.
  var ROUNDS = [
    { tokens: ["Thank", "you", "for", "visiting", "my", "profile,", "I", "appreciate", "you"], pop: "Thank you!" },
    { tokens: ["You", "spun", "again,", "I", "really", "appreciate", "it"], pop: "Appreciate it!" },
    { tokens: ["Still", "here?", "That", "means", "a", "lot"], pop: "You are awesome!" }
  ];
  var round = 0, TOKENS = ROUNDS[0].tokens, FINAL = "✨", THANKS = ROUNDS[0].pop;
  // Surprise facts, all from the November 2026 resume. They play in a loop after the wheel stops.
  var FACTS = [
    { k: "From Civil Engineering to RL", t: "Before computer science, I was an Assistant Executive Engineer in the Roads and Buildings Department of the Government of Telangana." },
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
    node("path", { d: "M" + p0 + " A" + R + "," + R + " 0 0 1 " + p1 + " L" + p2 + " A" + HUB + "," + HUB + " 0 0 0 " + p3 + " Z", fill: t.color, stroke: INK, "stroke-width": 3 }, g);
    var mid = a0 + SEG / 2, m = polar((R + HUB) / 2 + 8, mid);
    var tx = node("text", { x: m[0], y: m[1], transform: "rotate(" + mid + " " + m[0] + " " + m[1] + ")", "text-anchor": "middle", "dominant-baseline": "central", "font-size": t.fs || 12.5, "font-weight": 800, "letter-spacing": 1, style: "fill:" + (t.dark ? INK : "#fff") }, g);
    tx.textContent = t.label;
  });
  // hub: the verifier, split into a green check and a red cross. It turns with the wheel.
  node("circle", { cx: 0, cy: 0, r: HUB, fill: INK }, g);
  var dr = HUB - 9;
  node("path", { d: "M0," + (-dr) + " A" + dr + "," + dr + " 0 0 0 0," + dr + " Z", fill: GOOD }, g);
  node("path", { d: "M0," + (-dr) + " A" + dr + "," + dr + " 0 0 1 0," + dr + " Z", fill: BAD }, g);
  node("line", { x1: 0, y1: -dr, x2: 0, y2: dr, stroke: INK, "stroke-width": 3 }, g);
  node("polyline", { points: "-34,2 -24,13 -8,-9", fill: "none", stroke: "#fff", "stroke-width": 7, "stroke-linecap": "round", "stroke-linejoin": "round" }, g);
  node("path", { d: "M9,-9 L25,9 M25,-9 L9,9", fill: "none", stroke: "#fff", "stroke-width": 7, "stroke-linecap": "round" }, g);
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
    var s = document.createElement("span"); s.className = "tok" + (cls ? " " + cls : ""); s.textContent = text; stream.appendChild(s);
  }
  function fullStream() { stream.innerHTML = ""; TOKENS.forEach(function (t) { tok(t); }); tok(FINAL, "gold"); tok(THANKS, "ok"); }
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
      if (w > 6) { requestAnimationFrame(frame); return; }
      spinning = false; btn.disabled = false;
      while (n < TOKENS.length) { tok(TOKENS[n]); n++; }
      tok(FINAL, "gold"); stage(1);
      setTimeout(function () { tok(THANKS, "ok"); landed = indexAt(); burst(THANKS); startFacts(); round++; btn.hidden = false; }, 450);
    }
    requestAnimationFrame(frame);
  }

  function burst(msg) {
    var b = document.createElement("div"); b.className = "burst"; b.setAttribute("aria-hidden", "true");
    for (var i = 0; i < 16; i++) {
      var sp = document.createElement("span"); sp.textContent = i % 3 ? "✨" : "★";
      var a = (i / 16) * 2 * Math.PI + Math.random() * 0.3, d = 120 + Math.random() * 110;
      sp.style.setProperty("--dx", (Math.cos(a) * d).toFixed(0) + "px");
      sp.style.setProperty("--dy", (Math.sin(a) * d).toFixed(0) + "px");
      sp.style.animationDelay = (Math.random() * 0.15).toFixed(2) + "s";
      if (!(i % 3)) sp.style.color = ["#F5B82E", "#FF5A1F", "#14A39A", "#7A55E0"][i % 4];
      b.appendChild(sp);
    }
    var t = document.createElement("strong"); t.className = "burst-thanks"; t.textContent = msg || "Thank you!"; b.appendChild(t);
    box.appendChild(b);
    setTimeout(function () { b.remove(); }, 2600);
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

  apply(); intro(); stream.innerHTML = "";
  btn.addEventListener("click", spin);
  el.addEventListener("click", spin);
  btn.hidden = true;
  setTimeout(spin, 1200); // the first spin plays by itself when the page opens
})();
