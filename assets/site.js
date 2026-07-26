
(() => {
  const menuToggle = document.getElementById('menuToggle');
  const navLinks = document.getElementById('navLinks');
  if (menuToggle && navLinks) {
    menuToggle.addEventListener('click', () => {
      const open = navLinks.classList.toggle('open');
      menuToggle.setAttribute('aria-expanded', String(open));
    });
    navLinks.querySelectorAll('a').forEach(a => a.addEventListener('click', () => navLinks.classList.remove('open')));
  }

  const reveal = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => entries.forEach(entry => {
      if (entry.isIntersecting) { entry.target.classList.add('visible'); observer.unobserve(entry.target); }
    }), {threshold: .12});
    reveal.forEach(el => observer.observe(el));
  } else reveal.forEach(el => el.classList.add('visible'));

  document.querySelectorAll('[data-lang-choice]').forEach(link => {
    link.addEventListener('click', () => localStorage.setItem('cnp-language', link.dataset.langChoice));
  });

  const dialog = document.getElementById('teamDialog');
  if (dialog) {
    const name = dialog.querySelector('[data-dialog-name]');
    const role = dialog.querySelector('[data-dialog-role]');
    const bio = dialog.querySelector('[data-dialog-bio]');
    const image = dialog.querySelector('[data-dialog-image]');
    const close = dialog.querySelector('[data-dialog-close]');
    document.querySelectorAll('[data-team-card]').forEach(card => {
      card.addEventListener('click', () => {
        name.textContent = card.dataset.name || '';
        role.textContent = card.dataset.role || '';
        bio.textContent = card.dataset.bio || '';
        image.src = card.dataset.image || '';
        image.alt = card.dataset.name || '';
        if (typeof dialog.showModal === 'function') dialog.showModal(); else dialog.setAttribute('open','');
        document.body.classList.add('modal-open');
      });
    });
    const closeDialog = () => { dialog.close(); document.body.classList.remove('modal-open'); };
    close?.addEventListener('click', closeDialog);
    dialog.addEventListener('click', e => { if (e.target === dialog) closeDialog(); });
    dialog.addEventListener('close', () => document.body.classList.remove('modal-open'));
  }

  const form = document.querySelector('[data-email-form]');
  if (form) {
    form.addEventListener('submit', event => {
      event.preventDefault();
      const d = new FormData(form);
      const lang = form.dataset.lang || 'en';
      const level = d.get('level') || '';
      const brand = d.get('brand') || '';
      const product = d.get('product') || '';
      const contact = d.get('contact') || '';
      const email = d.get('email') || '';
      const notes = d.get('notes') || '';
      const strings = {
        en: {
          subject: `CNP product submission — ${brand || 'Brand'} — ${product || 'Product'}`,
          intro: 'Hello CNP team,\n\nI would like to submit a product for an initial CNP assessment.',
          labels: ['Preferred level','Brand','Product','Contact person','Email','Additional notes'],
          attachments: 'I will attach the relevant documents to this email. I understand that Bronze and Silver do not require a physical product sample. For Gold, I will wait for CNP to confirm the experimental protocol before sending samples.',
          privacy: 'I confirm that I am authorised to share the attached material and that unnecessary personal data has been removed.'
        },
        it: {
          subject: `Invio prodotto CNP — ${brand || 'Brand'} — ${product || 'Prodotto'}`,
          intro: 'Gentile team CNP,\n\ndesidero sottoporre un prodotto a una valutazione iniziale CNP.',
          labels: ['Livello preferito','Brand','Prodotto','Persona di contatto','Email','Note aggiuntive'],
          attachments: 'Allegherò a questa email i documenti pertinenti. Ho compreso che Bronze e Silver non richiedono un campione fisico del prodotto. Per Gold attenderò la conferma del protocollo sperimentale da parte di CNP prima di inviare eventuali campioni.',
          privacy: 'Confermo di essere autorizzato/a a condividere il materiale allegato e di aver rimosso i dati personali non necessari.'
        },
        es: {
          subject: `Envío de producto CNP — ${brand || 'Marca'} — ${product || 'Producto'}`,
          intro: 'Estimado equipo de CNP:\n\nDeseo presentar un producto para una evaluación inicial de CNP.',
          labels: ['Nivel preferido','Marca','Producto','Persona de contacto','Correo electrónico','Notas adicionales'],
          attachments: 'Adjuntaré a este correo los documentos pertinentes. Entiendo que Bronze y Silver no requieren una muestra física del producto. Para Gold, esperaré la confirmación del protocolo experimental por parte de CNP antes de enviar muestras.',
          privacy: 'Confirmo que estoy autorizado/a a compartir el material adjunto y que he eliminado los datos personales innecesarios.'
        }
      }[lang];
      const lines = [strings.intro,'',`${strings.labels[0]}: ${level}`,`${strings.labels[1]}: ${brand}`,`${strings.labels[2]}: ${product}`,`${strings.labels[3]}: ${contact}`,`${strings.labels[4]}: ${email}`,`${strings.labels[5]}: ${notes}`,'',strings.attachments,'',strings.privacy,'','Kind regards / Cordiali saluti / Saludos'];
      const href = `mailto:cnp.trust.label@gmail.com?subject=${encodeURIComponent(strings.subject)}&body=${encodeURIComponent(lines.join('\n'))}`;
      window.location.href = href;
    });
  }
})();


// Localised indicative timeline planner
(() => {
  const section = document.querySelector('[data-timeline-lang]');
  if (!section) return;
  const lang = section.dataset.timelineLang || 'en';
  const startInput = document.getElementById('startDate');
  const planInput = document.getElementById('planSelect');
  const phaseList = document.getElementById('phaseList');
  const calendarGrid = document.getElementById('calendarGrid');
  const calendarTitle = document.getElementById('calendarTitle');
  const startPill = document.getElementById('startPill');
  const endPill = document.getElementById('endPill');
  const outcome = document.getElementById('projectedOutcome');
  if (![startInput,planInput,phaseList,calendarGrid,calendarTitle,startPill,endPill,outcome].every(Boolean)) return;
  const locale = {en:'en-GB',it:'it-IT',es:'es-ES'}[lang];
  const copy = {
    en:{days:['Mon','Tue','Wed','Thu','Fri','Sat','Sun'],submission:'Submission received',submissionText:'CNP receives the email and attached digital dossier.',intake:'Completeness check',intakeText:'Files, product identity and requested scope are checked.',assessment:'Scientific assessment',assessmentText:'Evidence gaps and the validation pathway are confirmed.',validation:{bronze:'Documentation and claim review',silver:'In-silico validation',gold:'Experimental programme'},validationText:'Core work for the selected level.',certification:'Estimated decision',certificationText:'Final review, approved wording and evidence package.',start:'Submission',end:'Estimated completion',around:'Indicative completion around',summary:{bronze:'Bronze is based on the existing digital dossier; no physical sample is required.',silver:'Silver adds model-based work; no physical sample is required.',gold:'Gold adds experimental work. Samples are requested later only after protocol approval.'}},
    it:{days:['Lun','Mar','Mer','Gio','Ven','Sab','Dom'],submission:'Ricezione dell’invio',submissionText:'CNP riceve l’email e il dossier digitale allegato.',intake:'Controllo di completezza',intakeText:'Vengono verificati file, identità del prodotto e ambito richiesto.',assessment:'Valutazione scientifica',assessmentText:'Si confermano lacune e percorso di validazione.',validation:{bronze:'Revisione documentale e dei claim',silver:'Validazione in silico',gold:'Programma sperimentale'},validationText:'Attività principale prevista dal livello selezionato.',certification:'Decisione stimata',certificationText:'Revisione finale, wording approvato e pacchetto delle evidenze.',start:'Invio',end:'Completamento stimato',around:'Completamento indicativo intorno al',summary:{bronze:'Bronze utilizza il dossier digitale esistente; non serve un campione fisico.',silver:'Silver aggiunge attività modellistica; non serve un campione fisico.',gold:'Gold aggiunge attività sperimentale. I campioni vengono richiesti solo dopo l’approvazione del protocollo.'}},
    es:{days:['Lun','Mar','Mié','Jue','Vie','Sáb','Dom'],submission:'Recepción del envío',submissionText:'CNP recibe el correo y el expediente digital adjunto.',intake:'Control de integridad',intakeText:'Se revisan archivos, identidad del producto y alcance solicitado.',assessment:'Evaluación científica',assessmentText:'Se confirman lagunas y vía de validación.',validation:{bronze:'Revisión documental y de claims',silver:'Validación in silico',gold:'Programa experimental'},validationText:'Trabajo principal del nivel seleccionado.',certification:'Decisión estimada',certificationText:'Revisión final, wording aprobado y paquete de evidencia.',start:'Envío',end:'Finalización estimada',around:'Finalización indicativa alrededor del',summary:{bronze:'Bronze utiliza el expediente digital existente; no requiere muestra física.',silver:'Silver añade trabajo basado en modelos; no requiere muestra física.',gold:'Gold añade trabajo experimental. Las muestras se solicitan solo después de aprobar el protocolo.'}}
  }[lang];
  const plans={bronze:{name:'Bronze',intake:2,assessment:6,validation:10,final:3},silver:{name:'Silver',intake:2,assessment:6,validation:22,final:3},gold:{name:'Gold',intake:2,assessment:6,validation:43,final:4}};
  const addBusinessDays=(date,days)=>{const result=new Date(date);let added=0;while(added<days){result.setDate(result.getDate()+1);const d=result.getDay();if(d!==0&&d!==6)added++;}return result;};
  const fmt=new Intl.DateTimeFormat(locale,{day:'numeric',month:'short',year:'numeric'});
  const shortFmt=new Intl.DateTimeFormat(locale,{day:'numeric',month:'short'});
  const monthFmt=new Intl.DateTimeFormat(locale,{month:'long',year:'numeric'});
  function render(){
    const start=startInput.value?new Date(startInput.value+'T12:00:00'):new Date();
    const key=planInput.value in plans?planInput.value:'bronze'; const plan=plans[key];
    const intake=addBusinessDays(start,plan.intake); const assessment=addBusinessDays(intake,plan.assessment); const validation=addBusinessDays(assessment,plan.validation); const end=addBusinessDays(validation,plan.final);
    const phases=[[copy.submission,copy.submissionText,start],[copy.intake,copy.intakeText,intake],[copy.assessment,copy.assessmentText,assessment],[copy.validation[key],copy.validationText,validation],[copy.certification,copy.certificationText,end]];
    phaseList.innerHTML=''; phases.forEach((p,i)=>{const row=document.createElement('div');row.className='phase-row';row.innerHTML=`<span>${String(i+1).padStart(2,'0')}</span><div><b>${p[0]}</b><small>${p[1]}</small></div><time>${fmt.format(p[2])}</time>`;phaseList.appendChild(row);});
    startPill.textContent=`${copy.start} · ${shortFmt.format(start)}`; endPill.textContent=`${copy.end} · ${shortFmt.format(end)}`; outcome.innerHTML=`<strong>${plan.name}</strong><span>${copy.around} ${fmt.format(end)}. ${copy.summary[key]}</span>`;
    const y=start.getFullYear(),m=start.getMonth(); calendarTitle.textContent=monthFmt.format(start); calendarGrid.innerHTML=''; copy.days.forEach(d=>{const el=document.createElement('div');el.className='day-name';el.textContent=d;calendarGrid.appendChild(el);});
    let offset=new Date(y,m,1).getDay()-1;if(offset<0)offset=6;for(let i=0;i<offset;i++){const el=document.createElement('div');el.className='day-cell empty';calendarGrid.appendChild(el);}
    const milestones=new Set(phases.map(p=>p[2].toDateString())); const count=new Date(y,m+1,0).getDate();
    for(let day=1;day<=count;day++){const date=new Date(y,m,day,12);const el=document.createElement('div');el.className='day-cell';el.textContent=day;if(date.toDateString()===start.toDateString())el.classList.add('start');else if(date.toDateString()===end.toDateString())el.classList.add('end');else if(milestones.has(date.toDateString()))el.classList.add('milestone');calendarGrid.appendChild(el);}
    const emailSelect=document.querySelector('[data-email-form] select[name="level"]'); if(emailSelect){emailSelect.selectedIndex={bronze:0,silver:1,gold:2}[key];}
  }
  const requested=new URLSearchParams(location.search).get('plan'); if(requested && requested in plans) planInput.value=requested;
  if(!startInput.value) startInput.value=new Date().toISOString().slice(0,10);
  startInput.addEventListener('change',render); planInput.addEventListener('change',render); render();
})();

// Full explanations for the six CNP Standard areas
(() => {
  const dialog=document.getElementById('standardDetailDialog'); const data=window.CNP_STANDARD_DETAILS;
  if(!dialog || !data) return;
  const lang=dialog.dataset.standardLang || 'en'; const topics=['formula','dossier','stability','claims','insilico','experimental']; let current='formula'; let trigger=null;
  const kicker=document.getElementById('standardDetailKicker'); const title=document.getElementById('standardDetailTitle'); const content=document.getElementById('standardDetailContent'); const progress=document.getElementById('standardDetailProgress'); const position=document.getElementById('standardDetailPosition'); const prev=dialog.querySelector('[data-standard-prev]'); const next=dialog.querySelector('[data-standard-next]');
  const labels={en:{purpose:'Why it matters',documents:'Material reviewed',checks:'What CNP checks',gaps:'Common gaps',output:'CNP output',position:'Area'},it:{purpose:'Perché è importante',documents:'Materiale esaminato',checks:'Che cosa controlla CNP',gaps:'Lacune frequenti',output:'Output CNP',position:'Area'},es:{purpose:'Por qué es importante',documents:'Material revisado',checks:'Qué comprueba CNP',gaps:'Lagunas frecuentes',output:'Resultado CNP',position:'Área'}}[lang];
  const list=items=>`<ul>${items.map(x=>`<li>${x}</li>`).join('')}</ul>`;
  function render(topic){const item=data[lang][topic]; if(!item)return; current=topic; const i=topics.indexOf(topic); kicker.textContent=item.kicker; title.textContent=item.title; content.innerHTML=`<p class="standard-dialog-intro">${item.intro}</p><div class="standard-dialog-grid"><section><h3>${labels.purpose}</h3><p>${item.purpose}</p></section><section><h3>${labels.documents}</h3>${list(item.documents)}</section><section><h3>${labels.checks}</h3>${list(item.checks)}</section><section class="warning"><h3>${labels.gaps}</h3>${list(item.gaps)}</section></div><div class="standard-dialog-output"><strong>${labels.output}</strong><p>${item.output}</p></div>`; progress.style.width=`${((i+1)/topics.length)*100}%`; position.textContent=`${labels.position} ${i+1} / ${topics.length}`; prev.disabled=i===0; next.disabled=i===topics.length-1; content.scrollTop=0;}
  function open(topic,el){trigger=el;render(topic); if(typeof dialog.showModal==='function')dialog.showModal();else dialog.setAttribute('open','');document.body.classList.add('modal-open');}
  function close(){if(typeof dialog.close==='function')dialog.close();else dialog.removeAttribute('open');document.body.classList.remove('modal-open');trigger?.focus();}
  document.querySelectorAll('[data-standard-open]').forEach(btn=>btn.addEventListener('click',()=>open(btn.dataset.standardOpen,btn)));
  dialog.querySelector('[data-standard-close]')?.addEventListener('click',close); dialog.addEventListener('click',e=>{if(e.target===dialog)close();}); dialog.addEventListener('close',()=>document.body.classList.remove('modal-open'));
  prev?.addEventListener('click',()=>{const i=topics.indexOf(current);if(i>0)render(topics[i-1]);}); next?.addEventListener('click',()=>{const i=topics.indexOf(current);if(i<topics.length-1)render(topics[i+1]);});
})();
