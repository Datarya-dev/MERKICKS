'use strict';
// Progressive enhancement. Product routes, photographs and WhatsApp work without JS.
const page=JSON.parse(document.getElementById('page-data')?.textContent||'{}');
const menu=document.querySelector('.menu-toggle');
const setMenu=open=>{menu?.setAttribute('aria-expanded',String(open));menu?.setAttribute('aria-label',open?'Cerrar menú':'Abrir menú');document.querySelector('.site-header').classList.toggle('menu-open',open);};
menu?.addEventListener('click',()=>setMenu(menu.getAttribute('aria-expanded')!=='true'));
document.querySelectorAll('#navigation a').forEach(a=>a.addEventListener('click',()=>setMenu(false)));
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&menu?.getAttribute('aria-expanded')==='true'){setMenu(false);menu.focus();}});
const reduced=window.matchMedia('(prefers-reduced-motion: reduce)');
if(page.type==='home'){
 const hero=document.querySelector('.hero'),stage=document.querySelector('.scene-stage');
 const scenes=[...document.querySelectorAll('.scene')],nav=[...document.querySelectorAll('[data-goto]')];
 let current=0,start=null,suppressUntil=0;
 const show=index=>{
  current=(index+scenes.length)%scenes.length;
  const s=page.scenes[current];hero.style.setProperty('--scene',s.color);hero.style.setProperty('--scene-accent',s.accent);
  scenes.forEach((el,i)=>{const active=i===current;el.classList.toggle('active',active);el.inert=!active;el.setAttribute('aria-hidden',String(!active));nav[i].setAttribute('aria-pressed',String(active));if(active){const image=el.querySelector('image');if(image.dataset.src)image.setAttribute('href',image.dataset.src);}});
  document.getElementById('scene-announcement').textContent=`${current+1} de ${scenes.length}: ${s.name}`;
 };
 nav.forEach(b=>b.addEventListener('click',()=>show(Number(b.dataset.goto))));
 document.querySelectorAll('[data-direction]').forEach(b=>b.addEventListener('click',()=>show(current+Number(b.dataset.direction))));
 stage.addEventListener('keydown',e=>{if(e.target!==stage)return;if(e.key==='ArrowRight'||e.key==='ArrowLeft'){e.preventDefault();show(current+(e.key==='ArrowRight'?1:-1));}});
 stage.addEventListener('dragstart',e=>e.preventDefault());
 stage.addEventListener('pointerdown',e=>{if(e.button!==0)return;start={x:e.clientX,y:e.clientY,id:e.pointerId};});
 stage.addEventListener('pointerup',e=>{if(!start||start.id!==e.pointerId)return;const dx=e.clientX-start.x,dy=e.clientY-start.y;start=null;if(Math.abs(dx)>45&&Math.abs(dx)>Math.abs(dy)*1.3){suppressUntil=Date.now()+450;show(current+(dx<0?1:-1));}});
 stage.addEventListener('pointercancel',()=>{start=null;});
 stage.addEventListener('click',e=>{if(Date.now()<suppressUntil){e.preventDefault();e.stopPropagation();}},true);
 const filters=[...document.querySelectorAll('[data-filter]')],cards=[...document.querySelectorAll('.product-card')];
 const filter=brand=>{let visible=0;cards.forEach(card=>{card.hidden=brand!=='all'&&card.dataset.brand!==brand;if(!card.hidden)visible++;});filters.forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.filter===brand)));document.getElementById('result-count').textContent=visible;};
 const initial=new URL(location.href).searchParams.get('marca');
 if(filters.some(b=>b.dataset.filter===initial))filter(initial);
 filters.forEach(b=>b.addEventListener('click',()=>{const brand=b.dataset.filter;filter(brand);const url=new URL(location.href);if(brand==='all')url.searchParams.delete('marca');else url.searchParams.set('marca',brand);url.hash='catalogo';history.replaceState(null,'',url);b.scrollIntoView({block:'nearest',inline:'nearest',behavior:reduced.matches?'instant':'smooth'});}));
 window.addEventListener('popstate',()=>{const b=new URL(location.href).searchParams.get('marca');filter(filters.some(f=>f.dataset.filter===b)?b:'all');});
}
if(page.type==='product'){
 const track=document.querySelector('.gallery-track'),thumbs=[...document.querySelectorAll('[data-photo]')];
 const prev=document.querySelector('[data-gallery-step="-1"]'),next=document.querySelector('[data-gallery-step="1"]');
 let current=0,scheduled=false;
 const update=()=>{scheduled=false;current=Math.max(0,Math.min(page.images-1,Math.round(track.scrollLeft/track.clientWidth)));thumbs.forEach((t,i)=>t.setAttribute('aria-pressed',String(i===current)));const count=document.getElementById('gallery-count');if(count)count.textContent=`${current+1} / ${page.images}`;if(prev)prev.disabled=current===0;if(next)next.disabled=current===page.images-1;};
 const go=i=>track.scrollTo({left:Math.max(0,Math.min(page.images-1,i))*track.clientWidth,behavior:reduced.matches?'instant':'smooth'});
 thumbs.forEach(t=>t.addEventListener('click',()=>go(Number(t.dataset.photo))));
 document.querySelectorAll('[data-gallery-step]').forEach(b=>b.addEventListener('click',()=>go(current+Number(b.dataset.galleryStep))));
 track.addEventListener('scroll',()=>{if(!scheduled){scheduled=true;requestAnimationFrame(update);}},{passive:true});
 track.addEventListener('keydown',e=>{if(e.key==='ArrowRight'||e.key==='ArrowLeft'){e.preventDefault();go(current+(e.key==='ArrowRight'?1:-1));}});
 track.addEventListener('dragstart',e=>e.preventDefault());
 let drag=null;
 track.addEventListener('pointerdown',e=>{if(e.pointerType==='mouse'&&e.button===0){drag={x:e.clientX,scroll:track.scrollLeft};track.setPointerCapture(e.pointerId);track.style.scrollSnapType='none';}});
 track.addEventListener('pointermove',e=>{if(drag)track.scrollLeft=drag.scroll+drag.x-e.clientX;});
 const stop=()=>{if(!drag)return;const delta=track.scrollLeft-drag.scroll;const from=Math.round(drag.scroll/track.clientWidth);drag=null;track.style.scrollSnapType='';go(Math.abs(delta)>35?from+(delta>0?1:-1):from);};
 track.addEventListener('pointerup',stop);track.addEventListener('pointercancel',stop);
 update();
}
