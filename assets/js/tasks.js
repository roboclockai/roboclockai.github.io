(() => {
  'use strict';
  const data = window.ROBOCLOCK_DATA;
  const config = window.ROBOCLOCK_CONFIG || {};
  if (!data) return;
  const $ = (selector) => document.querySelector(selector);
  const $$ = (selector) => Array.from(document.querySelectorAll(selector));
  const el = (tag, className, text) => {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text != null) node.textContent = text;
    return node;
  };
  const categoryNames = { A: 'Temporal Window', B: 'Event-Reactive', C: 'Throughput' };
  const categoryDescriptions = {
    A: 'The target physical event must occur in its valid time window. Both early and late actions can violate the task.',
    B: 'An external event creates a response obligation. The robot must detect the cue and act before its response deadline.',
    C: 'Correct completions must meet the task’s required rate, time budget, or recurring service demand.',
  };
  const domainName = (id) => data.domains.find((d) => d.id === id)?.name || id;

  // Autoplay clips: muted, looping head-camera previews that load and play only while on screen.
  const reducedMotionClips = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const clipObserver = 'IntersectionObserver' in window ? new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      const v = entry.target;
      if (entry.isIntersecting) { if (!v.src && v.dataset.src) v.src = v.dataset.src; const p = v.play && v.play(); if (p && p.catch) p.catch(() => {}); }
      else if (v.pause) v.pause();
    });
  }, { rootMargin: '120px' }) : null;
  const watchClip = (video) => { if (clipObserver && !reducedMotionClips) clipObserver.observe(video); };
  const previewOf = (task) => task.video ? task.video.replace(/demo\.mp4$/, 'preview.mp4') : null;
  const clip = (task, className, label) => {
    const src = previewOf(task);
    if (!src || !clipObserver || reducedMotionClips) {
      const image = el('img', className); image.src = task.thumbnail; image.alt = label; image.width = 600; image.height = 400; image.loading = 'lazy'; image.decoding = 'async';
      return image;
    }
    const video = el('video', className); video.muted = true; video.loop = true; video.playsInline = true; video.preload = 'none';
    video.setAttribute('muted', ''); video.setAttribute('playsinline', ''); video.tabIndex = -1;
    video.poster = task.thumbnail; video.dataset.src = src; video.width = 600; video.height = 400; video.setAttribute('aria-label', label);
    watchClip(video); return video;
  };
  document.querySelectorAll('video.autoplay-clip').forEach(watchClip);

  const menu = $('.menu-toggle');
  menu.addEventListener('click', () => {
    const open = menu.getAttribute('aria-expanded') !== 'true';
    menu.setAttribute('aria-expanded', String(open));
    menu.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
    $('#nav-links').classList.toggle('open', open);
  });
  $$('#nav-links a').forEach((link) => link.addEventListener('click', () => {
    menu.setAttribute('aria-expanded', 'false'); $('#nav-links').classList.remove('open');
  }));

  const dialog = $('#task-dialog');
  function openTask(id) {
    const task = data.tasks.find((t) => t.id === id); if (!task) return;
    $('#dialog-eyebrow').textContent = domainName(task.domain) + ' / ' + task.code + (task.recordingAlias ? ' · Task ' + task.recordingAlias : '');
    $('#dialog-title').textContent = task.name; $('#dialog-goal').textContent = task.description;
    $('#dialog-category').textContent = task.category + ' · ' + categoryNames[task.category];
    $('#dialog-temporal').textContent = categoryDescriptions[task.category];
    const host = $('#dialog-media'); host.replaceChildren();
    if (task.video) {
      const video = el('video'); video.src = task.video; video.controls = true; video.playsInline = true; video.preload = 'metadata';
      if (task.thumbnail) video.poster = task.thumbnail;
      video.setAttribute('aria-label',task.name+' final oracle demonstration');
      host.append(video);
      const note=el('p','demo-note',`Final oracle demonstration · ${task.demo.difficulty} · seed ${task.demo.seed}. Head camera above left and right wrist views.`);
      host.append(note);
      const instruction=el('details','task-instruction');
      instruction.append(el('summary',null,'Read the full task instruction'),el('p',null,task.instruction));
      host.append(instruction);
    }
    if (task.sequence) {
      const sequence = el('div', 'sequence-grid');
      task.sequence.forEach((src, i) => {
        const figure=el('figure');const img=el('img');img.src=src;img.alt=task.name+', chronological head-camera frame '+(i+1);
        figure.append(img,el('figcaption',null,task.sequenceTimes[i].toFixed(2)+' s'));sequence.append(figure);
      });
      host.append(sequence, el('p', 'sequence-note', 'Head-camera frames from this final recording, in playback order.'));
    } else if(task.thumbnail) {
      const image=el('img','task-scene');image.src=task.thumbnail;image.alt=task.name;
      host.append(image);
    }
    dialog.showModal();
  }
  $$('.text-button[data-task]').forEach((b) => b.addEventListener('click', () => openTask(b.dataset.task)));
  $('.dialog-close').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', (e) => { if (e.target === dialog) { const r = dialog.getBoundingClientRect(); if (e.clientX<r.left || e.clientX>r.right || e.clientY<r.top || e.clientY>r.bottom) dialog.close(); } });
  dialog.addEventListener('close', () => { dialog.querySelector('video')?.pause(); });

  const state = { domain: 'all', category: 'all', search: '', visible: 12 };
  const featuredIds = ['household-A2','laboratory-A5','industry-B2','healthcare-A2','laboratory-C2','sports-C3'];
  const taskOrder = featuredIds.map((id) => data.tasks.find((t) => t.id===id));
  const grouped = data.domains.map((d) => data.tasks.filter((t) => t.domain===d.id && !featuredIds.includes(t.id)));
  for (let i=0; i<Math.max(...grouped.map((g)=>g.length)); i++) grouped.forEach((g)=>{if(g[i])taskOrder.push(g[i]);});
  function renderTasks() {
    const search = state.search.trim().toLowerCase();
    const filtered = taskOrder.filter((task) => (state.domain==='all' || task.domain===state.domain) && (state.category==='all' || task.category===state.category) && (!search || [task.name, task.description, task.instruction, task.code, task.recordingAlias || '', domainName(task.domain)].join(' ').toLowerCase().includes(search)));
    const grid = $('#task-grid'); grid.replaceChildren();
    filtered.slice(0, state.visible).forEach((task) => {
      const card = el('button', 'task-card'); card.type = 'button'; card.dataset.cat = task.category; card.dataset.task = task.id;
      card.setAttribute('aria-label', domainName(task.domain) + ' ' + task.code + ': ' + task.name + '. View task details.');
      const top = el('div', 'task-card-top'); top.append(el('span', 'task-domain', domainName(task.domain)), el('span', 'task-code', task.code));
      const bottom = el('div', 'task-card-bottom'); bottom.append(el('span', 'category-tag', task.category + ' · ' + categoryNames[task.category]));
      if (task.sequence || task.video) bottom.append(el('span', 'has-demo', task.video ? 'Video demo' : 'Frame sequence'));
      const preview=clip(task,'task-preview',task.name);
      card.append(preview,top, el('h3', null, task.name), el('p', null, task.description), bottom);
      card.addEventListener('click', () => openTask(task.id)); grid.append(card);
    });
    $('#task-count').textContent = filtered.length + (filtered.length===1 ? ' task' : ' tasks') + (filtered.length>state.visible ? ' · showing ' + state.visible : '');
    $('#no-tasks').hidden = filtered.length!==0; $('#load-more').hidden = filtered.length<=state.visible;
    $('#reset-filters').hidden = state.domain==='all' && state.category==='all' && !state.search;
    for (const field of ['domain','category']) $$('[data-'+field+']').forEach((b) => { const active = b.dataset[field]===state[field]; b.classList.toggle('active',active); b.setAttribute('aria-pressed',String(active)); });
  }
  for (const field of ['domain','category']) $$('[data-'+field+']').forEach((b) => b.addEventListener('click',() => { state[field]=b.dataset[field]; state.visible=12; renderTasks(); }));
  $('#task-search').addEventListener('input',(e) => { state.search=e.target.value; state.visible=12; renderTasks(); });
  $('#load-more').addEventListener('click',() => { state.visible+=12; renderTasks(); });
  $('#reset-filters').addEventListener('click',() => { Object.assign(state,{domain:'all',category:'all',search:'',visible:12}); $('#task-search').value=''; renderTasks(); });
  renderTasks();

  // Deep links from the homepage: tasks.html?domain=<id> filters the catalog, tasks.html?task=<id> opens one task.
  const params = new URLSearchParams(location.search);
  const wantedDomain = params.get('domain');
  if (wantedDomain && data.domains.some((d) => d.id === wantedDomain)) { state.domain = wantedDomain; renderTasks(); }
  const wantedTask = params.get('task');
  if (wantedTask && data.tasks.some((t) => t.id === wantedTask)) {
    const target = data.tasks.find((t) => t.id === wantedTask);
    state.domain = target.domain; state.visible = 60; renderTasks();
    openTask(wantedTask);
  }
})();
