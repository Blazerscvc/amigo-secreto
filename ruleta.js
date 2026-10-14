let audioCtx = null;
let isSceneRunning = false;

function initAudio() { if(!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)(); audioCtx.resume(); }

function playTick() {
  if (!audioCtx) return; const osc = audioCtx.createOscillator(); const gain = audioCtx.createGain();
  osc.type = 'square'; osc.frequency.setValueAtTime(400, audioCtx.currentTime); osc.frequency.exponentialRampToValueAtTime(100, audioCtx.currentTime + 0.05);
  gain.gain.setValueAtTime(0.1, audioCtx.currentTime); gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.05);
  osc.connect(gain); gain.connect(audioCtx.destination); osc.start(); osc.stop(audioCtx.currentTime + 0.05);
}
function playWin() {
  if (!audioCtx) return; const osc = audioCtx.createOscillator(); const gain = audioCtx.createGain();
  osc.type = 'sine'; osc.frequency.setValueAtTime(440, audioCtx.currentTime); osc.frequency.setValueAtTime(880, audioCtx.currentTime + 0.3);
  gain.gain.setValueAtTime(0.2, audioCtx.currentTime); gain.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 0.6);
  osc.connect(gain); gain.connect(audioCtx.destination); osc.start(); osc.stop(audioCtx.currentTime + 0.6);
}

function ejecutarEscenaEntrada(targetAngle, eventoFinal, modalId, canvasId, isCena, segmentosGlobales = null) {
  if(isSceneRunning) return;
  isSceneRunning = true;
  initAudio(); 
  const canvas = document.getElementById(canvasId); 
  const ctx = canvas.getContext('2d');
  
  if(modalId) { 
    document.getElementById(modalId).classList.remove('hidden'); 
    document.getElementById('roulette-modal-result').classList.add('hidden'); 
  }
  
  const dataset = isCena ? eventosCenaEspeciales : (segmentosGlobales || eventosCatalogo.filter(e=>e.activo));
  const numSegments = dataset.length; 
  const arc = Math.PI * 2 / numSegments;
  const totalRotation = (Math.PI * 2 * 4) + targetAngle;
  let lastTick = -1;

  const DURATION = 4000; // Exactamente 4 segundos medidos por reloj
  let startTime = null;

  function easeOutQuart(x) { return 1 - Math.pow(1 - x, 4); }

  function animate(timestamp) {
    if (!startTime) startTime = timestamp;
    const elapsed = timestamp - startTime;
    let progress = elapsed / DURATION;
    if (progress >= 1) progress = 1;

    const currentAngle = (totalRotation * easeOutQuart(progress)) % (Math.PI * 2);
    ctx.clearRect(0, 0, canvas.width, canvas.height); 
    const r = canvas.width / 2;
    
    for (let i = 0; i < numSegments; i++) {
      ctx.beginPath(); ctx.fillStyle = dataset[i].color;
      ctx.moveTo(r, r); ctx.arc(r, r, r, currentAngle + i * arc, currentAngle + (i+1) * arc);
      ctx.fill(); ctx.stroke();
      ctx.save(); ctx.translate(r, r); ctx.rotate(currentAngle + i * arc + arc / 2);
      ctx.fillStyle = "white"; ctx.font = "bold 12px Poppins"; ctx.textAlign = "right"; 
      let label = dataset[i].titulo;
      if(label.length > 15) label = label.substring(0, 15) + "...";
      ctx.fillText(label, r - 10, 4); ctx.restore();
    }
    
    let topAngle = (Math.PI * 1.5 - currentAngle) % (Math.PI * 2); 
    if (topAngle < 0) topAngle += Math.PI * 2;
    const currSeg = Math.floor(topAngle / arc);
    if(currSeg !== lastTick && progress < 0.99) { playTick(); lastTick = currSeg; }
    
    if (progress < 1) {
      requestAnimationFrame(animate);
    } else {
      playWin(); 
      confetti({ particleCount: 150, spread: 90, origin: { y: isCena ? 0.8 : 0.6 }, colors: [eventoFinal.color, '#fff'] });
      isSceneRunning = false;
      
      if(isCena) {
        document.getElementById('cena-event-title').textContent = eventoFinal.titulo;
        document.getElementById('cena-event-title').style.color = eventoFinal.color;
        document.getElementById('cena-event-desc').textContent = eventoFinal.texto;
        document.getElementById('cena-resultado-box').classList.remove('hidden');
        document.getElementById('btn-girar-cena').disabled = false;
      } else {
        document.getElementById('modal-event-title').textContent = eventoFinal.titulo;
        document.getElementById('modal-event-title').style.color = eventoFinal.color;
        document.getElementById('modal-event-desc').textContent = eventoFinal.texto;
        document.getElementById('roulette-modal-result').classList.remove('hidden');
        document.getElementById('btn-aceptar-destino').onclick = () => { 
          document.getElementById(modalId).classList.add('hidden'); 
          EffectsEngine.activate(eventoFinal.efectoVisual); 
        };
      }
    }
  }
  requestAnimationFrame(animate);
}