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

  // The gallery uses one thumbnail per actual task, not repeated frames labeled as different tasks.
  const gallery = $('#gallery');
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  data.galleryRows.forEach((ids, rowIndex) => {
    const lane = el('div','gallery-lane'); lane.setAttribute('aria-label','Task gallery row '+(rowIndex+1));
    const track = el('div','gallery-track');
    track.style.setProperty('--gallery-duration', `${78+rowIndex*12}s`);
    for (let copy=0;copy<2;copy++) {
      const group = el('div','gallery-group');
      if(copy) group.setAttribute('aria-hidden','true');
      ids.forEach((id) => {
        const task=data.tasks.find((t)=>t.id===id);
        const card=el('button','gallery-card'); card.type='button'; card.dataset.galleryTask=id;
        card.setAttribute('aria-label',`${domainName(task.domain)} ${task.code}: ${task.name}. View task details.`);
        if(copy) card.tabIndex=-1;
        const image=el('img'); image.src=task.thumbnail; image.alt=`${task.name}, ${domainName(task.domain)}`;
        image.width=600;image.height=400;image.decoding='async';
        const caption=el('span','gallery-card-caption');caption.append(el('span',null,domainName(task.domain)),el('strong',null,task.name));
        card.append(image,caption);card.addEventListener('click',()=>openTask(id)); group.append(card);
      });
      track.append(group);
    }
    lane.append(track);$('#gallery-rows').append(lane);
  });
  $('#gallery-toggle').addEventListener('click',()=>{
    const paused=gallery.classList.toggle('gallery-paused');
    $('#gallery-toggle').textContent=paused?'Play gallery':'Pause gallery';
    $('#gallery-toggle').setAttribute('aria-pressed',String(paused));
  });
  if(reducedMotion){gallery.classList.add('gallery-paused');$('#gallery-toggle').hidden=true;}
  $('#spotlight-toggle').addEventListener('click',()=>{
    const panel=$('#featured-scene');panel.hidden=!panel.hidden;
    $('#spotlight-toggle').setAttribute('aria-expanded',String(!panel.hidden));
    $('#spotlight-toggle').textContent=panel.hidden?'Watch a featured task':'Hide featured task';
    if(panel.hidden){$('#hero-video').pause();setVideoLabel(false);}
  });

  if (config.authors?.length) {
    const container = $('#authors');
    const names = el('div', 'author-names');
    config.authors.forEach((author, index) => {
      const link = el('a', null, author.name);
      link.href = author.url;
      link.target = '_blank'; link.rel = 'noopener noreferrer';
      if (author.affiliation) link.append(el('sup', null, author.affiliation));
      names.append(link);
      if (index===4) names.append(el('span', 'author-break'));
    });
    container.append(names);
    const affiliations = el('div', 'affiliations');
    (config.affiliations || []).forEach((affiliation) => {
      const link = el('a'); link.href = affiliation.url; link.target = '_blank'; link.rel = 'noopener noreferrer';
      link.append(el('sup', null, affiliation.id), document.createTextNode(' ' + affiliation.name));
      affiliations.append(link);
    });
    container.append(affiliations); container.hidden = false;
  }
  for (const [id, url] of [['paper-link', config.paperUrl], ['code-link', config.codeUrl]]) {
    if (url) { const link = $('#' + id); link.href = url; link.target = '_blank'; link.rel = 'noopener noreferrer'; link.hidden = false; }
  }
  if (config.citation) {
    $('#citation-section').hidden = false;
    $('#citation').textContent = config.citation;
    $('#copy-citation').addEventListener('click', async () => {
      try { await navigator.clipboard.writeText(config.citation); $('#copy-status').textContent = 'Copied'; }
      catch { $('#copy-status').textContent = 'Select the text above to copy it.'; }
    });
  }

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

  const heroScenes = {
    industry: { image: 'assets/images/featured/hero-industry.webp', task: 'A warning. A deadline. A response.', detail: 'Detect the motor fault and press the emergency stop in time.', category: 'EVENT-REACTIVE', alt: 'Dual robotic arms in an industrial motor-test station', video: 'assets/videos/industry/industry-motor-stop.mp4' },
    laboratory: { image: 'assets/images/featured/hero-laboratory.webp', task: 'Precision, at the required pace.', detail: 'Place samples in matching rack slots while meeting the service target.', category: 'THROUGHPUT', alt: 'Dual robotic arms placing laboratory samples in a rack' },
    healthcare: { image: 'assets/images/featured/hero-healthcare.webp', task: 'Respond when care is needed.', detail: 'Hang the prepared bag, then open the line clamp before the deadline.', category: 'EVENT-REACTIVE', alt: 'Robotic arms handling a prepared infusion bag in a simulated healthcare scene' },
    household: { image: 'assets/images/featured/hero-household.webp', task: 'A little early. A little too late.', detail: 'Flip the pancake when its underside reaches the right cooking state.', category: 'TEMPORAL WINDOW', alt: 'Robotic manipulation of a pancake in a kitchen pan' },
    sports: { image: 'assets/images/featured/hero-sports.webp', task: 'Keep the next ball ready.', detail: 'Restock a ball feeder to keep up with repeated scheduled demand.', category: 'THROUGHPUT', alt: 'Dual robotic arms restocking a ball-machine service station' },
  };
  let currentScene = 'industry';
  const heroVideo = $('#hero-video');
  const videoButton = $('#video-toggle');
  const media = $('.showcase-media');
  const setVideoLabel = (playing) => {
    videoButton.querySelector('span').textContent = playing ? 'Pause demo' : 'Play demo';
    videoButton.setAttribute('aria-label', playing ? 'Pause simulation video' : 'Play simulation video');
    videoButton.querySelector('path').setAttribute('d', playing ? 'M7 5h4v14H7zm7 0h4v14h-4z' : 'm9 5 10 7-10 7z');
  };
  function setScene(id) {
    currentScene = id; const scene = heroScenes[id];
    heroVideo.pause(); media.classList.remove('playing'); setVideoLabel(false);
    $('#hero-image').src = scene.image; $('#hero-image').alt = scene.alt;
    $('#hero-domain').textContent = domainName(id).toUpperCase();
    $('#hero-task').textContent = scene.task; $('#hero-detail').textContent = scene.detail;
    $('#hero-category').textContent = scene.category;
    videoButton.hidden = !scene.video;
    if (scene.video) { heroVideo.src = scene.video; heroVideo.poster = scene.image; }
    else { heroVideo.removeAttribute('src'); heroVideo.load(); }
    $$('[data-hero]').forEach((b) => {
      const active = b.dataset.hero === id; b.classList.toggle('active', active); b.setAttribute('aria-pressed', String(active));
    });
  }
  $$('[data-hero]').forEach((b) => b.addEventListener('click', () => setScene(b.dataset.hero)));
  videoButton.addEventListener('click', async () => {
    if (!heroScenes[currentScene].video) return;
    if (heroVideo.paused) {
      try { await heroVideo.play(); media.classList.add('playing'); setVideoLabel(true); }
      catch { setVideoLabel(false); }
    } else { heroVideo.pause(); setVideoLabel(false); }
  });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) { heroVideo.pause(); setVideoLabel(false); }
  });
  setScene('industry');

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
      if (task.sequence) video.poster = task.sequence[2];
      host.append(video);
    }
    if (task.sequence) {
      const sequence = el('div', 'sequence-grid');
      task.sequence.forEach((src, i) => { const img = el('img'); img.src = src; img.alt = task.name + ', chronological stage ' + (i+1); sequence.append(img); });
      host.append(sequence, el('p', 'sequence-note', 'Chronological demonstration frames, sampled at unequal intervals.'));
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
  const featuredIds = ['household-A3','laboratory-A5','industry-B2','healthcare-B5','laboratory-C2','sports-C3'];
  const taskOrder = featuredIds.map((id) => data.tasks.find((t) => t.id===id));
  const grouped = data.domains.map((d) => data.tasks.filter((t) => t.domain===d.id && !featuredIds.includes(t.id)));
  for (let i=0; i<Math.max(...grouped.map((g)=>g.length)); i++) grouped.forEach((g)=>{if(g[i])taskOrder.push(g[i]);});
  function renderTasks() {
    const search = state.search.trim().toLowerCase();
    const filtered = taskOrder.filter((task) => (state.domain==='all' || task.domain===state.domain) && (state.category==='all' || task.category===state.category) && (!search || [task.name, task.description, task.code, task.recordingAlias || '', domainName(task.domain)].join(' ').toLowerCase().includes(search)));
    const grid = $('#task-grid'); grid.replaceChildren();
    filtered.slice(0, state.visible).forEach((task) => {
      const card = el('button', 'task-card'); card.type = 'button'; card.dataset.cat = task.category; card.dataset.task = task.id;
      card.setAttribute('aria-label', domainName(task.domain) + ' ' + task.code + ': ' + task.name + '. View task details.');
      const top = el('div', 'task-card-top'); top.append(el('span', 'task-domain', domainName(task.domain)), el('span', 'task-code', task.code));
      const bottom = el('div', 'task-card-bottom'); bottom.append(el('span', 'category-tag', task.category + ' · ' + categoryNames[task.category]));
      if (task.sequence || task.video) bottom.append(el('span', 'has-demo', task.video ? 'Video demo' : 'Frame sequence'));
      card.append(top, el('h3', null, task.name), el('p', null, task.description), bottom);
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

  $$('[data-mode]').forEach((b) => b.addEventListener('click',() => {
    const paused = b.dataset.mode==='paused';
    $$('[data-mode]').forEach((other) => { const active = other===b; other.classList.toggle('active',active); other.setAttribute('aria-pressed',String(active)); });
    $('#world-delay').classList.toggle('paused',paused);
    $('#world-delay span').textContent = paused ? 'No time charged' : 'Time advances';
    $('#protocol-description').textContent = paused ? 'Inference time is not charged to the environment clock. The agent can finish thinking before the simulated world advances.' : 'During the charged inference delay, previously committed controls remain in effect. The next action is based on an observation that is already older.';
  }));
  const metricDescriptions = { psr:'Physical success with timing relaxed and inference paused.', tsr:'Physical success together with temporal compliance, with inference paused.', ltsr:'Latency-aligned temporal success, including model inference and control-interface delay.' };
  function renderResults(metric) {
    const chart = $('#results-chart'); chart.replaceChildren();
    [...data.results].sort((a,b) => b[metric]-a[metric]).forEach((result) => {
      const row = el('div','chart-row'); const label = el('div','chart-model',result.model); label.append(el('span','family-tag',result.family));
      const track = el('div','chart-track'); const bar = el('div','chart-bar'); bar.style.width=(result[metric]/15*100)+'%'; track.append(bar);
      row.append(label,track,el('div','chart-value',result[metric].toFixed(1)+'%')); chart.append(row);
    });
    $('#result-description').textContent=metricDescriptions[metric];
    $$('[data-metric]').forEach((b) => { const active=b.dataset.metric===metric; b.classList.toggle('active',active); b.setAttribute('aria-pressed',String(active)); });
  }
  $$('[data-metric]').forEach((b) => b.addEventListener('click',() => renderResults(b.dataset.metric)));
  renderResults('ltsr');
  const observed = $$('#gallery,#benchmark,#tasks,#evaluation,#results,#resources');
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) if (entry.isIntersecting) $$('#nav-links a').forEach((a) => a.classList.toggle('current',a.hash==='#'+entry.target.id));
    },{rootMargin:'-20% 0px -55% 0px'});
    observed.forEach((s) => observer.observe(s));
  }
})();
