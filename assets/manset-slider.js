(function(){
  function init(container){
    if(!container) return;

    const track  = container.querySelector('.manset-slider__track');
    const slides = Array.from(container.querySelectorAll('.manset-slider__slide'));
    const dots   = Array.from(container.querySelectorAll('.manset-slider__dot'));
    const prev   = container.querySelector('.manset-slider__prev');
    const next   = container.querySelector('.manset-slider__next');

    const autoplay   = container.dataset.autoplay === 'true';
    const intervalMs = parseInt(container.dataset.interval || '5000', 10);
    const showArrows = container.dataset.showArrows === 'true';

    if(!showArrows){
      if(prev) prev.style.display='none';
      if(next) next.style.display='none';
    }

    let idx = 0, timer = null, isPointerDown = false, startX = 0, deltaX = 0;

    const stopTimer = ()=>{ if(timer){ clearTimeout(timer); timer=null; } };

    const setActive = (n)=>{
      n = (n + slides.length) % slides.length;
      idx = n;
      track.style.transform = `translateX(-${idx*100}%)`;
      slides.forEach((s,i)=> s.classList.toggle('is-active', i===idx));
      dots.forEach((d,i)=>{
        d.classList.toggle('is-active', i===idx);
        d.setAttribute('aria-selected', i===idx ? 'true' : 'false');
      });
      if(autoplay){ stopTimer(); timer = setTimeout(()=> goNext(), intervalMs); }
      // aktif segment görünür kalsın (mobilde yatay scroll)
      const active = dots[idx];
      if(active && active.scrollIntoView){ active.scrollIntoView({inline:'center', block:'nearest', behavior:'smooth'}); }
    };

    const goPrev = ()=> setActive(idx-1);
    const goNext = ()=> setActive(idx+1);

    // Segments: click + hover -> anında geçiş
    dots.forEach(d => {
      const toIndex = ()=> setActive(parseInt(d.dataset.index,10));
      d.addEventListener('click', ()=>{ stopTimer(); toIndex(); });
      d.addEventListener('mouseenter', ()=>{
        if(window.matchMedia('(hover: hover)').matches){
          stopTimer();
          toIndex();
        }
      });
    });

    // Oklar
    if(prev) prev.addEventListener('click', ()=>{ stopTimer(); goPrev(); });
    if(next) next.addEventListener('click', ()=>{ stopTimer(); goNext(); });

    // Swipe (mobil/masaüstü)
    const vp = container.querySelector('.manset-slider__viewport');
    if(vp){
      vp.addEventListener('pointerdown', (e)=>{ isPointerDown=true; startX=e.clientX; deltaX=0; vp.setPointerCapture(e.pointerId); stopTimer(); });
      vp.addEventListener('pointermove', (e)=>{ if(!isPointerDown) return; deltaX = e.clientX-startX; track.style.transition='none'; track.style.transform=`translateX(calc(-${idx*100}% + ${deltaX}px))`; });
      const endDrag = ()=>{
        if(!isPointerDown) return; isPointerDown=false; track.style.transition='';
        if(Math.abs(deltaX) > vp.clientWidth*0.15){ (deltaX<0) ? goNext() : goPrev(); } else { setActive(idx); }
      };
      vp.addEventListener('pointerup', endDrag);
      vp.addEventListener('pointercancel', endDrag);
    }

    // Start
    setActive(0);
    if(autoplay){ timer = setTimeout(()=> goNext(), intervalMs); }
  }

  window.__MansetSliderInit = function(id){
    const el = typeof id==='string' ? document.getElementById(id) : id;
    init(el);
  };

  window.addEventListener('DOMContentLoaded', ()=>{
    document.querySelectorAll('.manset-slider').forEach(init);
  });
})();