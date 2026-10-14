let currentActiveEffect = null;

const EffectsEngine = {
  frames: [], intervals: [], fugitiveListeners: [],
  limpiar: function() {
    document.getElementById('app-wrapper').className = ''; 
    document.getElementById('btn-disable-effects').classList.add('hidden');
    
    // Ocultar pista del apagón
    const apagonHint = document.getElementById('apagon-hint');
    if (apagonHint) apagonHint.classList.add('hidden');

    this.frames.forEach(cancelAnimationFrame); 
    this.intervals.forEach(clearInterval);
    this.frames = []; this.intervals = [];
    
    const c = document.getElementById('efectos-canvas'); 
    c.classList.add('hidden'); 
    c.getContext('2d').clearRect(0,0,c.width,c.height);
    
    document.removeEventListener('mousemove', this.updateLight); 
    document.removeEventListener('touchmove', this.updateLight);
    document.querySelectorAll('[data-orig]').forEach(el => el.textContent = el.getAttribute('data-orig'));
    
    this.fugitiveListeners.forEach(item => {
      item.btn.removeEventListener('pointerover', item.fn);
      item.btn.removeEventListener('touchstart', item.fn);
      delete item.btn._fleeCount;
    });
    this.fugitiveListeners = [];
    
    document.querySelectorAll('.efecto-fugitivo').forEach(btn => { 
      btn.classList.remove('efecto-fugitivo'); 
      btn.style.transform = ''; 
      delete btn._fleeCount;
    });
    
    currentActiveEffect = null;
  },
  activate: function(id) {
    this.limpiar(); if(!id || id==='nada') return;
    currentActiveEffect = id; 
    document.getElementById('btn-disable-effects').classList.remove('hidden');
    const wrap = document.getElementById('app-wrapper');
    
    if(id==='apagon') { 
      wrap.classList.add('effect-apagon'); 
      const apagonHint = document.getElementById('apagon-hint');
      if (apagonHint) apagonHint.classList.remove('hidden');
      document.addEventListener('mousemove', this.updateLight); 
      document.addEventListener('touchmove', this.updateLight); 
    }
    else if(['minecraft','al-reves','caos','glitch'].includes(id)) wrap.classList.add('effect-'+id);
    else if(id==='grinch') {
      wrap.classList.add('effect-grinch');
      ['h1','h2','h3'].forEach(t => document.querySelectorAll(t).forEach(el => { if(!el.hasAttribute('data-orig')) el.setAttribute('data-orig', el.textContent); el.textContent = "Grinch Manda"; }));
    } else if(id==='tormenta' || id==='nutrias') { this.particulas(id==='tormenta'); }
    else if(id==='fugitivos') {
      document.querySelectorAll('button').forEach(btn => {
        if(btn.closest('#admin-panel') || btn.closest('#roulette-modal') || btn.id === 'btn-disable-effects' || btn.id === 'logout-btn' || btn.classList.contains('btn-danger')) return;
        
        btn.classList.add('efecto-fugitivo');
        btn._fleeCount = 0;

        const fn = (e) => {
          // Huir solo las primeras 3 veces por botón
          if ((btn._fleeCount || 0) >= 3) return;
          btn._fleeCount = (btn._fleeCount || 0) + 1;

          const x = (Math.random() - 0.5) * 200;
          const y = (Math.random() - 0.5) * 100;
          btn.style.transform = `translate(${x}px, ${y}px)`;
        };

        btn.addEventListener('pointerover', fn);
        btn.addEventListener('touchstart', fn, { passive: true }); // Sin preventDefault para evitar bloqueo de interacción
        this.fugitiveListeners.push({btn, fn});
      });
    }
  },
  updateLight: function(e) {
    let x = e.clientX || (e.touches && e.touches[0].clientX); 
    let y = e.clientY || (e.touches && e.touches[0].clientY);
    document.querySelector('.container').style.setProperty('--cursor-x', x + 'px'); 
    document.querySelector('.container').style.setProperty('--cursor-y', y + 'px');
  },
  particulas: function(isNieve) {
    const c = document.getElementById('efectos-canvas'); c.width = window.innerWidth; c.height = window.innerHeight;
    c.classList.remove('hidden'); const ctx = c.getContext('2d'); let parts = [];
    for(let i=0; i<50; i++) parts.push({ x: Math.random()*c.width, y: Math.random()*c.height, r: Math.random()*4+1, dx: (Math.random()-0.5)*2, dy: Math.random()*3+1, e: Math.random()>0.5?'🦦':'🎁' });
    function anim() {
      ctx.clearRect(0,0,c.width,c.height); ctx.fillStyle="rgba(255,255,255,0.8)"; ctx.font="20px Arial";
      parts.forEach(p => {
        p.y += p.dy; p.x += p.dx; if(p.y > c.height) { p.y = -10; p.x = Math.random()*c.width; }
        if(isNieve) { ctx.beginPath(); ctx.arc(p.x,p.y,p.r,0,Math.PI*2); ctx.fill(); } else ctx.fillText(p.e, p.x, p.y);
      });
      EffectsEngine.frames.push(requestAnimationFrame(anim));
    } anim();
  }
};
window.limpiarEfectosGlobales = function(manualUser = false) { EffectsEngine.limpiar(); if(manualUser) alert("Efectos minimizados localmente."); };