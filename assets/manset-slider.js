(function(){
  function init(container){
    if(!container) return;

    const track  = container.querySelector('.manset-slider__track');
    const slides = Array.from(container.querySelectorAll('.manset-slider__slide'));
    const dots   = Array.from(container.querySelectorAll('.manset-slider__dot'));
    const prev   = container.querySelector('.manset-slider__prev');
    const next   = container.querySelector('.manset-slider__next');
    const vp     = container.querySelector('.manset-slider__viewport');

    const autoplay   = container.dataset.autoplay === 'true';
    const intervalMs = parseInt(container.dataset.interval || '5000', 10);
    const showArrows = container.dataset.showArrows === 'true';

    if(!showArrows){ if(prev) prev.style.display='none'; if(next) next.style.display='none'; }

    let idx=0, timer=null;
    let isDragging=false, startX=0, startY=0, deltaX=0, axis=null;
    let suppressClick=false;

    const stopTimer=()=>{ if(timer){ clearTimeout(timer); timer=null; } };

    const setActive=(n)=>{
      n=(n+slides.length)%slides.length;
      idx=n;
      track.style.transform=`translateX(-${idx*100}%)`;
      slides.forEach((s,i)=> s.classList.toggle('is-active', i===idx));
      dots.forEach((d,i)=>{
        d.classList.toggle('is-active', i===idx);
        d.setAttribute('aria-selected', i===idx?'true':'false');
      });
      if(autoplay){ stopTimer(); timer=setTimeout(()=>goNext(),intervalMs); }
      const active=dots[idx];
      if(active && active.scrollIntoView){ active.scrollIntoView({inline:'center',block:'nearest',behavior:'smooth'}); }
    };

    const goPrev=()=>setActive(idx-1);
    const goNext=()=>setActive(idx+1);

    dots.forEach(d=>{
      const toIndex=()=>setActive(parseInt(d.dataset.index,10));
      d.addEventListener('click',()=>{ stopTimer(); toIndex(); });
      d.addEventListener('mouseenter',()=>{ if(window.matchMedia('(hover:hover)').matches){ stopTimer(); toIndex(); } });
    });

    if(prev) prev.addEventListener('click',()=>{ stopTimer(); goPrev(); });
    if(next) next.addEventListener('click',()=>{ stopTimer(); goNext(); });

    /* Swipe + click guard */
    function dragStart(x,y){ isDragging=true; startX=x; startY=y; deltaX=0; axis=null; suppressClick=false; stopTimer(); track.style.transition='none'; }
    function dragMove(x,y,e){
      if(!isDragging) return;
      const dx=x-startX, dy=y-startY;
      if(axis==null && (Math.abs(dx)>6||Math.abs(dy)>6)) axis=(Math.abs(dx)>Math.abs(dy)?'x':'y');
      if(axis==='x'){ deltaX=dx; if(e&&e.cancelable) e.preventDefault(); track.style.transform=`translateX(calc(-${idx*100}% + ${deltaX}px))`; }
      if(Math.abs(dx)>8) suppressClick=true;
    }
    function dragEnd(){
      if(!isDragging) return;
      isDragging=false; track.style.transition='';
      const width=(vp?vp.clientWidth:container.clientWidth);
      const threshold=width*0.15;
      if(Math.abs(deltaX)>threshold){ (deltaX<0)?goNext():goPrev(); }
      else setActive(idx);
      setTimeout(()=>{ suppressClick=false; },50);
    }

    container.addEventListener('click',(e)=>{
      if(suppressClick && e.target.closest('a.manset-slider__link')){
        e.preventDefault(); e.stopPropagation();
      }
    },true);

    if(window.PointerEvent && vp){
      vp.addEventListener('pointerdown',(e)=>{ vp.setPointerCapture(e.pointerId); dragStart(e.clientX,e.clientY); });
      vp.addEventListener('pointermove',(e)=>dragMove(e.clientX,e.clientY,e));
      vp.addEventListener('pointerup',dragEnd);
      vp.addEventListener('pointercancel',dragEnd);
    } else if(vp){
      vp.addEventListener('touchstart',(e)=>{ const t=e.changedTouches[0]; dragStart(t.clientX,t.clientY); },{passive:true});
      vp.addEventListener('touchmove',(e)=>{ const t=e.changedTouches[0]; dragMove(t.clientX,t.clientY,e); },{passive:false});
      vp.addEventListener('touchend',()=>dragEnd(),{passive:true});
      vp.addEventListener('touchcancel',()=>dragEnd(),{passive:true});
      vp.addEventListener('mousedown',(e)=>dragStart(e.clientX,e.clientY));
      window.addEventListener('mousemove',(e)=>dragMove(e.clientX,e.clientY));
      window.addEventListener('mouseup',dragEnd);
    }

    setActive(0);
    if(autoplay){ timer=setTimeout(()=>goNext(),intervalMs); }
  }

  window.__MansetSliderInit=id=>{ const el=document.getElementById(id); if(el) init(el); };
  document.addEventListener('DOMContentLoaded',()=>{ document.querySelectorAll('.manset-slider').forEach(init); });
})();