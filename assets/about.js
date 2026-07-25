(() => {
  function initTeamDialog(){
    const cards=[...document.querySelectorAll('[data-team]')];
    const dialog=document.getElementById('teamDialog');
    const backdrop=document.getElementById('teamDialogBackdrop');
    const closeButton=document.getElementById('teamDialogClose');
    const image=document.getElementById('teamDialogImage');
    const role=document.getElementById('teamDialogRole');
    const name=document.getElementById('teamDialogName');
    const bio=document.getElementById('teamDialogBio');
    if(!cards.length||!dialog||!backdrop||!closeButton||!image||!role||!name||!bio)return;

    const people={
      elvira:{name:'Elvira Martino',role:'CNP Team',image:'assets/team-elvira.webp',bio:'<p>Elvira’s detailed biography will be added once the final team profile has been approved.</p>'},
      francesco:{name:'Francesco Vallini',role:'Molecular Design',image:'assets/team-francesco.webp',bio:'<p>Francesco is a third-year PhD candidate in Molecular Design with a background in Pharmaceutical Chemistry and Technology.</p><p>He has experience in the synthesis, characterization, and biological evaluation of bioactive compounds, bringing strong scientific expertise to product evidence assessment and validation.</p>'},
      sneha:{name:'Sneha Khandelwal',role:'CNP Team',image:'assets/team-sneha.webp',bio:'<p>Sneha’s detailed biography will be added once the final team profile has been approved.</p>'},
      anna:{name:'Anna Crispino',role:'Biomedical Engineering',image:'assets/team-anna.webp',bio:'<p>Anna is a biomedical engineer with a PhD in Biomedical Engineering and postdoctoral researcher specializing in computational modelling, biomechanics and scientific innovation.</p><p>At CNP, she transforms scientific evidence into clear, credible standards that make natural cosmetics easier to understand and trust.</p>'}
    };

    let lastTrigger=null;
    function openDialog(key,trigger){
      const person=people[key];
      if(!person)return;
      lastTrigger=trigger;
      image.src=person.image;
      image.alt=person.name;
      role.textContent=person.role;
      name.textContent=person.name;
      bio.innerHTML=person.bio;
      dialog.hidden=false;
      backdrop.hidden=false;
      document.body.classList.add('lock');
      cards.forEach(card=>card.setAttribute('aria-expanded',String(card===trigger)));
      requestAnimationFrame(()=>{
        backdrop.classList.add('open');
        dialog.classList.add('open');
        closeButton.focus();
      });
    }

    function closeDialog(){
      dialog.classList.remove('open');
      backdrop.classList.remove('open');
      document.body.classList.remove('lock');
      cards.forEach(card=>card.setAttribute('aria-expanded','false'));
      window.setTimeout(()=>{
        dialog.hidden=true;
        backdrop.hidden=true;
        if(lastTrigger&&typeof lastTrigger.focus==='function')lastTrigger.focus();
      },260);
    }

    cards.forEach(card=>{
      card.setAttribute('aria-expanded','false');
      card.addEventListener('click',event=>{
        event.preventDefault();
        openDialog(card.dataset.team,card);
      });
      card.addEventListener('keydown',event=>{
        if(event.key==='Enter'||event.key===' '){event.preventDefault();openDialog(card.dataset.team,card);}
      });
    });
    closeButton.addEventListener('click',closeDialog);
    backdrop.addEventListener('click',closeDialog);
    dialog.addEventListener('click',event=>event.stopPropagation());
    document.addEventListener('keydown',event=>{
      if(dialog.hidden)return;
      if(event.key==='Escape')closeDialog();
      if(event.key==='Tab'){
        const focusable=[...dialog.querySelectorAll('button:not([disabled]),a[href],input,select,textarea,[tabindex]:not([tabindex="-1"])')];
        if(!focusable.length)return;
        const first=focusable[0],last=focusable[focusable.length-1];
        if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus();}
        else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus();}
      }
    });
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',initTeamDialog,{once:true});
  else initTeamDialog();
})();
