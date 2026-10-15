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
let myUserName = "Un Elfo"; let myCurrentCopos = 0; let myCurrentTotems = 0;
const fechaCena = new Date(2026, 10, 28, 20, 0, 0).getTime();

// NUEVO: unsubTienda para la fase 4
let unsubMyUser = null; let unsubFases = null; let unsubEventos = null; let unsubGlobal = null; let unsubHistorial = null; let unsubUsers = null; let unsubBuzon = null; let unsubAsignaciones = null; let unsubBancoRegistry = null; let unsubTienda = null; let buzonInterval = null; let countdownInterval = null;
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

window.reclamarRecompensa = async function(missionId, amount) {
  const btn = document.getElementById(`btn-reclamar-${missionId}`);
  btn.disabled = true; btn.textContent = "Reclamando...";
  const today = obtenerFechaDeHoy(); const claimKey = `${today}_${missionId}`;
  
  try {
    await db.collection('users').doc(auth.currentUser.uid).update({
      copos: firebase.firestore.FieldValue.increment(amount),
      [`reclamaciones.${claimKey}`]: true
    });
    
    let motivo = missionId === 'bono' ? "por su Bono Diario" : "por misión del Buzón";
    await db.collection('banco').add({
      texto: `❄️ ${myUserName} ganó ${amount} copos ${motivo}.`,
      timestamp: firebase.firestore.FieldValue.serverTimestamp()
    });
  } catch (e) {
    alert("Hubo un problema al reclamar la misión. " + e.message);
    btn.disabled = false; btn.textContent = "Reclamar";
  }
};

// COMPRA EN LA TIENDA DE LA RESURRECCIÓN (FASE 4)
window.comprarItemTienda = async function(itemId, precioActual, nombreItem) {
    if (myCurrentCopos < precioActual) {
        alert(`No tienes suficientes copos de nieve. Necesitas ${precioActual}.`);
        return;
    }
    
    // Si compra Tótem y ya tiene 5
    if (itemId === 'totem' && myCurrentTotems >= 5) {
        alert("¡Ya tienes el máximo de vidas (5 Tótems)! Deja algo para los demás.");
        return;
    }

    let targetUidRevive = null;
    let targetNameRevive = null;

    // Lógica especial de Cuchara: Elegir a quién revivir
    if (itemId === 'cuchara') {
        const usersSnap = await db.collection('users').get();
        let caidos = [];
        let listText = "Selecciona el número del caído que deseas revivir:\n\n";
        let i = 1;
        usersSnap.forEach(doc => {
            if (doc.data().totems <= 0) {
                caidos.push({ id: doc.id, name: doc.data().name });
                listText += `${i}. ${doc.data().name}\n`;
                i++;
            }
        });
        
        if (caidos.length === 0) {
            alert("No hay nadie caído (0 tótems) en este momento para revivir.");
            return;
        }
        
        const seleccion = prompt(listText);
        if(!seleccion) return;
        const elegido = caidos[parseInt(seleccion, 10) - 1];
        if(!elegido) return alert("Selección inválida.");
        targetUidRevive = elegido.id;
        targetNameRevive = elegido.name;
    }

    if(!confirm(`¿Seguro que deseas gastar ${precioActual} copos en [${nombreItem}]?`)) return;

    try {
        await db.runTransaction(async (transaction) => {
            const tiendaRef = db.collection('settings').doc('tienda');
            const userRef = db.collection('users').doc(auth.currentUser.uid);
            
            const tiendaDoc = await transaction.get(tiendaRef);
            const userDoc = await transaction.get(userRef);
            
            if (!tiendaDoc.exists) throw "La tienda no está disponible.";
            const dataTienda = tiendaDoc.data();
            const infoItem = dataTienda[itemId];
            
            if (infoItem.stock <= 0) throw "El objeto está agotado.";
            if (userDoc.data().copos < infoItem.precio) throw "Fondos insuficientes al verificar.";

            // 1. Cobrar y aumentar precio por inflación (+5 copos), descontar stock (-1)
            let updatesTienda = {};
            updatesTienda[`${itemId}.stock`] = infoItem.stock - 1;
            updatesTienda[`${itemId}.precio`] = infoItem.precio + 5;
            transaction.update(tiendaRef, updatesTienda);
            
            // 2. Descontar dinero al comprador y entregar item
            let updatesUser = { copos: userDoc.data().copos - infoItem.precio };
            if (itemId === 'totem') updatesUser.totems = userDoc.data().totems + 1;
            if (itemId === 'escudo') updatesUser.escudos = (userDoc.data().escudos || 0) + 1;
            if (itemId === 'comodin') updatesUser.comodines = (userDoc.data().comodines || 0) + 1;
            transaction.update(userRef, updatesUser);

            // 3. Entregar vida si es cuchara
            if (itemId === 'cuchara' && targetUidRevive) {
                const targetRef = db.collection('users').doc(targetUidRevive);
                transaction.update(targetRef, { totems: 1, estado: 'Vivo' });
            }
            
            return infoItem.precio;
        });

        // Registrar en el banco fuera de la transacción
        let msjBanco = `🛒 ${myUserName} compró [${nombreItem}] por ${precioActual} copos.`;
        if (itemId === 'cuchara') msjBanco += ` ¡Y revivió a ${targetNameRevive}! 🥄✨`;
        
        await db.collection('banco').add({
          texto: msjBanco, timestamp: firebase.firestore.FieldValue.serverTimestamp()
        });
        
        alert("¡Compra exitosa! Revisa tu inventario o el banco.");

    } catch(err) {
        alert("Error en la compra: " + err);
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
  if (unsubTienda) unsubTienda();
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
  usersSnap.forEach(doc => { uids.push(doc.id); if(!doc.data().preferences) todosConCarta = false; });
  if(!todosConCarta) return alert("No todos han llenado su carta.");
  if (prompt("Escribe CONFIRMAR para sortear:") !== "CONFIRMAR") return alert("Cancelado.");

  const exclSnap = await db.collection('settings').doc('exclusiones').get();
  let exclusionesLista = (exclSnap.exists && exclSnap.data().lista) ? exclSnap.data().lista : [];
  let shuffled = [...uids]; let esValido = false; let intentos = 0;

  while (!esValido && intentos < 1000) {
    intentos++;
    for (let i = shuffled.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]; }
    esValido = true;
    for (let i = 0; i < shuffled.length; i++) {
      let origen = shuffled[i]; let asignado = shuffled[(i + 1) % shuffled.length];
      if (exclusionesLista.some(ex => ex.origenId === origen && ex.prohibidoId === asignado)) { esValido = false; break; }
    }
  }

  for(let i=0; i<shuffled.length; i++) await db.collection('asignaciones').doc(shuffled[i]).set({ assignedTo: shuffled[(i+1)%shuffled.length] });
  alert(!esValido ? "Sorteo completado con fallos en exclusiones." : "Sorteo completado con éxito.");
}

async function signOutApp() {
  detenerEscuchas();
  EffectsEngine.limpiar();
  await auth.signOut();
  
  myAssignedFriendId = null;
  document.getElementById('draw-result').classList.add('hidden');
  document.getElementById('no-draw-message').classList.remove('hidden');
  
  const spanName = document.getElementById('assigned-friend-name');
  if(spanName) { spanName.textContent = "---"; spanName.classList.remove('revealed'); }
  document.getElementById('friend-regalo').textContent = "-";
  document.getElementById('friend-comida').textContent = "-";
  document.getElementById('welcome-user').textContent = "¡Hola! 👋";
  
  document.getElementById('user-copos').textContent = "--";
  document.getElementById('user-totems').textContent = "--";
  document.getElementById('user-estado').textContent = "Vivo";
  document.getElementById('user-equipo').textContent = "Sin Equipo";
  document.getElementById('user-escudos').textContent = "0";
  document.getElementById('user-comodines').textContent = "0";

  document.getElementById('preferences-screen').classList.add('hidden');
  document.getElementById('dashboard-screen').classList.add('hidden');
  document.getElementById('admin-panel').classList.add('hidden');
  document.getElementById('auth-screen').classList.remove('hidden');
  document.getElementById('auth-form').reset();
}

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('auth-form').addEventListener('submit', (e) => {
    e.preventDefault();
    if (isRegisterMode) register(document.getElementById('email').value, document.getElementById('password').value, document.getElementById('name').value);
    else login(document.getElementById('email').value, document.getElementById('password').value);
  });

  document.getElementById('toggle-auth').addEventListener('click', (e) => {
    e.preventDefault(); isRegisterMode = !isRegisterMode;
    document.getElementById('name-group').classList.toggle('hidden', !isRegisterMode);
    document.getElementById('auth-btn').textContent = isRegisterMode ? 'Registrarme 🎄' : 'Iniciar Sesión 🎄';
    e.target.textContent = isRegisterMode ? '¿Ya tienes cuenta? Inicia sesión' : '¿No tienes cuenta? Regístrate';
  });

  document.getElementById('forgot-password').addEventListener('click', async (e) => {
    e.preventDefault();
    const email = prompt("Ingresa tu correo:");
    if(email) { try { await auth.sendPasswordResetEmail(email); alert("Enviado."); } catch(err) { alert(err.message); } }
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
  document.getElementById('cancel-edit-btn').addEventListener('click', () => { document.getElementById('preferences-screen').classList.add('hidden'); document.getElementById('dashboard-screen').classList.remove('hidden'); });
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
        await docRef.set({ name: n, email: user.email, copos: 40, totems: 3, estado: 'Vivo', reclamaciones: {}, equipo: 'Sin Equipo', escudos: 0, comodines: 0 });
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

function setupDashboard(uid) {
  detenerEscuchas();
  document.getElementById('preferences-screen').classList.add('hidden'); 
  document.getElementById('dashboard-screen').classList.remove('hidden');
  if (isAdmin) setupAdminPanel();

  unsubMyUser = db.collection('users').doc(uid).onSnapshot(userDoc => {
    if(userDoc.exists) {
      const data = userDoc.data();
      myUserName = data.name ? data.name.split(' ')[0] : "Elfo";
      myCurrentCopos = data.copos || 0;
      myCurrentTotems = data.totems || 0;
      
      document.getElementById('welcome-user').textContent = `¡Hola, ${myUserName}! 👋`;
      document.getElementById('user-copos').textContent = myCurrentCopos;
      document.getElementById('user-totems').textContent = myCurrentTotems;
      document.getElementById('user-equipo').textContent = data.equipo || "Sin Equipo";
      document.getElementById('user-escudos').textContent = data.escudos || "0";
      document.getElementById('user-comodines').textContent = data.comodines || "0";
      
      const estadoSpan = document.getElementById('user-estado');
      if(myCurrentTotems <= 0) { estadoSpan.textContent = "Caído 💀"; estadoSpan.style.color = "#c71f37"; } 
      else { estadoSpan.textContent = data.estado || "Vivo"; estadoSpan.style.color = "inherit"; }

      const today = obtenerFechaDeHoy(); const reclamaciones = data.reclamaciones || {};
      const btnBono = document.getElementById('btn-reclamar-bono');
      if(reclamaciones[`${today}_bono`]) { btnBono.disabled = true; btnBono.textContent = "✅ Listo"; } else { btnBono.disabled = false; btnBono.textContent = "Reclamar"; }
      const btnBuzon = document.getElementById('btn-reclamar-buzon');
      if(reclamaciones[`${today}_buzon`]) { btnBuzon.disabled = true; btnBuzon.textContent = "✅ Listo"; } else { btnBuzon.disabled = false; btnBuzon.textContent = "Reclamar"; }
    }
  });

  // RENDERIZAR TIENDA (FASE 4)
  unsubTienda = db.collection('settings').doc('tienda').onSnapshot(doc => {
      const grid = document.getElementById('tienda-grid');
      grid.innerHTML = "";
      if(!doc.exists) { grid.innerHTML = "<p>Tienda cerrada.</p>"; return; }
      
      const items = doc.data();
      const catalog = [
          { id: 'escudo', icon: '🛡️', desc: 'Te protege automáticamente del próximo castigo Revil.' },
          { id: 'comodin', icon: '🃏', desc: 'Úsalo para saltarte un reto en vivo.' },
          { id: 'totem', icon: '🗿', desc: '+1 Vida extra. Límite máximo: 5 tótems por persona.' },
          { id: 'cuchara', icon: '🥄', desc: 'Resurrección. Compra esto para revivir a un amigo caído (Vuelve con 1 tótem).' }
      ];

      catalog.forEach(cat => {
          if(!items[cat.id]) return;
          const data = items[cat.id];
          const div = document.createElement('div');
          div.className = 'item-card';
          
          let btnHtml = '';
          if (data.stock > 0) {
              btnHtml = `<button class="btn-small" style="background:#ffbe0b; color:black; font-weight:bold; margin-top:5px;" onclick="comprarItemTienda('${cat.id}', ${data.precio}, '${data.nombre}')">Comprar</button>`;
          } else {
              btnHtml = `<button class="btn-small" disabled style="margin-top:5px;">Agotado</button>`;
          }

          div.innerHTML = `
            <div class="item-icon">${cat.icon}</div>
            <div class="item-name">${data.nombre}</div>
            <div class="item-desc">${cat.desc}</div>
            <div class="item-price">Precio: ${data.precio} ❄️</div>
            <div class="item-stock">Quedan: ${data.stock} ud.</div>
            ${btnHtml}
          `;
          grid.appendChild(div);
      });
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
        document.getElementById('assigned-friend-name').textContent = friendDoc.data().name || "Amigo Secreto";
        document.getElementById('friend-regalo').textContent = (friendDoc.data().preferences && friendDoc.data().preferences.regalo) ? friendDoc.data().preferences.regalo : "Aún no ha llenado su carta."; 
        document.getElementById('friend-comida').textContent = (friendDoc.data().preferences && friendDoc.data().preferences.comida) ? friendDoc.data().preferences.comida : "Pendiente.";
      }
    } else {
      myAssignedFriendId = null;
      document.getElementById('draw-result').classList.add('hidden'); 
      document.getElementById('no-draw-message').classList.remove('hidden');
      document.getElementById('assigned-friend-name').textContent = "---";
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
    } else { faseActual = calcularFasePorFecha(); }
    document.getElementById('fase-actual-display').textContent = `Fase Actual: ${faseActual}`;
  });

  unsubEventos = db.collection('settings').doc('eventos').onSnapshot(doc => {
    if(doc.exists && doc.data().lista) eventosCatalogo = doc.data().lista;
    else { eventosCatalogo = eventosPorDefecto; if(isAdmin) db.collection('settings').doc('eventos').set({ lista: eventosCatalogo }); }
    if(isAdmin) renderTablaEventos(); evaluarEventoGlobalExistente();
  });

  unsubGlobal = db.collection('settings').doc('ruletaGlobal').onSnapshot(async (docSnap) => {
    if(!docSnap.exists) { 
        document.getElementById('estado-evento-actual').textContent = "Sin eventos activos.";
        document.getElementById('active-event-info').classList.add('hidden');
        document.getElementById('no-active-event-msg').classList.remove('hidden');
        EffectsEngine.limpiar(); document.getElementById('admin-banner').classList.add('hidden'); return; 
    }
    evaluarEventoGlobalExistente(docSnap);
  });

  unsubBancoRegistry = db.collection('banco').orderBy('timestamp', 'desc').limit(10).onSnapshot(snap => {
    const list = document.getElementById('banco-list'); list.innerHTML = "";
    if(snap.empty) { list.innerHTML = `<div style="text-align: center; color: #888; font-size: 0.85rem; padding: 10px;">El banco está vacío.</div>`; return; }
    snap.forEach(doc => {
      const data = doc.data(); const dateStr = data.timestamp ? new Date(data.timestamp.toDate()).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : "Ahora";
      const d = document.createElement('div'); d.style.cssText = "padding: 8px; border-bottom: 1px dashed #bbdefb; color: #333; font-size: 0.85rem;";
      d.innerHTML = `<span style="color:#1565c0; font-weight:bold;">[${dateStr}]</span> ${data.texto}`; list.appendChild(d);
    });
  });

  unsubHistorial = db.collection('historial_ruleta').orderBy('timestamp', 'desc').limit(5).onSnapshot(snap => {
    const list = document.getElementById('history-list'); list.innerHTML = "";
    snap.forEach(doc => {
      const data = doc.data(); const dateStr = data.timestamp ? new Date(data.timestamp.toDate()).toLocaleDateString() : "Reciente";
      const d = document.createElement('div'); d.style.cssText = "padding: 8px; border-bottom: 1px dotted rgba(255,255,255,0.2); margin-bottom: 5px;";
      d.innerHTML = `<strong style="color:#ffbe0b;">🎲 ${dateStr}: [${data.eventoTitulo}]</strong>`;
      if(data.eventoTexto) d.innerHTML += `<div style="margin-top:4px; font-size:0.75rem; color:#ddd;">${data.eventoTexto}</div>`;
      list.appendChild(d);
    });
  });

  unsubBuzon = db.collection('buzon').orderBy('timestamp', 'desc').limit(15).onSnapshot(snap => {
    const list = document.getElementById('inbox-messages'); list.innerHTML = "";
    snap.forEach(doc => {
      const d = document.createElement('div');
      d.style.cssText = "padding: 8px; border-bottom: 1px solid #ddd; background: #fff; margin-bottom: 5px; border-radius: 5px; color: #333;";
      d.textContent = `🕵️: ${doc.data().texto}`; list.appendChild(d);
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
    if(!docSnap) { const snap = await db.collection('settings').doc('ruletaGlobal').get(); if(!snap.exists) return; docSnap = snap; }
    const globalData = docSnap.data();
    if(Date.now() > (globalData.expiresAt ? globalData.expiresAt.toMillis() : 0)) {
      document.getElementById('estado-evento-actual').textContent = "El evento expiró."; 
      document.getElementById('active-event-info').classList.add('hidden');
      document.getElementById('no-active-event-msg').classList.remove('hidden');
      EffectsEngine.limpiar(); document.getElementById('admin-banner').classList.add('hidden'); return;
    }
    
    const ev = eventosCatalogo.find(e => e.id === globalData.eventId); if(!ev) return;
    
    document.getElementById('active-event-info').classList.remove('hidden');
    document.getElementById('no-active-event-msg').classList.add('hidden');
    document.getElementById('active-event-title').textContent = ev.titulo;
    document.getElementById('active-event-desc').textContent = ev.texto;
    document.getElementById('active-event-family').textContent = ev.familia;
    document.getElementById('active-event-family').style.backgroundColor = ev.color;
    document.getElementById('active-event-expires').textContent = `Expira: ${globalData.expiresAt ? new Date(globalData.expiresAt.toMillis()).toLocaleString() : "Desconocida"}`;
    document.getElementById('btn-replay-roulette').onclick = () => { ejecutarEscenaEntrada(globalData.targetAngle, ev, 'roulette-modal', 'roulette-canvas', false, globalData.segmentos); };

    const divEstado = document.getElementById('estado-evento-actual');
    divEstado.textContent = `🔥 ACTIVO: ${ev.titulo}`; divEstado.style.color = ev.color;
    if(globalData.anuncioAdmin) { document.getElementById('admin-banner').textContent = globalData.anuncioAdmin; document.getElementById('admin-banner').classList.remove('hidden'); } 
    else { document.getElementById('admin-banner').classList.add('hidden'); }

    const myUserRef = db.collection('users').doc(auth.currentUser.uid);
    const myUserData = (await myUserRef.get()).data();

    if(myUserData.ultimoEventoVisto !== globalData.uuid_giro) {
      await myUserRef.update({ ultimoEventoVisto: globalData.uuid_giro });
      document.getElementById('audio-overlay').classList.remove('hidden');
      document.getElementById('btn-start-scene').onclick = () => {
         document.getElementById('audio-overlay').classList.add('hidden');
         ejecutarEscenaEntrada(globalData.targetAngle, ev, 'roulette-modal', 'roulette-canvas', false, globalData.segmentos);
      };
    } else if(currentActiveEffect !== ev.efectoVisual) { EffectsEngine.activate(ev.efectoVisual); }
}