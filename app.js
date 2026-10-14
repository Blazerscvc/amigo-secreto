// ⚠️ ¡¡PEGA AQUÍ TUS CLAVES REALES DE FIREBASE!! ⚠️
const firebaseConfig = {
  apiKey: "AIzaSyBqM8B7w4sVACl0NAAvsSTp8u7z9KJTwsw",
  authDomain: "amigosecreto-bf77b.firebaseapp.com",
  projectId: "amigosecreto-bf77b",
  storageBucket: "amigosecreto-bf77b.firebasestorage.app",
  messagingSenderId: "877685804801",
  appId: "1:877685804801:web:156006c8acececa95a1500",
  measurementId: "G-J8XCCW50D9"
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

let isAdmin = false; let myAssignedFriendId = null;
let myUserName = "Un Elfo"; // Variable para saber el nombre en el banco
const fechaCena = new Date(2026, 10, 28, 20, 0, 0).getTime();

// NUEVO: unsubBancoRegistry para el registro público
let unsubMyUser = null; let unsubFases = null; let unsubEventos = null; let unsubGlobal = null; let unsubHistorial = null; let unsubUsers = null; let unsubBuzon = null; let unsubAsignaciones = null; let unsubBancoRegistry = null; let buzonInterval = null; let countdownInterval = null;
let faseActual = "Tranquila";
let isRegisterMode = false;

let configFases = {
  "Tranquila": { Nutria: 2.0, Revil: 1.0, Dificultad: 1.0, Novedad: 1.0 },
  "Picante": { Nutria: 1.0, Revil: 1.5, Dificultad: 1.5, Novedad: 1.5 },
  "Caos": { Nutria: 0.5, Revil: 2.0, Dificultad: 2.0, Novedad: 2.0 },
  "Semana Revil": { Nutria: 0.2, Revil: 3.0, Dificultad: 1.5, Novedad: 1.5 }
};

function obtenerFechaDeHoy() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

// ACTUALIZADO PARA FASE 3: Reclama su misión y deja el registro en El Banco
window.reclamarRecompensa = async function(missionId, amount) {
  const btn = document.getElementById(`btn-reclamar-${missionId}`);
  btn.disabled = true;
  btn.textContent = "Reclamando...";
  
  const today = obtenerFechaDeHoy();
  const claimKey = `${today}_${missionId}`;
  
  try {
    await db.collection('users').doc(auth.currentUser.uid).update({
      copos: firebase.firestore.FieldValue.increment(amount),
      [`reclamaciones.${claimKey}`]: true
    });
    
    // Anotar en el Banco Público (FASE 3)
    let motivo = missionId === 'bono' ? "por su Bono Diario" : "por misión del Buzón";
    await db.collection('banco').add({
      texto: `❄️ ${myUserName} ganó ${amount} copos ${motivo}.`,
      timestamp: firebase.firestore.FieldValue.serverTimestamp()
    });
    
  } catch (e) {
    alert("Hubo un problema al reclamar la misión (¿Quizás ya la habías reclamado?). " + e.message);
    btn.disabled = false;
    btn.textContent = "Reclamar";
  }
};

function detenerEscuchas() {
  if (unsubMyUser) unsubMyUser(); 
  if (unsubFases) unsubFases(); 
  if (unsubEventos) unsubEventos(); 
  if (unsubGlobal) unsubGlobal(); 
  if (unsubHistorial) unsubHistorial(); 
  if (unsubUsers) unsubUsers(); 
  if (unsubBuzon) unsubBuzon();
  if (unsubBancoRegistry) unsubBancoRegistry();
  if (unsubAsignaciones) { unsubAsignaciones(); unsubAsignaciones = null; }
  if (buzonInterval) clearInterval(buzonInterval); 
  if (countdownInterval) clearInterval(countdownInterval);
}

async function login(email, password) {
  try { await auth.signInWithEmailAndPassword(email, password); } catch(e) { alert(e.message); }
}
async function register(email, password, name) {
  try { await auth.createUserWithEmailAndPassword(email, password); } catch(e) { alert(e.message); }
}
async function guardarPreferencias(reg, com) {
  await db.collection('users').doc(auth.currentUser.uid).update({ preferences: { regalo: reg, comida: com } });
  setupDashboard(auth.currentUser.uid);
}

async function sortearAmigos() {
  if(!isAdmin) return;
  const usersSnap = await db.collection('users').get();
  let uids = []; let todosConCarta = true;
  usersSnap.forEach(doc => {
      uids.push(doc.id);
      if(!doc.data().preferences) todosConCarta = false;
  });
  
  if(!todosConCarta) { alert("No todos han llenado su carta. No se puede sortear aún."); return; }

  const confirmacion = prompt("Esta acción borrará asignaciones anteriores respetando exclusiones. Escribe CONFIRMAR para continuar:");
  if (confirmacion !== "CONFIRMAR") {
    alert("Sorteo cancelado.");
    return;
  }

  const exclSnap = await db.collection('settings').doc('exclusiones').get();
  let exclusionesLista = (exclSnap.exists && exclSnap.data().lista) ? exclSnap.data().lista : [];

  let shuffled = [...uids];
  let esValido = false;
  let intentos = 0;

  while (!esValido && intentos < 1000) {
    intentos++;
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    esValido = true;
    for (let i = 0; i < shuffled.length; i++) {
      let usuarioOrigen = shuffled[i];
      let usuarioAsignado = shuffled[(i + 1) % shuffled.length];
      
      const tieneExclusion = exclusionesLista.some(ex => ex.origenId === usuarioOrigen && ex.prohibidoId === usuarioAsignado);
      if (tieneExclusion) {
        esValido = false;
        break;
      }
    }
  }

  for(let i=0; i<shuffled.length; i++) {
    let asig = shuffled[(i+1)%shuffled.length];
    await db.collection('asignaciones').doc(shuffled[i]).set({ assignedTo: asig });
  }

  if (!esValido) {
    alert("Sorteo completado. (Nota: Por la cantidad de exclusiones configuradas no fue posible evitar todas las parejas).");
  } else {
    alert("¡Sorteo Mágico completado con éxito respetando todas las exclusiones!");
  }
}

async function signOutApp() {
  detenerEscuchas();
  EffectsEngine.limpiar();
  await auth.signOut();
  
  myAssignedFriendId = null;
  document.getElementById('draw-result').classList.add('hidden');
  document.getElementById('no-draw-message').classList.remove('hidden');
  
  const spanName = document.getElementById('assigned-friend-name');
  if(spanName) {
    spanName.textContent = "---";
    spanName.classList.remove('revealed');
  }
  document.getElementById('friend-regalo').textContent = "-";
  document.getElementById('friend-comida').textContent = "-";
  document.getElementById('welcome-user').textContent = "¡Hola! 👋";
  
  document.getElementById('user-copos').textContent = "--";
  document.getElementById('user-totems').textContent = "--";
  document.getElementById('user-estado').textContent = "Vivo";
  document.getElementById('user-estado').style.color = "inherit";
  document.getElementById('user-equipo').textContent = "Sin Equipo";

  document.getElementById('preferences-screen').classList.add('hidden');
  document.getElementById('dashboard-screen').classList.add('hidden');
  document.getElementById('admin-panel').classList.add('hidden');
  document.getElementById('auth-screen').classList.remove('hidden');
  document.getElementById('auth-form').reset();
}

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('auth-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    if (isRegisterMode) register(email, password, document.getElementById('name').value);
    else login(email, password);
  });

  document.getElementById('toggle-auth').addEventListener('click', (e) => {
    e.preventDefault();
    isRegisterMode = !isRegisterMode;
    document.getElementById('name-group').classList.toggle('hidden', !isRegisterMode);
    document.getElementById('auth-btn').textContent = isRegisterMode ? 'Registrarme 🎄' : 'Iniciar Sesión 🎄';
    e.target.textContent = isRegisterMode ? '¿Ya tienes cuenta? Inicia sesión' : '¿No tienes cuenta? Regístrate';
  });

  document.getElementById('forgot-password').addEventListener('click', async (e) => {
    e.preventDefault();
    const email = prompt("Ingresa tu correo para restablecer la contraseña:");
    if(email) { try { await auth.sendPasswordResetEmail(email); alert("Correo de restablecimiento enviado."); } catch(err) { alert(err.message); } }
  });

  document.getElementById('preferences-form').addEventListener('submit', (e) => {
    e.preventDefault(); guardarPreferencias(document.getElementById('pref-regalo').value, document.getElementById('pref-comida').value);
  });

  async function prepareEditPref() {
    const doc = await db.collection('users').doc(auth.currentUser.uid).get();
    if(doc.exists && doc.data().preferences) {
      document.getElementById('pref-regalo').value = doc.data().preferences.regalo || "";
      document.getElementById('pref-comida').value = doc.data().preferences.comida || "";
    }
    document.getElementById('dashboard-screen').classList.add('hidden');
    document.getElementById('preferences-screen').classList.remove('hidden');
    document.getElementById('cancel-edit-btn').classList.remove('hidden');
  }

  document.getElementById('edit-pref-btn').addEventListener('click', prepareEditPref);
  document.getElementById('edit-pref-btn-drawn').addEventListener('click', prepareEditPref);

  document.getElementById('cancel-edit-btn').addEventListener('click', () => {
    document.getElementById('preferences-screen').classList.add('hidden');
    document.getElementById('dashboard-screen').classList.remove('hidden');
  });

  document.getElementById('logout-btn').addEventListener('click', signOutApp);
  document.getElementById('draw-btn').addEventListener('click', sortearAmigos);

  document.getElementById('chat-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const input = document.getElementById('chat-input');
    if(input.value.trim() === "") return;
    await db.collection('buzon').add({ texto: input.value, timestamp: firebase.firestore.FieldValue.serverTimestamp() });
    input.value = "";
  });
});

auth.onAuthStateChanged(async (user) => {
  if (user) {
    isAdmin = (user.email === "brayanochoaj10@gmail.com");
    document.getElementById('auth-screen').classList.add('hidden');
    
    let docRef = db.collection('users').doc(user.uid);
    let doc = await docRef.get();
    
    if(!doc.exists) {
        let n = isRegisterMode ? document.getElementById('name').value : "Nuevo Usuario";
        await docRef.set({ name: n, email: user.email, copos: 40, totems: 3, estado: 'Vivo', reclamaciones: {}, equipo: 'Sin Equipo' });
        doc = await docRef.get();
    }

    if (!doc.data().preferences) {
      document.getElementById('preferences-screen').classList.remove('hidden');
      document.getElementById('cancel-edit-btn').classList.add('hidden');
    } else {
      setupDashboard(user.uid);
    }
  }
});

function calcularFasePorFecha() {
  const dias = Math.floor((fechaCena - Date.now()) / 86400000);
  if(dias > 30) return "Tranquila"; else if(dias > 15) return "Picante"; else if(dias > 7) return "Caos"; else return "Semana Revil";
}

function setupDashboard(uid) {
  detenerEscuchas();
  
  document.getElementById('preferences-screen').classList.add('hidden'); 
  document.getElementById('dashboard-screen').classList.remove('hidden');
  
  if (isAdmin) setupAdminPanel();

  unsubMyUser = db.collection('users').doc(uid).onSnapshot(userDoc => {
    if(userDoc.exists) {
      const data = userDoc.data();
      if(data.name) {
        const primerNombre = data.name.split(' ')[0];
        myUserName = primerNombre; // Guardamos para el banco
        document.getElementById('welcome-user').textContent = `¡Hola, ${primerNombre}! 👋`;
      }
      
      const coposVal = data.copos !== undefined ? data.copos : 40;
      const totemsVal = data.totems !== undefined ? data.totems : 3;
      document.getElementById('user-copos').textContent = coposVal;
      document.getElementById('user-totems').textContent = totemsVal;
      document.getElementById('user-equipo').textContent = data.equipo || "Sin Equipo"; // Equipo Fase 3
      
      const estadoSpan = document.getElementById('user-estado');
      if(totemsVal <= 0) {
          estadoSpan.textContent = "Caído 💀";
          estadoSpan.style.color = "#c71f37";
      } else {
          estadoSpan.textContent = data.estado || "Vivo";
          estadoSpan.style.color = "inherit";
      }

      const today = obtenerFechaDeHoy();
      const reclamaciones = data.reclamaciones || {};
      
      const btnBono = document.getElementById('btn-reclamar-bono');
      if(reclamaciones[`${today}_bono`]) {
        btnBono.disabled = true; btnBono.textContent = "✅ Listo";
      } else {
        btnBono.disabled = false; btnBono.textContent = "Reclamar";
      }

      const btnBuzon = document.getElementById('btn-reclamar-buzon');
      if(reclamaciones[`${today}_buzon`]) {
        btnBuzon.disabled = true; btnBuzon.textContent = "✅ Listo";
      } else {
        btnBuzon.disabled = false; btnBuzon.textContent = "Reclamar";
      }
    }
  });

  countdownInterval = setInterval(() => {
    const ahora = new Date().getTime(); const dist = fechaCena - ahora;
    if (dist < 0) { document.getElementById("countdown").textContent = "¡ES HOY!"; return; }
    const d = Math.floor(dist / (1000 * 60 * 60 * 24)); const h = Math.floor((dist % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    document.getElementById("countdown").textContent = `${d}d ${h}h ${Math.floor((dist % (1000 * 60 * 60)) / (1000 * 60))}m`;
  }, 1000);

  unsubAsignaciones = db.collection('asignaciones').doc(uid).onSnapshot(async (asigDoc) => {
    if(asigDoc.exists && asigDoc.data().assignedTo) {
      myAssignedFriendId = asigDoc.data().assignedTo;
      document.getElementById('no-draw-message').classList.add('hidden'); 
      document.getElementById('draw-result').classList.remove('hidden');
      
      const friendDoc = await db.collection('users').doc(myAssignedFriendId).get();
      if(friendDoc.exists) {
        const friendData = friendDoc.data();
        document.getElementById('assigned-friend-name').textContent = friendData.name || "Amigo Secreto";
        document.getElementById('friend-regalo').textContent = (friendData.preferences && friendData.preferences.regalo) ? friendData.preferences.regalo : "Aún no ha llenado su carta."; 
        document.getElementById('friend-comida').textContent = (friendData.preferences && friendData.preferences.comida) ? friendData.preferences.comida : "Pendiente.";
      }
    } else {
      myAssignedFriendId = null;
      document.getElementById('draw-result').classList.add('hidden'); 
      document.getElementById('no-draw-message').classList.remove('hidden');
      const spanName = document.getElementById('assigned-friend-name');
      if(spanName) {
        spanName.textContent = "---";
        spanName.classList.remove('revealed');
      }
      document.getElementById('friend-regalo').textContent = "-";
      document.getElementById('friend-comida').textContent = "-";
    }
  }, e => console.log("Error al escuchar asignación:", e));

  unsubFases = db.collection('settings').doc('fases').onSnapshot(doc => {
    if(doc.exists) {
      const data = doc.data();
      faseActual = (data.faseForzada && data.faseForzada !== "auto") ? data.faseForzada : calcularFasePorFecha();
      if(data.multiplicadores) configFases = data.multiplicadores;
      if(isAdmin) { document.getElementById('select-fase-admin').value = data.faseForzada ? data.faseForzada : "auto"; renderMultiplicadoresAdmin(); }
    } else {
      faseActual = calcularFasePorFecha();
    }
    document.getElementById('fase-actual-display').textContent = `Fase Actual: ${faseActual}`;
  });

  unsubEventos = db.collection('settings').doc('eventos').onSnapshot(doc => {
    if(doc.exists && doc.data().lista) eventosCatalogo = doc.data().lista;
    else { eventosCatalogo = eventosPorDefecto; if(isAdmin) db.collection('settings').doc('eventos').set({ lista: eventosCatalogo }); }
    if(isAdmin) renderTablaEventos();
    evaluarEventoGlobalExistente();
  });

  unsubGlobal = db.collection('settings').doc('ruletaGlobal').onSnapshot(async (docSnap) => {
    if(!docSnap.exists) { 
        document.getElementById('estado-evento-actual').textContent = "Sin eventos activos.";
        document.getElementById('active-event-info').classList.add('hidden');
        document.getElementById('no-active-event-msg').classList.remove('hidden');
        EffectsEngine.limpiar(); 
        document.getElementById('admin-banner').classList.add('hidden');
        return; 
    }
    evaluarEventoGlobalExistente(docSnap);
  });

  // ESCUCHA DEL BANCO (FASE 3)
  unsubBancoRegistry = db.collection('banco').orderBy('timestamp', 'desc').limit(10).onSnapshot(snap => {
    const list = document.getElementById('banco-list'); 
    list.innerHTML = "";
    if(snap.empty) {
      list.innerHTML = `<div style="text-align: center; color: #888; font-size: 0.85rem; padding: 10px;">El banco está vacío.</div>`;
      return;
    }
    snap.forEach(doc => {
      const data = doc.data();
      const dateStr = data.timestamp ? new Date(data.timestamp.toDate()).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : "Ahora";
      const d = document.createElement('div');
      d.style.cssText = "padding: 8px; border-bottom: 1px dashed #bbdefb; color: #333; font-size: 0.85rem;";
      d.innerHTML = `<span style="color:#1565c0; font-weight:bold;">[${dateStr}]</span> ${data.texto}`;
      list.appendChild(d);
    });
  });

  unsubHistorial = db.collection('historial_ruleta').orderBy('timestamp', 'desc').limit(5).onSnapshot(snap => {
    const list = document.getElementById('history-list'); list.innerHTML = "";
    snap.forEach(doc => {
      const data = doc.data();
      const dateStr = data.timestamp ? new Date(data.timestamp.toDate()).toLocaleDateString() : "Reciente";
      
      const d = document.createElement('div'); 
      d.style.cssText = "padding: 8px; border-bottom: 1px dotted rgba(255,255,255,0.2); margin-bottom: 5px;";
      
      const title = document.createElement('strong'); 
      title.textContent = `🎲 ${dateStr}: [${data.eventoTitulo}]`; 
      title.style.color = "#ffbe0b";
      d.appendChild(title);
      
      if(data.eventoTexto) {
          const desc = document.createElement('div'); 
          desc.textContent = data.eventoTexto; 
          desc.style.marginTop = "4px"; 
          desc.style.fontSize = "0.75rem"; 
          desc.style.color = "#ddd";
          d.appendChild(desc);
      }
      
      list.appendChild(d);
    });
  });

  unsubBuzon = db.collection('buzon').orderBy('timestamp', 'desc').limit(15).onSnapshot(snap => {
    const list = document.getElementById('inbox-messages'); list.innerHTML = "";
    snap.forEach(doc => {
      const d = document.createElement('div');
      d.style.cssText = "padding: 8px; border-bottom: 1px solid #ddd; background: #fff; margin-bottom: 5px; border-radius: 5px; color: #333;";
      d.textContent = `🕵️: ${doc.data().texto}`;
      list.appendChild(d);
    });
  });

  if(buzonInterval) clearInterval(buzonInterval);
  buzonInterval = setInterval(() => {
    const btn = document.getElementById('send-msg-btn');
    if(Math.random() > 0.8) btn.classList.add('zumbido'); else btn.classList.remove('zumbido');
    
    if(Math.random() > 0.95 && currentActiveEffect !== "apagon") {
        const texts = ["¿Estás seguro?", "Alguien te vigila...", "Ese regalo no le gustará", "Jo Jo Jo"];
        const oldText = document.getElementById('welcome-user').textContent;
        document.getElementById('welcome-user').textContent = texts[Math.floor(Math.random()*texts.length)];
        setTimeout(() => document.getElementById('welcome-user').textContent = oldText, 2000);
    }
  }, 5000);
}

async function evaluarEventoGlobalExistente(docSnap = null) {
    if(!docSnap) {
        const snap = await db.collection('settings').doc('ruletaGlobal').get();
        if(!snap.exists) return;
        docSnap = snap;
    }
    const globalData = docSnap.data();
    if(Date.now() > (globalData.expiresAt ? globalData.expiresAt.toMillis() : 0)) {
      document.getElementById('estado-evento-actual').textContent = "El evento expiró."; 
      document.getElementById('active-event-info').classList.add('hidden');
      document.getElementById('no-active-event-msg').classList.remove('hidden');
      EffectsEngine.limpiar(); document.getElementById('admin-banner').classList.add('hidden'); return;
    }
    
    const ev = eventosCatalogo.find(e => e.id === globalData.eventId);
    if(!ev) return;
    
    document.getElementById('active-event-info').classList.remove('hidden');
    document.getElementById('no-active-event-msg').classList.add('hidden');
    document.getElementById('active-event-title').textContent = ev.titulo;
    document.getElementById('active-event-desc').textContent = ev.texto;
    document.getElementById('active-event-family').textContent = ev.familia;
    document.getElementById('active-event-family').style.backgroundColor = ev.color;
    document.getElementById('active-event-expires').textContent = `Expira: ${globalData.expiresAt ? new Date(globalData.expiresAt.toMillis()).toLocaleString() : "Desconocida"}`;
    
    document.getElementById('btn-replay-roulette').onclick = () => {
      ejecutarEscenaEntrada(globalData.targetAngle, ev, 'roulette-modal', 'roulette-canvas', false, globalData.segmentos);
    };

    const divEstado = document.getElementById('estado-evento-actual');
    divEstado.textContent = `🔥 ACTIVO: ${ev.titulo}`;
    divEstado.style.color = ev.color;

    if(globalData.anuncioAdmin) {
        const banner = document.getElementById('admin-banner');
        banner.textContent = globalData.anuncioAdmin;
        banner.classList.remove('hidden');
    } else {
        document.getElementById('admin-banner').classList.add('hidden');
    }

    const myUserRef = db.collection('users').doc(auth.currentUser.uid);
    const myUserData = (await myUserRef.get()).data();

    if(myUserData.ultimoEventoVisto !== globalData.uuid_giro) {
      await myUserRef.update({ ultimoEventoVisto: globalData.uuid_giro });
      
      const overlay = document.getElementById('audio-overlay');
      overlay.classList.remove('hidden');
      
      const btnStart = document.getElementById('btn-start-scene');
      btnStart.onclick = () => {
         overlay.classList.add('hidden');
         ejecutarEscenaEntrada(globalData.targetAngle, ev, 'roulette-modal', 'roulette-canvas', false, globalData.segmentos);
      };
    } else if(currentActiveEffect !== ev.efectoVisual) {
      EffectsEngine.activate(ev.efectoVisual);
    }
}