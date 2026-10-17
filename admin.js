let modoJugadorActivo = false;

window.toggleModoJugador = function() {
  modoJugadorActivo = !modoJugadorActivo;
  if (modoJugadorActivo) {
    document.getElementById('admin-panel').classList.add('hidden');
    document.getElementById('btn-volver-admin').classList.remove('hidden');
  } else {
    document.getElementById('admin-panel').classList.remove('hidden');
    document.getElementById('btn-volver-admin').classList.add('hidden');
  }
};

// BOTÓN MÁGICO PARA LA TIENDA
window.iniciarFeriaSemanalAdmin = async function() {
    if(!confirm("¿Seguro que quieres reiniciar la tienda? Los precios volverán al mínimo y el stock se rellenará.")) return;
    try {
        const catalogoFeria = {
            "escudo": { nombre: "Escudo", precio: 20, stock: 3 },
            "comodin": { nombre: "Comodín", precio: 25, stock: 2 },
            "totem": { nombre: "Tótem Extra", precio: 30, stock: 5 },
            "cuchara": { nombre: "Cuchara de la Resurrección", precio: 50, stock: 2 }
        };
        await db.collection('settings').doc('tienda').set(catalogoFeria);
        await db.collection('banco').add({ texto: "🎪 ¡LA FERIA SEMANAL HA COMENZADO! Tienda reabastecida.", timestamp: firebase.firestore.FieldValue.serverTimestamp() });
        alert("¡Feria Semanal iniciada! Tienda reabastecida.");
    } catch(e) {
        alert("Error al iniciar feria: " + e.message);
    }
};

function setupAdminPanel() {
  document.getElementById('admin-panel').classList.remove('hidden');
  cargarExclusionesAdminUI();

  unsubUsers = db.collection('users').onSnapshot(snap => {
    const container = document.getElementById('admin-users-list');
    container.textContent = "";
    if(snap.empty) { container.textContent = "No hay usuarios registrados."; return; }
    
    const ul = document.createElement('ul');
    ul.style.cssText = "text-align: left; font-size: 0.85rem; background: #fff; padding: 10px; border-radius: 8px; color: #111; list-style: none; margin: 0;";
    
    snap.forEach(doc => {
      const u = doc.data(); const uid = doc.id;
      const li = document.createElement('li');
      li.style.cssText = "display: flex; flex-direction: column; padding: 10px 0; border-bottom: 1px solid #eee; gap: 8px;";
      
      const topRow = document.createElement('div'); topRow.style.cssText = "display: flex; justify-content: space-between; align-items: center;";
      const infoDiv = document.createElement('div'); infoDiv.style.cssText = "overflow: hidden; text-overflow: ellipsis; max-width: 55%;";
      
      const strongName = document.createElement('strong'); strongName.textContent = u.name || "Sin nombre";
      const spanEmail = document.createElement('span'); spanEmail.style.cssText = "font-size: 0.75rem; color: #666;"; spanEmail.textContent = ` (${u.email || ''})`;
      
      infoDiv.appendChild(strongName); infoDiv.appendChild(spanEmail); infoDiv.appendChild(document.createTextNode(u.preferences ? ' ✅' : ' ❌'));

      const actionsDiv = document.createElement('div'); actionsDiv.style.cssText = "display: flex; gap: 4px;";

      const btnEdit = document.createElement('button'); btnEdit.type = "button"; btnEdit.textContent = "✏️"; btnEdit.style.cssText = "padding: 3px 6px; font-size: 0.75rem; margin: 0; background: #6a4c93; border-radius: 4px;"; btnEdit.onclick = () => editarUsuarioAdmin(uid, u);
      const btnAssign = document.createElement('button'); btnAssign.type = "button"; btnAssign.textContent = "🎯"; btnAssign.style.cssText = "padding: 3px 6px; font-size: 0.75rem; margin: 0; background: #1a5e20; border-radius: 4px;"; btnAssign.onclick = () => asignarAmigoManualAdmin(uid, u.name || u.email);
      const btnDelete = document.createElement('button'); btnDelete.type = "button"; btnDelete.textContent = "🗑️"; btnDelete.style.cssText = "padding: 3px 6px; font-size: 0.75rem; margin: 0; background: #c71f37; border-radius: 4px;"; btnDelete.onclick = () => eliminarUsuarioAdmin(uid, u.name || u.email);

      actionsDiv.appendChild(btnEdit); actionsDiv.appendChild(btnAssign); actionsDiv.appendChild(btnDelete);
      topRow.appendChild(infoDiv); topRow.appendChild(actionsDiv);
      
      const coposVal = u.copos !== undefined ? u.copos : 40;
      const totemsVal = u.totems !== undefined ? u.totems : 3;
      const escudosVal = u.escudos || 0;
      const comodinesVal = u.comodines || 0;
      const equipoVal = u.equipo || "";
      const safeName = (u.name || 'Un Elfo').replace(/'/g, "\\'"); 

      const statsDiv = document.createElement('div');
      statsDiv.style.cssText = "display: flex; gap: 8px; font-size: 0.8rem; align-items: center; background: #f8f9fa; padding: 5px; border-radius: 5px; flex-wrap: wrap;";
      statsDiv.innerHTML = `
        <label style="display:flex; align-items:center; gap:2px;">❄️ <input type="number" id="admin-copos-${uid}" value="${coposVal}" style="width: 40px; padding: 2px; font-size: 0.7rem;"></label>
        <label style="display:flex; align-items:center; gap:2px;">🗿 <input type="number" id="admin-totems-${uid}" value="${totemsVal}" style="width: 30px; padding: 2px; font-size: 0.7rem;"></label>
        <label style="display:flex; align-items:center; gap:2px;">🛡️ <input type="number" id="admin-escudos-${uid}" value="${escudosVal}" style="width: 30px; padding: 2px; font-size: 0.7rem;"></label>
        <label style="display:flex; align-items:center; gap:2px;">🃏 <input type="number" id="admin-comodines-${uid}" value="${comodinesVal}" style="width: 30px; padding: 2px; font-size: 0.7rem;"></label>
        <label style="display:flex; align-items:center; gap:2px;">🏅 <select id="admin-team-${uid}" style="width: 70px; padding: 2px; font-size: 0.7rem;">
           <option value="">Ninguno</option>
           <option value="Equipo 1" ${equipoVal==='Equipo 1'?'selected':''}>Eq. 1</option>
           <option value="Equipo 2" ${equipoVal==='Equipo 2'?'selected':''}>Eq. 2</option>
           <option value="Equipo 3" ${equipoVal==='Equipo 3'?'selected':''}>Eq. 3</option>
        </select></label>
        <button class="btn-small" style="background:#f4a261; color:black; font-weight:bold; padding: 2px 8px; margin:0; border-radius:4px;" onclick="guardarEconomiaAdmin('${uid}', '${safeName}')">💾</button>
      `;

      li.appendChild(topRow); li.appendChild(statsDiv); ul.appendChild(li);
    });
    container.appendChild(ul);
  });
}

window.guardarEconomiaAdmin = async function(uid, userName) {
    const coposInput = document.getElementById(`admin-copos-${uid}`);
    const totemsInput = document.getElementById(`admin-totems-${uid}`);
    const escudosInput = document.getElementById(`admin-escudos-${uid}`);
    const comodinesInput = document.getElementById(`admin-comodines-${uid}`);
    const teamInput = document.getElementById(`admin-team-${uid}`);
    
    if(!coposInput || !totemsInput || !teamInput) return;
    
    try {
        await db.collection('users').doc(uid).update({
            copos: parseInt(coposInput.value, 10) || 0,
            totems: parseInt(totemsInput.value, 10) || 0,
            escudos: parseInt(escudosInput.value, 10) || 0,
            comodines: parseInt(comodinesInput.value, 10) || 0,
            equipo: teamInput.value
        });
        await db.collection('banco').add({ texto: `⚖️ Admin editó inventario de ${userName}.`, timestamp: firebase.firestore.FieldValue.serverTimestamp() });
    } catch (e) { alert("Error al actualizar economía: " + e.message); }
};

window.asignarAmigoManualAdmin = async function(uid, userName) {
  try {
    const usersSnap = await db.collection('users').get();
    let idMap = {}; let msg = `Selecciona el amigo secreto para "${userName}":\n\n`; let idx = 1;
    usersSnap.forEach(doc => { if (doc.id !== uid) { let name = doc.data().name || doc.data().email; msg += `${idx}. ${name}\n`; idMap[idx] = { id: doc.id, name: name }; idx++; } });
    const seleccion = prompt(msg); if (!seleccion) return;
    const elegido = idMap[parseInt(seleccion, 10)];
    if (elegido && confirm(`¿Confirmas asignar a "${elegido.name}"?`)) { await db.collection('asignaciones').doc(uid).set({ assignedTo: elegido.id }); alert("¡Guardado!"); }
  } catch(e) { alert("Error: " + e.message); }
};

async function cargarExclusionesAdminUI() {
  const container = document.getElementById('admin-exclusiones-lista'); if(!container) return; container.textContent = "";
  try {
    const docSnap = await db.collection('settings').doc('exclusiones').get();
    if(!docSnap.exists || !docSnap.data().lista || docSnap.data().lista.length === 0) { container.textContent = "No hay exclusiones."; return; }
    const ul = document.createElement('ul'); ul.style.cssText = "margin:0; padding-left:15px;";
    docSnap.data().lista.forEach(e => {
      const li = document.createElement('li');
      li.innerHTML = `<strong>${e.origenNombre || "User"}</strong> ❌ NO le toca <strong>${e.prohibidoNombre || "User"}</strong>`;
      ul.appendChild(li);
    });
    container.appendChild(ul);
  } catch(e) { container.textContent = "Error al cargar."; }
}

window.agregarExclusionManualAdmin = async function() {
  try {
    const usersSnap = await db.collection('users').get(); let usersList = [];
    usersSnap.forEach(d => usersList.push({ id: d.id, name: d.data().name || d.data().email }));
    if(usersList.length < 2) return alert("Se necesitan al menos 2 usuarios.");
    
    let msg1 = "Selecciona ORIGEN:\n"; usersList.forEach((u, i) => msg1 += `${i + 1}. ${u.name}\n`);
    let sel1 = prompt(msg1); if(!sel1) return; let u1 = usersList[parseInt(sel1, 10) - 1]; if(!u1) return alert("Inválido.");

    let msg2 = `¿A quién NO le regala "${u1.name}"?:\n`; usersList.filter(u => u.id !== u1.id).forEach((u, i) => msg2 += `${i + 1}. ${u.name}\n`);
    let sel2 = prompt(msg2); if(!sel2) return; let u2 = usersList.filter(u => u.id !== u1.id)[parseInt(sel2, 10) - 1]; if(!u2) return alert("Inválido.");

    const docRef = db.collection('settings').doc('exclusiones'); const docSnap = await docRef.get();
    let lista = (docSnap.exists && docSnap.data().lista) ? docSnap.data().lista : [];
    lista.push({ origenId: u1.id, origenNombre: u1.name, prohibidoId: u2.id, prohibidoNombre: u2.name });
    await docRef.set({ lista: lista }, { merge: true });
    alert("Exclusión guardada."); cargarExclusionesAdminUI();
  } catch(e) { alert("Error: " + e.message); }
};

window.limpiarExclusionesAdmin = async function() {
  if(prompt("Escribe CONFIRMAR para borrar exclusiones:") === "CONFIRMAR") { await db.collection('settings').doc('exclusiones').set({ lista: [] }); cargarExclusionesAdminUI(); alert("Borradas."); }
};

window.sincronizarEventosBase = async function() {
  if (!isAdmin) return alert("❌ No eres Administrador.");
  try {
    const docSnap = await db.collection('settings').doc('eventos').get();
    let listaActual = (docSnap.exists && docSnap.data().lista) ? docSnap.data().lista : [...eventosCatalogo];
    let mapaExistentes = new Map(); listaActual.forEach((ev, index) => { mapaExistentes.set(ev.id, index); });
    let agregados = 0; let actualizados = 0;

    eventosBase.forEach(evBase => {
      if (mapaExistentes.has(evBase.id)) {
        const idx = mapaExistentes.get(evBase.id);
        listaActual[idx] = { id: evBase.id, titulo: evBase.titulo, texto: evBase.texto, familia: evBase.familia, color: evBase.color, efectoVisual: evBase.efectoVisual, peso: evBase.peso, activo: listaActual[idx].activo !== undefined ? listaActual[idx].activo : evBase.activo };
        actualizados++;
      } else { listaActual.push({ ...evBase }); agregados++; }
    });

    await db.collection('settings').doc('eventos').set({ lista: listaActual }, { merge: true });
    alert(`¡Sincronizado! Nuevos: ${agregados} | Actualizados: ${actualizados}`);
  } catch (e) { alert("Error al sincronizar: " + e.message); }
};
window.cargarEventosBase = window.sincronizarEventosBase;

window.editarUsuarioAdmin = async function(uid, userData) {
  const n = prompt("Nombre completo:", userData.name || "");
  if (n) { try { await db.collection('users').doc(uid).update({ name: n.trim() }); alert("Actualizado."); } catch(e) { alert("Error: " + e.message); } }
};

window.eliminarUsuarioAdmin = async function(uid, userName) {
  if (prompt(`🚨 ELIMINAR al usuario "${userName}". Escribe CONFIRMAR:`) === "CONFIRMAR") {
    try { await db.collection('users').doc(uid).delete(); await db.collection('asignaciones').doc(uid).delete().catch(() => {}); alert(`Eliminado.`); } catch(e) { alert("Error: " + e.message); }
  }
};

window.sortearPersonaAdmin = async function() {
  if(!isAdmin) return alert("❌ No eres Administrador.");
  try {
    const usersSnap = await db.collection('users').get(); if(usersSnap.empty) return alert("No hay usuarios.");
    const sorteosSnap = await db.collection('sorteos_persona').get(); const yaSorteadosIds = new Set();
    sorteosSnap.forEach(doc => { if(doc.data().userId) yaSorteadosIds.add(doc.data().userId); });
    let candidatos = []; usersSnap.forEach(doc => { if(!yaSorteadosIds.has(doc.id)) candidatos.push({ id: doc.id, name: doc.data().name || doc.data().email }); });

    if(candidatos.length === 0) { if(confirm("¡Todos salieron! ¿Reiniciar?")) await window.reiniciarSorteosPersonaAdmin(); return; }

    const elegido = candidatos[Math.floor(Math.random() * candidatos.length)];
    await db.collection('sorteos_persona').add({ userId: elegido.id, userName: elegido.name, timestamp: firebase.firestore.FieldValue.serverTimestamp() });
    
    document.getElementById('sorteo-persona-nombre').textContent = elegido.name; document.getElementById('sorteo-persona-resultado').classList.remove('hidden');
    confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } }); alert(`🎯 Persona sorteada: ${elegido.name}`);
  } catch(e) { alert("Error: " + e.message); }
};

window.reiniciarSorteosPersonaAdmin = async function() {
  if(!confirm("¿Reiniciar historial de sorteados?")) return;
  try {
    const snap = await db.collection('sorteos_persona').get(); const batch = db.batch(); snap.forEach(doc => batch.delete(doc.ref)); await batch.commit();
    document.getElementById('sorteo-persona-resultado').classList.add('hidden'); alert("Reiniciado.");
  } catch(e) { alert("Error: " + e.message); }
};

window.forzarFase = function(fase) { db.collection('settings').doc('fases').set({ faseForzada: fase }, {merge: true}); };

function renderMultiplicadoresAdmin() {
  let html = '';
  for (let fase in configFases) {
    html += `<div><strong>${fase}</strong><div style="display:flex; gap:5px; margin-bottom:10px;">`;
    for (let fam in configFases[fase]) { html += `<label style="display:flex; flex-direction:column; align-items:center;"><span style="font-size:0.7rem;">${fam.substring(0,3)}</span><input type="number" step="0.1" class="mult-input" data-fase="${fase}" data-fam="${fam}" value="${configFases[fase][fam]}" style="width:50px; padding:2px; font-size:0.8rem; background:#fff; color:#000;"></label>`; }
    html += `</div></div>`;
  }
  document.getElementById('admin-multiplicadores').innerHTML = html;
}

window.guardarMultiplicadores = async function() {
  const inputs = document.querySelectorAll('.mult-input'); let nuevosMults = JSON.parse(JSON.stringify(configFases));
  inputs.forEach(inp => { let val = parseFloat(inp.value); nuevosMults[inp.dataset.fase][inp.dataset.fam] = isNaN(val) ? 0 : val; });
  await db.collection('settings').doc('fases').set({ multiplicadores: nuevosMults }, {merge: true}); alert('Guardado.');
};

window.emergencyKillSwitch = async function() {
  if(prompt("🚨 APAGAR EVENTO GLOBAL INSTANTÁNEO. Escribe CONFIRMAR:") === "CONFIRMAR") { await db.collection('settings').doc('ruletaGlobal').delete(); EffectsEngine.limpiar(); alert("Cancelado globalmente."); }
};

window.terminarEventoGlobal = async function() {
  if(prompt("Escribe CONFIRMAR para terminar:") === "CONFIRMAR") { await db.collection('settings').doc('ruletaGlobal').delete(); EffectsEngine.limpiar(); alert("Finalizado."); }
};

// FUNCIÓN CORREGIDA Y CON MANEJO DE ERRORES COMPLETO
window.iniciarGiroAdmin = async function() {
  // 1. Diagnóstico de Administrador
  if (!auth.currentUser) {
    return alert("❌ No hay ninguna sesión activa.");
  }
  
  if (!isAdmin && auth.currentUser.email !== "brayanochoaj10@gmail.com") {
    return alert(`❌ Sesión actual (${auth.currentUser.email}) no coincide con el administrador autorizado.`);
  }

  // Forzamos la bandera a true si el correo coincide
  isAdmin = true;

  try {
    // 2. Verificación del catálogo de eventos
    let evActivos = eventosCatalogo.filter(e => e.activo);
    
    if (evActivos.length === 0) {
      const snapEv = await db.collection('settings').doc('eventos').get();
      if (snapEv.exists && snapEv.data().lista) {
        eventosCatalogo = snapEv.data().lista;
        evActivos = eventosCatalogo.filter(e => e.activo);
      }
    }

    if (evActivos.length === 0) {
      return alert("⚠️ No hay eventos activos en memoria. Haz clic en '🔄 Sincronizar eventos base' primero.");
    }
    
    // 3. Cálculo de fase y ponderación
    faseActual = typeof calcularFasePorFecha === 'function' ? calcularFasePorFecha() : "Tranquila"; 
    const docFases = await db.collection('settings').doc('fases').get();
    if (docFases.exists && docFases.data().faseForzada && docFases.data().faseForzada !== "auto") {
      faseActual = docFases.data().faseForzada;
    }

    const mults = configFases[faseActual] || configFases["Tranquila"]; 
    let totalPeso = 0;
    const eventosConPeso = evActivos.map(ev => { 
      let m = mults[ev.familia] !== undefined ? mults[ev.familia] : 1; 
      let pesoAjustado = ev.peso * m; 
      totalPeso += pesoAjustado; 
      return { ...ev, pesoCalculado: pesoAjustado }; 
    });

    if (totalPeso <= 0) {
      return alert("⚠️ El peso total de los eventos es 0. Revisa las configuraciones de fase.");
    }

    // 4. Selección aleatoria
    let random = Math.random() * totalPeso; 
    let evElegido = eventosConPeso[0];
    for (let i = 0; i < eventosConPeso.length; i++) { 
      if (random < eventosConPeso[i].pesoCalculado) { 
        evElegido = eventosConPeso[i]; 
        break; 
      } 
      random -= eventosConPeso[i].pesoCalculado; 
    }
    
    // 5. Generar segmentos para la ruleta
    let segmentosGiro = [{ id: evElegido.id, titulo: evElegido.titulo, color: evElegido.color }]; 
    let posiblesSenuelos = eventosConPeso.filter(e => e.id !== evElegido.id);
    
    for (let i = 0; i < 7; i++) {
      if (posiblesSenuelos.length === 0) break; 
      let randIdx = Math.floor(Math.random() * posiblesSenuelos.length);
      segmentosGiro.push({ 
        id: posiblesSenuelos[randIdx].id, 
        titulo: posiblesSenuelos[randIdx].titulo, 
        color: posiblesSenuelos[randIdx].color 
      }); 
      posiblesSenuelos.splice(randIdx, 1);
    }

    for (let i = segmentosGiro.length - 1; i > 0; i--) { 
      const j = Math.floor(Math.random() * (i + 1)); 
      [segmentosGiro[i], segmentosGiro[j]] = [segmentosGiro[j], segmentosGiro[i]]; 
    }

    const elegIndex = segmentosGiro.findIndex(s => s.id === evElegido.id);
    const targetAngle = (3 * Math.PI / 2) - ((elegIndex + 0.5) * (Math.PI * 2 / segmentosGiro.length));

    const anuncio = prompt("¿Anuncio del Admin? (Opcional):"); 
    const ts = firebase.firestore.FieldValue.serverTimestamp();

    // 6. Escritura en Firestore
    await db.collection('settings').doc('ruletaGlobal').set({ 
      eventId: evElegido.id, 
      targetAngle: targetAngle, 
      uuid_giro: Math.random().toString(36).substring(2), 
      timestamp: ts, 
      expiresAt: firebase.firestore.Timestamp.fromDate(new Date(Date.now() + 172800000)), 
      segmentos: segmentosGiro, 
      anuncioAdmin: anuncio || null 
    });

    await db.collection('historial_ruleta').add({ 
      eventoId: evElegido.id, 
      eventoTitulo: evElegido.titulo, 
      eventoTexto: evElegido.texto, 
      timestamp: ts 
    });

    alert("🎉 ¡Ruleta activada con éxito para todos los usuarios!");

  } catch (err) {
    console.error("Error al girar la ruleta:", err);
    alert("❌ Error de Firestore: " + err.message);
  }
};

function renderTablaEventos() {
  const container = document.getElementById('admin-eventos-lista'); container.innerHTML = "";
  const table = document.createElement('table'); table.style.cssText = "width:100%; font-size:0.8rem; text-align:left; border-collapse: collapse; background:#fff; color:#000;"; table.innerHTML = `<tr style="background:#eee;"><th>Título</th><th>Fam</th><th>Peso</th><th>⚙️</th></tr>`;
  eventosCatalogo.forEach(ev => {
    const tr = document.createElement('tr'); if(!ev.activo) tr.style.cssText = "opacity:0.5; text-decoration:line-through";
    tr.innerHTML = `<td style="padding:4px; border-bottom:1px solid #ddd;"></td><td style="padding:4px; border-bottom:1px solid #ddd;">${ev.familia.substring(0,3)}</td><td style="padding:4px; border-bottom:1px solid #ddd;">${ev.peso}</td><td style="padding:4px; border-bottom:1px solid #ddd;"><button type="button" style="padding:2px 5px; margin:0;" onclick="cargarEventoEditor('${ev.id}')">✏️</button></td>`;
    tr.querySelector('td').textContent = ev.titulo; table.appendChild(tr);
  });
  container.appendChild(table);
}

window.cargarEventoEditor = function(id) {
  const ev = eventosCatalogo.find(e => e.id === id); if(!ev) return;
  document.getElementById('edit-ev-id').value = ev.id; document.getElementById('edit-ev-titulo').value = ev.titulo; document.getElementById('edit-ev-texto').value = ev.texto; document.getElementById('edit-ev-familia').value = ev.familia; document.getElementById('edit-ev-peso').value = ev.peso; document.getElementById('edit-ev-efecto').value = ev.efectoVisual || "nada"; document.getElementById('edit-ev-activo').checked = ev.activo !== false;
};

window.limpiarFormEvento = function() { document.getElementById('form-editar-evento').reset(); document.getElementById('edit-ev-id').value = ""; };

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('form-editar-evento').addEventListener('submit', async (e) => {
    e.preventDefault();
    let id = document.getElementById('edit-ev-id').value; if(!id) id = "ev_" + Math.random().toString(36).substring(2,8);
    let pesoVal = parseInt(document.getElementById('edit-ev-peso').value, 10); if(isNaN(pesoVal)) pesoVal = 10;
    
    const obj = { id: id, titulo: document.getElementById('edit-ev-titulo').value, texto: document.getElementById('edit-ev-texto').value, familia: document.getElementById('edit-ev-familia').value, peso: pesoVal, efectoVisual: document.getElementById('edit-ev-efecto').value, color: document.getElementById('edit-ev-familia').value === "Nutria" ? "#1a5e20" : (document.getElementById('edit-ev-familia').value === "Revil" ? "#c71f37" : (document.getElementById('edit-ev-familia').value === "Novedad" ? "#ffbe0b" : "#6a4c93")), activo: document.getElementById('edit-ev-activo').checked };
    let nuevaLista = [...eventosCatalogo]; const idx = nuevaLista.findIndex(e => e.id === id); if(idx >= 0) nuevaLista[idx] = obj; else nuevaLista.push(obj);
    await db.collection('settings').doc('eventos').set({ lista: nuevaLista }); limpiarFormEvento(); alert("Guardado.");
  });
});

window.abrirModoCena = function() {
  document.getElementById('app-wrapper').classList.add('hidden'); document.getElementById('cena-screen').classList.remove('hidden');
  initAudio(); const canvas = document.getElementById('cena-canvas'); const ctx = canvas.getContext('2d');
  const radius = canvas.width / 2; const arc = Math.PI * 2 / eventosCenaEspeciales.length; ctx.clearRect(0,0,canvas.width,canvas.height);
  for(let i=0; i<eventosCenaEspeciales.length; i++) {
    ctx.beginPath(); ctx.fillStyle = eventosCenaEspeciales[i].color; ctx.moveTo(radius, radius); ctx.arc(radius, radius, radius, i*arc, (i+1)*arc); ctx.fill(); ctx.stroke();
    ctx.save(); ctx.translate(radius, radius); ctx.rotate(i * arc + arc / 2);
    ctx.fillStyle = "white"; ctx.font = "bold 14px Poppins"; ctx.textAlign = "right"; ctx.fillText(eventosCenaEspeciales[i].titulo, radius - 20, 5); ctx.restore();
  }
};
window.cerrarModoCena = function() { document.getElementById('cena-screen').classList.add('hidden'); document.getElementById('app-wrapper').classList.remove('hidden'); document.getElementById('cena-resultado-box').classList.add('hidden'); };
window.girarModoCena = function() {
  document.getElementById('btn-girar-cena').disabled = true; document.getElementById('cena-resultado-box').classList.add('hidden');
  const elegIndex = Math.floor(Math.random() * eventosCenaEspeciales.length); const evFinal = eventosCenaEspeciales[elegIndex];
  const targetAngle = (3 * Math.PI / 2) - ((elegIndex + 0.5) * (Math.PI * 2 / eventosCenaEspeciales.length));
  ejecutarEscenaEntrada(targetAngle, evFinal, null, 'cena-canvas', true);
};