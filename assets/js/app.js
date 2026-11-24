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
        const image=clip(task,null,`${task.name}, ${domainName(task.domain)}`);
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
      if (affiliation.id) link.append(el('sup', null, affiliation.id), document.createTextNode(' '));
      link.append(document.createTextNode(affiliation.name));
      affiliations.append(link);
    });
    container.append(affiliations); container.hidden = false;
  }
  // Demo video template: placeholder until site-config.js provides projectVideoUrl.
  if (config.projectVideoUrl) {
    const player = $('#demo-player');
    player.src = config.projectVideoUrl;
    if (config.projectVideoPoster) player.poster = config.projectVideoPoster;
    player.hidden = false; $('#demo-placeholder').hidden = true;
  }
  // Hero resource pills: show 'Soon' until a URL is configured in site-config.js.
  for (const [id, url] of [['hero-paper', config.paperUrl], ['hero-code', config.codeUrl], ['hero-data', config.dataUrl]]) {
    const pill = $('#' + id); if (!pill || !url) continue;
    pill.href = url; pill.target = '_blank'; pill.rel = 'noopener';
    pill.classList.remove('pending'); pill.removeAttribute('aria-disabled'); pill.removeAttribute('title'); pill.querySelector('small')?.remove();
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


  // Task details live on tasks.html; the homepage only links there.
  const openTask = (id) => { location.href = 'tasks.html?task=' + encodeURIComponent(id); };
  $$('.text-button[data-task]').forEach((b) => b.addEventListener('click', () => openTask(b.dataset.task)));

  $$('[data-mode]').forEach((b) => b.addEventListener('click',() => {
    const paused = b.dataset.mode==='paused';
    $$('[data-mode]').forEach((other) => { const active = other===b; other.classList.toggle('active',active); other.setAttribute('aria-pressed',String(active)); });
    $('#world-delay').classList.toggle('paused',paused);
    $('#world-delay span').textContent = paused ? 'No time charged' : 'Environment time advances';
    $('#protocol-description').textContent = paused ? 'Inference time is not charged to the environment clock. The agent can finish thinking before the simulated world advances.' : 'During the charged inference delay, previously committed controls remain in effect. The next action is based on an observation that is already older.';
  }));
  // The leaderboard preserves every reported row and missing metric.
  const board=data.leaderboard;
  const boardState={comparison:'all',sort:'Overall.ltsr',search:''};
  const groups=['A','B','C','Overall'],metrics=['ps','psr','tsr','ltsr'];
  const valueOf=(row,key)=>{const [g,m]=key.split('.');return row.scores[g][m];};
  const conditionLabel=(row)=>row.fineTuned?'Fine-tuned':row.condition==='released'?'Released checkpoint':row.family==='Agent framework'?'Qwen3.8-27B backbone':row.family==='Text-only reference'?'Text-only · Tool-augmented EEF':'Tool-augmented EEF';
  const scoreText=(value)=>value==null?'—':value.toFixed(1);
  function renderLeaderboard(){
    const query=boardState.search.trim().toLowerCase();
    const rows=board.rows.filter(row=>(boardState.comparison==='all'||row.comparison===boardState.comparison)&&
      (!query||[row.model,row.family,conditionLabel(row)].join(' ').toLowerCase().includes(query)));
    rows.sort((a,b)=>{
      const av=valueOf(a,boardState.sort),bv=valueOf(b,boardState.sort);
      return (bv??-1)-(av??-1)||a.model.localeCompare(b.model)||Number(b.fineTuned)-Number(a.fineTuned);
    });
    const best={};groups.forEach(g=>metrics.forEach(m=>{const vals=rows.map(r=>r.scores[g][m]).filter(v=>v!=null);best[g+'.'+m]=vals.length?Math.max(...vals):null;}));
    const host=$('#leaderboard-body');host.replaceChildren();let rank=0,previous=null;
    rows.forEach((row,index)=>{
      const value=valueOf(row,boardState.sort);
      if(value!==previous||index===0)rank=index+1;previous=value;
      const tr=el('tr');tr.dataset.resultId=row.id;
      if(row.fineTuned)tr.classList.add('fine-tuned-row');
      tr.append(el('td','rank-cell',value==null?'—':String(rank)));
      const model=el('th','leaderboard-model');model.scope='row';
      const name=el('strong',null,row.model);if(row.fineTuned)name.append(el('span','ft-mark',' + fine-tuned'));
      model.append(name,el('span','family-tag',row.family));
      tr.append(model);
      groups.forEach(g=>metrics.forEach((m,i)=>{
        const key=g+'.'+m;const v=row.scores[g][m];
        const cell=el('td','score-cell',m==='ps'&&v==null?'':scoreText(v));cell.dataset.metric=key;
        if(m==='ps')cell.classList.add('ps-cell');
        if(i===0)cell.classList.add('group-start');
        if(g==='Overall')cell.classList.add('overall-cell');
        if(v!=null&&v>0&&v===best[key])cell.classList.add('best-score');
        if(key===boardState.sort)cell.classList.add('selected-score');
        tr.append(cell);
      }));host.append(tr);
    });
    const noPs=rows.length>0&&rows.every(r=>r.scores.Overall.ps==null);
    $('.main-board').classList.toggle('hide-ps',noPs);
    $$('.main-board th.lb-group').forEach(th=>{th.colSpan=noPs?3:4;});
    if(noPs&&boardState.sort.endsWith('.ps')){boardState.sort='Overall.ltsr';return renderLeaderboard();}
    $('#leaderboard-count').textContent=rows.length+(rows.length===1?' configuration':' configurations');
    $('#leaderboard-empty').hidden=rows.length!==0;
    $$('[data-comparison]').forEach(button=>{const active=button.dataset.comparison===boardState.comparison;button.classList.toggle('active',active);button.setAttribute('aria-pressed',String(active));});
    $$('[data-score-heading]').forEach(th=>{if(th.dataset.scoreHeading===boardState.sort)th.setAttribute('aria-sort','descending');else th.removeAttribute('aria-sort');});
    $$('[data-sort]').forEach(button=>button.classList.toggle('active',button.dataset.sort===boardState.sort));
  }
  $$('[data-comparison]').forEach(button=>button.addEventListener('click',()=>{boardState.comparison=button.dataset.comparison;renderLeaderboard();}));
  $$('[data-sort]').forEach(button=>button.addEventListener('click',()=>{boardState.sort=button.dataset.sort;renderLeaderboard();}));
  $('#leaderboard-search').addEventListener('input',event=>{boardState.search=event.target.value;renderLeaderboard();});
  renderLeaderboard();
  board.seenUnseenRows.forEach(row=>{
    const tr=el('tr');if(row.fineTuned)tr.classList.add('fine-tuned-row');
    const name=el('th','leaderboard-model');name.scope='row';name.append(el('strong',null,row.model),el('span','checkpoint-label',row.fineTuned?'Fine-tuned':'Released checkpoint'));tr.append(name);
    ['Seen','Unseen'].forEach(scope=>['psr','tsr','ltsr'].forEach(metric=>tr.append(el('td','score-cell',scoreText(row.scores[scope][metric])))));
    $('#transfer-body').append(tr);
  });
  // Findings: headline number, paradigm cards and the PSR / TSR / LTSR comparison, all read from the leaderboard data.
  const pct=(v)=>v.toFixed(1)+'%';
  const findRow=(model,fineTuned)=>board.rows.find(row=>row.model===model&&row.fineTuned===fineTuned);
  const bestVlm=board.rows.filter(row=>row.comparison==='vlm').reduce((x,y)=>y.scores.Overall.tsr>x.scores.Overall.tsr?y:x);
  const wam=findRow('OpenWAM-α',true);
  const transfer=board.seenUnseenRows.find(row=>row.model==='X-VLA'&&row.fineTuned);
  const headline=Math.max(...board.rows.map(row=>row.scores.Overall.ltsr));
  const insightScores={
    'headline-ltsr':headline,'headline-ltsr-inline':headline,
    'insight-seen-tsr':transfer.scores.Seen.tsr,'insight-unseen-tsr':transfer.scores.Unseen.tsr,
    'insight-wam-tsr':wam.scores.Overall.tsr,'insight-wam-ltsr':wam.scores.Overall.ltsr,'insight-wam-psr':wam.scores.Overall.psr,
    'insight-vlm-tsr':bestVlm.scores.Overall.tsr,'insight-vlm-ltsr':bestVlm.scores.Overall.ltsr,
  };
  Object.entries(insightScores).forEach(([id,value])=>{$('#'+id).textContent=pct(value);});
  const chartRows=[['π₀.₅',true,'VLA · fine-tuned'],['InternW0-Δ',true,'WAM · fine-tuned'],['GPT-6 Astra',false,'VLM agent · zero-shot'],['Gemini 4 Argon',false,'VLM agent · zero-shot']];
  const chartMetrics=[['psr','PSR'],['tsr','TSR'],['ltsr','LTSR']];
  const chartMax=30;
  chartRows.forEach(([model,fineTuned,kind])=>{
    const row=findRow(model,fineTuned);if(!row)return;
    const item=el('div','pst-row');item.setAttribute('role','listitem');
    item.setAttribute('aria-label',model+', '+kind+': '+chartMetrics.map(([key,name])=>name+' '+pct(row.scores.Overall[key])).join(', '));
    const label=el('div','pst-label');label.append(el('strong',null,model),el('span',null,kind));
    const bars=el('div','pst-bars');
    chartMetrics.forEach(([key,name])=>{
      const value=row.scores.Overall[key];
      const line=el('div','pst-bar-line');line.title=model+' · '+name+' '+pct(value);
      const bar=el('i','pst-bar '+key);bar.style.width=(value/chartMax*100)+'%';
      line.append(bar,el('span','pst-value',pct(value)),el('span','pst-metric',name));bars.append(line);
    });
    item.append(label,bars);$('#pst-chart').append(item);
  });
  const observed = $$('#gallery,#benchmark,#evaluation,#leaderboard,#insights,#real-robot,#resources');
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) if (entry.isIntersecting) $$('#nav-links a').forEach((a) => a.classList.toggle('current',a.hash==='#'+entry.target.id));
    },{rootMargin:'-20% 0px -55% 0px'});
    observed.forEach((s) => observer.observe(s));
  }
})();
