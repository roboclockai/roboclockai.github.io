(() => {
  'use strict';
  const data = window.ROBOCLOCK_REAL;
  if (!data) return;
  const $ = (s) => document.querySelector(s);
  const el = (tag, className, text) => {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text != null) node.textContent = text;
    return node;
  };
  const categoryNames = { A: 'Temporal Window', B: 'Event-Reactive', C: 'Throughput' };
  const fmt = (v) => (Number.isInteger(v) ? String(v) : v.toFixed(1));

  // Task cards: side photo by default, the model's head-camera view on request.
  const grid = $('#real-task-grid');
  data.tasks.forEach((task) => {
    const card = el('article', 'real-task-card'); card.dataset.cat = task.category;
    const media = el('div', 'real-task-media');
    const img = el('img'); img.src = task.image; img.alt = `${task.code} ${task.name}: the real-robot scene`;
    img.width = 900; img.height = 900; img.loading = 'lazy'; img.decoding = 'async';
    const tag = el('span', 'category-tag', `${task.category} · ${categoryNames[task.category]}`);
    const view = el('button', 'real-view-toggle', 'Robot view'); view.type = 'button'; view.setAttribute('aria-pressed', 'false');
    view.addEventListener('click', () => {
      const head = view.getAttribute('aria-pressed') !== 'true';
      view.setAttribute('aria-pressed', String(head));
      view.textContent = head ? 'Scene photo' : 'Robot view';
      img.src = head ? task.head : task.image;
      img.alt = head ? `${task.code} ${task.name}: first head-camera image, as the model sees it` : `${task.code} ${task.name}: the real-robot scene`;
      media.classList.toggle('head-view', head);
    });
    media.append(img, tag, view);
    const body = el('div', 'real-task-body');
    const title = el('h3'); title.append(el('span', 'task-code', task.code), document.createTextNode(' ' + task.name));
    const dl = el('dl', 'real-task-facts');
    const fact = (k, v) => { dl.append(el('dt', null, k), el('dd', null, v)); };
    fact(task.outcomeJudged ? 'Requirement' : 'Time requirement', task.requirement);
    if (task.standard) fact('Human standard time', task.standard);
    fact('Step points', task.rubric);
    body.append(title, el('p', null, task.description), dl);
    card.append(media, body); grid.append(card);
  });

  // Results table with a metric switch.
  const metrics = ['PS', 'PSR', 'LTSR'];
  let metric = 2;
  const tbody = $('#real-results-body');
  const render = () => {
    const columns = data.tasks.length + 1;
    const best = Array.from({ length: columns }, (_, c) => Math.max(...data.results.map((r) => (c < data.tasks.length ? r.scores[c] : r.mean)[metric])));
    tbody.replaceChildren();
    data.results.forEach((row) => {
      const tr = el('tr');
      const th = el('th', 'leaderboard-model', row.model); th.scope = 'row'; tr.append(th);
      [...row.scores, row.mean].forEach((s, c) => {
        const isMean = c === data.tasks.length;
        const v = s[metric]; const td = el('td', isMean ? 'real-mean' : null, isMean ? v.toFixed(1) : fmt(v));
        if (v > 0 && v === best[c]) td.classList.add('best');
        if (v === 0) td.classList.add('zero');
        tr.append(td);
      });
      tbody.append(tr);
    });
    document.querySelectorAll('[data-real-metric]').forEach((b) => {
      const on = Number(b.dataset.realMetric) === metric;
      b.classList.toggle('active', on); b.setAttribute('aria-pressed', String(on));
    });
    $('#real-metric-name').textContent = metrics[metric];
  };
  document.querySelectorAll('[data-real-metric]').forEach((b) => b.addEventListener('click', () => { metric = Number(b.dataset.realMetric); render(); }));
  render();

  // B1 case study: model switcher with the head-camera recording and four key frames.
  const caseHost = $('#b1-case-tabs');
  const video = $('#b1-video');
  const frameLabels = ['Red onset', 'First motion', 'Grasp', 'End'];
  const select = (entry) => {
    caseHost.querySelectorAll('button').forEach((b) => { const on = b.dataset.case === entry.id; b.classList.toggle('active', on); b.setAttribute('aria-pressed', String(on)); });
    video.pause();
    video.poster = `assets/images/real-robot/b1-case/${entry.id}_1.webp`;
    video.src = `assets/videos/real-robot/b1/${entry.id}.mp4`;
    video.setAttribute('aria-label', `${entry.model} on task B1, head-camera recording`);
    $('#b1-model').textContent = entry.model;
    const t = (v) => (v == null ? 'not reached' : v.toFixed(2) + ' s');
    $('#b1-start').textContent = t(entry.start);
    $('#b1-grasp').textContent = t(entry.grasp);
    $('#b1-placed').textContent = t(entry.placed);
    $('#b1-ps').textContent = String(entry.ps);
    const frames = $('#b1-frames'); frames.replaceChildren();
    frameLabels.forEach((label, i) => {
      const fig = el('figure');
      const img = el('img'); img.src = `assets/images/real-robot/b1-case/${entry.id}_${i + 1}.webp`; img.loading = 'lazy';
      img.alt = `${entry.model}, ${label.toLowerCase()}`; img.width = 640; img.height = 480;
      const cap = label === 'Grasp' && entry.grasp == null ? '30 s after red' : label;
      fig.append(img, el('figcaption', null, cap)); frames.append(fig);
    });
  };
  data.b1Case.forEach((entry) => {
    const b = el('button', null, entry.model); b.type = 'button'; b.dataset.case = entry.id;
    b.addEventListener('click', () => select(entry)); caseHost.append(b);
  });
  select(data.b1Case[0]);
})();
