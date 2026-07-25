
(() => {
  const nav=document.getElementById('nav');
  const menuToggle=document.getElementById('menuToggle');
  const navLinks=document.getElementById('navLinks');
  if(nav) window.addEventListener('scroll',()=>nav.classList.toggle('compact',window.scrollY>20));
  if(menuToggle&&navLinks){
    menuToggle.addEventListener('click',()=>navLinks.classList.toggle('open'));
    navLinks.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>navLinks.classList.remove('open')));
  }

  const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{
    if(entry.isIntersecting){entry.target.classList.add('visible');observer.unobserve(entry.target)}
  }),{threshold:.12});
  document.querySelectorAll('.reveal').forEach(el=>observer.observe(el));

  const uploadFrame=document.getElementById('uploadFrame');
  const uploadPlaceholder=document.getElementById('uploadPlaceholder');
  if(uploadFrame&&uploadPlaceholder){
    const url=(window.CNP_UPLOAD_PORTAL_URL||'').trim();
    if(url){uploadFrame.src=url;uploadFrame.classList.add('active');uploadPlaceholder.hidden=true}
  }

  const startDateInput=document.getElementById('startDate');
  const planInput=document.getElementById('planSelect');
  const phaseList=document.getElementById('phaseList');
  const calendarGrid=document.getElementById('calendarGrid');
  const calendarTitle=document.getElementById('calendarTitle');
  const startPill=document.getElementById('startPill');
  const endPill=document.getElementById('endPill');
  const outcome=document.getElementById('projectedOutcome');
  const fmt=new Intl.DateTimeFormat('en-GB',{day:'2-digit',month:'short',year:'numeric'});
  const shortFmt=new Intl.DateTimeFormat('en-GB',{day:'numeric',month:'short'});
  const monthFmt=new Intl.DateTimeFormat('en-GB',{month:'long',year:'numeric'});

  function addBusinessDays(date,days){const r=new Date(date);let a=0;while(a<days){r.setDate(r.getDate()+1);const d=r.getDay();if(d!==0&&d!==6)a++}return r}
  const plans={
    bronze:{name:'Bronze — CNP Verified',validation:'Documentation and claim review',intake:2,assessment:7,validationDays:15,certification:4,summary:'Independent review of documents, claims and existing evidence. No physical product sample is required.'},
    silver:{name:'Silver — In-Silico Validated',validation:'In-silico validation',intake:2,assessment:7,validationDays:28,certification:4,summary:'Adds model-based validation where suitable data and computational models exist. No physical product sample is required.'},
    gold:{name:'Gold — Experimentally Validated',validation:'Experimental testing programme',intake:2,assessment:7,validationDays:49,certification:4,summary:'Adds an experimental programme performed by CNP or qualified partner laboratories. Samples are requested later only if the agreed protocol requires them.'}
  };

  function renderTimeline(){
    if(!startDateInput||!planInput||!phaseList||!calendarGrid||!calendarTitle||!startPill||!endPill||!outcome)return;
    const start=startDateInput.value?new Date(startDateInput.value+'T12:00:00'):new Date();
    const plan=plans[planInput.value]||plans.bronze;
    const intakeEnd=addBusinessDays(start,plan.intake);
    const assessEnd=addBusinessDays(intakeEnd,plan.assessment);
    const validateEnd=addBusinessDays(assessEnd,plan.validationDays);
    const end=addBusinessDays(validateEnd,plan.certification);
    const phases=[
      ['1','Submission received','Project starts after files are uploaded.',start],
      ['2','Intake complete','Dossier completeness check.',intakeEnd],
      ['3','Assessment complete','Gap analysis and pathway confirmation.',assessEnd],
      ['4',plan.validation,`Core work for ${plan.name}.`,validateEnd],
      ['5','Estimated certification','Certificate and evidence package released.',end]
    ];
    phaseList.innerHTML='';
    phases.forEach(p=>{const row=document.createElement('div');row.className='phase-row';row.innerHTML=`<span>${p[0]}</span><div><b>${p[1]}</b><small>${p[2]}</small></div><div class="phase-date">${fmt.format(p[3])}</div>`;phaseList.appendChild(row)});
    startPill.textContent=`Submission · ${shortFmt.format(start)}`;
    endPill.textContent=`Estimated completion · ${shortFmt.format(end)}`;
    outcome.textContent=`${plan.name}: projected completion around ${fmt.format(end)}. ${plan.summary}`;
    const y=start.getFullYear(),m=start.getMonth();
    calendarTitle.textContent=monthFmt.format(start);calendarGrid.innerHTML='';
    ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].forEach(d=>{const c=document.createElement('div');c.className='day-name';c.textContent=d;calendarGrid.appendChild(c)});
    let offset=new Date(y,m,1).getDay()-1;if(offset<0)offset=6;for(let i=0;i<offset;i++){const b=document.createElement('div');b.className='day-cell muted';calendarGrid.appendChild(b)}
    const milestone=new Set(phases.map(p=>p[3].toDateString()));
    const days=new Date(y,m+1,0).getDate();
    for(let d=1;d<=days;d++){const date=new Date(y,m,d,12);const c=document.createElement('div');c.className='day-cell';c.textContent=d;if(date.toDateString()===start.toDateString())c.classList.add('start');if(date.toDateString()===end.toDateString())c.classList.add('end');if(milestone.has(date.toDateString())&&!c.classList.contains('start')&&!c.classList.contains('end'))c.classList.add('milestone');calendarGrid.appendChild(c)}
  }
  if(planInput){const requested=new URLSearchParams(window.location.search).get('plan');if(requested&&plans[requested])planInput.value=requested;}
  if(startDateInput&&!startDateInput.value)startDateInput.value=new Date().toISOString().split('T')[0];
  if(startDateInput&&planInput){startDateInput.addEventListener('change',renderTimeline);planInput.addEventListener('change',renderTimeline);renderTimeline()}
})();

// Interactive CNP Standard explorer
(() => {
  const topicOrder = ['formula','dossier','stability','claims','insilico','experimental'];
  const topicMeta = {
    formula: { index:'01 · Product identity', title:'Formula and INCI' },
    dossier: { index:'02 · Regulatory foundation', title:'PIF, CPSR and core records' },
    stability: { index:'03 · Product integrity', title:'Stability and microbiological quality' },
    claims: { index:'04 · Consumer communication', title:'Claim substantiation' },
    insilico: { index:'05 · Model-based evidence', title:'In-silico validation' },
    experimental: { index:'06 · Measured product performance', title:'Experimental evidence' }
  };

  const cards = [...document.querySelectorAll('[data-standard-topic]')];
  const dialog = document.getElementById('standardDialog');
  const backdrop = document.getElementById('standardDialogBackdrop');
  const closeButton = document.getElementById('standardDialogClose');
  const body = document.getElementById('standardDialogBody');
  const title = document.getElementById('standardDialogTitle');
  const indexLabel = document.getElementById('standardDialogIndex');
  const position = document.getElementById('standardDialogPosition');
  const progress = document.getElementById('standardDialogProgress');
  const prev = document.getElementById('standardDialogPrev');
  const next = document.getElementById('standardDialogNext');

  if (!cards.length || !dialog || !backdrop || !body) return;

  let currentTopic = topicOrder[0];
  let lastTrigger = null;

  function renderTopic(topic) {
    const template = document.getElementById(`standard-topic-${topic}`);
    const meta = topicMeta[topic];
    if (!template || !meta) return;
    currentTopic = topic;
    const topicIndex = topicOrder.indexOf(topic);
    title.textContent = meta.title;
    indexLabel.textContent = meta.index;
    position.textContent = `${topicIndex + 1} of ${topicOrder.length}`;
    progress.style.width = `${((topicIndex + 1) / topicOrder.length) * 100}%`;
    body.replaceChildren(template.content.cloneNode(true));
    body.scrollTop = 0;
    prev.disabled = topicIndex === 0;
    next.disabled = topicIndex === topicOrder.length - 1;
    dialog.setAttribute('data-topic', topic);
  }

  function openDialog(topic, trigger) {
    lastTrigger = trigger || document.activeElement;
    renderTopic(topic);
    dialog.hidden = false;
    backdrop.hidden = false;
    document.body.classList.add('lock');
    requestAnimationFrame(() => {
      dialog.classList.add('open');
      backdrop.classList.add('open');
      closeButton.focus();
    });
  }

  function closeDialog() {
    dialog.classList.remove('open');
    backdrop.classList.remove('open');
    document.body.classList.remove('lock');
    window.setTimeout(() => {
      dialog.hidden = true;
      backdrop.hidden = true;
      if (lastTrigger && typeof lastTrigger.focus === 'function') lastTrigger.focus();
    }, 280);
  }

  cards.forEach(card => card.addEventListener('click', () => openDialog(card.dataset.standardTopic, card)));
  closeButton.addEventListener('click', closeDialog);
  backdrop.addEventListener('click', closeDialog);

  prev.addEventListener('click', () => {
    const currentIndex = topicOrder.indexOf(currentTopic);
    if (currentIndex > 0) renderTopic(topicOrder[currentIndex - 1]);
  });
  next.addEventListener('click', () => {
    const currentIndex = topicOrder.indexOf(currentTopic);
    if (currentIndex < topicOrder.length - 1) renderTopic(topicOrder[currentIndex + 1]);
  });

  document.addEventListener('keydown', event => {
    if (dialog.hidden) return;
    if (event.key === 'Escape') closeDialog();
    if (event.key === 'ArrowLeft') prev.click();
    if (event.key === 'ArrowRight') next.click();
    if (event.key === 'Tab') {
      const focusable = [...dialog.querySelectorAll('button:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])')];
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }
  });
})();


// Interactive Bronze / Silver / Gold explorer
(() => {
  const buttons=[...document.querySelectorAll('[data-level-select]')];
  const showcase=document.getElementById('levelShowcase');
  if(!buttons.length||!showcase)return;
  const mockup=document.getElementById('levelMockup');
  const mark=document.getElementById('levelMark');
  const caption=document.getElementById('levelCaption');
  const kicker=document.getElementById('levelKicker');
  const title=document.getElementById('levelTitle');
  const summary=document.getElementById('levelSummary');
  const time=document.getElementById('levelTime');
  const best=document.getElementById('levelBest');
  const included=document.getElementById('levelIncluded');
  const demonstrates=document.getElementById('levelDemonstrates');
  const note=document.getElementById('levelNote');
  const submit=document.getElementById('levelSubmitLink');
  const data={
    bronze:{
      mockup:'assets/mockup-bronze.png',mark:'assets/cnp-mark-bronze.png',caption:'Bronze level mark',kicker:'Bronze · Evidence review',title:'CNP Verified',summary:'Independent review of the product dossier, claims and existing supporting evidence.',time:'2–3 weeks',best:'Brands with a mature dossier and suitable existing evidence',included:['CNP quality-standard review','Formula, product records and evidence consistency','Claim wording and substantiation review','Final approved-claim summary'],demonstrates:['The dossier was independently reviewed','The selected claims are proportionate to the evidence','The marketed product version is traceable'],note:'<strong>Boundary:</strong> Bronze does not add new model-based or experimental evidence. It validates the quality and relevance of the material already available. <strong>No physical product sample is required.</strong>'},
    silver:{
      mockup:'assets/mockup-silver.png',mark:'assets/cnp-mark-silver.png',caption:'Silver level mark',kicker:'Silver · Model-based validation',title:'In-Silico Validated',summary:'Bronze plus a non-animal, computational validation pathway where suitable models and input data exist.',time:'4–6 weeks',best:'Brands that need additional mechanistic, exposure, permeation or formulation-related evidence',included:['Everything included in Bronze','Selection of the appropriate computational model','Model input review and scenario definition','Results, assumptions, confidence and limitations'],demonstrates:['The dossier and claims passed the Bronze review','A defined scientific question was assessed computationally','The model outputs are traceable to stated inputs and assumptions'],note:'<strong>Boundary:</strong> Silver is applied only where a scientifically suitable model and adequate input data exist. It does not replace mandatory legal or experimental requirements. <strong>No physical product sample is required.</strong>'},
    gold:{
      mockup:'assets/mockup-gold.png',mark:'assets/cnp-mark-gold.png',caption:'Gold level mark',kicker:'Gold · Experimental validation',title:'Experimentally Validated',summary:'Bronze plus a claim-specific experimental programme managed directly by CNP.',time:'8–12 weeks',best:'Brands whose claims require new measured performance, tolerance or human-use evidence',included:['Everything included in Bronze','Claim-specific protocol and endpoint selection','Testing in CNP laboratories when available','Qualified partner laboratories for specialist analyses','Data review and final scientific interpretation'],demonstrates:['The product dossier and claims passed the Bronze review','The selected product performance was measured experimentally','The final claim wording reflects the generated results'],note:'<strong>Boundary:</strong> Gold does not automatically include Silver. In-silico analysis is added only when it improves the experimental strategy or provides complementary value. <strong>Physical samples are requested only after the experimental protocol is agreed.</strong>'}
  };
  function list(items){return items.map(item=>`<li>${item}</li>`).join('')}
  function render(level){
    const item=data[level]||data.bronze;
    buttons.forEach(btn=>{const active=btn.dataset.levelSelect===level;btn.classList.toggle('active',active);btn.setAttribute('aria-selected',String(active));});
    showcase.dataset.level=level;mockup.src=item.mockup;mockup.alt=`Aurea product with the CNP ${level[0].toUpperCase()+level.slice(1)} level mark`;mark.src=item.mark;caption.textContent=item.caption;kicker.textContent=item.kicker;title.textContent=item.title;summary.textContent=item.summary;time.textContent=item.time;best.textContent=item.best;included.innerHTML=list(item.included);demonstrates.innerHTML=list(item.demonstrates);note.innerHTML=item.note;submit.href=`submit-product.html?plan=${level}`;submit.textContent='Submit Your Product';
    if(history.replaceState)history.replaceState(null,'',`#${level}`);
  }
  buttons.forEach(btn=>btn.addEventListener('click',()=>render(btn.dataset.levelSelect)));
  const initial=['bronze','silver','gold'].includes(location.hash.slice(1))?location.hash.slice(1):'bronze';
  render(initial);
})();


// Interactive team biographies
(() => {
  const cards=[...document.querySelectorAll('[data-team]')];
  const dialog=document.getElementById('teamDialog');
  const backdrop=document.getElementById('teamDialogBackdrop');
  const close=document.getElementById('teamDialogClose');
  if(!cards.length||!dialog||!backdrop||!close)return;
  const image=document.getElementById('teamDialogImage');
  const role=document.getElementById('teamDialogRole');
  const name=document.getElementById('teamDialogName');
  const bio=document.getElementById('teamDialogBio');
  const people={
    elvira:{name:'Elvira Martino',role:'CNP Team',image:'assets/team-elvira.webp',bio:'<p>Elvira’s detailed biography will be added once the final team profile has been approved.</p>'},
    francesco:{name:'Francesco Vallini',role:'Molecular Design',image:'assets/team-francesco.webp',bio:'<p>Francesco is a third-year PhD candidate in Molecular Design with a background in Pharmaceutical Chemistry and Technology.</p><p>He has experience in the synthesis, characterization, and biological evaluation of bioactive compounds, bringing strong scientific expertise to product evidence assessment and validation.</p>'},
    sneha:{name:'Sneha Khandelwal',role:'CNP Team',image:'assets/team-sneha.webp',bio:'<p>Sneha’s detailed biography will be added once the final team profile has been approved.</p>'},
    anna:{name:'Anna Crispino',role:'Biomedical Engineering',image:'assets/team-anna.webp',bio:'<p>Anna is a biomedical engineer with a PhD in Biomedical Engineering and postdoctoral researcher specializing in computational modelling, biomechanics and scientific innovation.</p><p>At CNP, she transforms scientific evidence into clear, credible standards that make natural cosmetics easier to understand and trust.</p>'}
  };
  let last=null;
  function open(key,trigger){const p=people[key];if(!p)return;last=trigger;image.src=p.image;image.alt=p.name;role.textContent=p.role;name.textContent=p.name;bio.innerHTML=p.bio;dialog.hidden=false;backdrop.hidden=false;document.body.classList.add('lock');requestAnimationFrame(()=>{dialog.classList.add('open');backdrop.classList.add('open');close.focus()})}
  function shut(){dialog.classList.remove('open');backdrop.classList.remove('open');document.body.classList.remove('lock');setTimeout(()=>{dialog.hidden=true;backdrop.hidden=true;if(last)last.focus()},250)}
  cards.forEach(card=>card.addEventListener('click',()=>open(card.dataset.team,card)));
  close.addEventListener('click',shut);backdrop.addEventListener('click',shut);document.addEventListener('keydown',e=>{if(!dialog.hidden&&e.key==='Escape')shut()});
})();
