// =====================================================================
// CATÁLOGO BASE DE EVENTOS - 60 eventos (15 por familia)
// =====================================================================
let eventosCatalogo = [];

const eventosPorDefecto = [
  { id: "e1", familia: "Nutria", color: "#1a5e20", titulo: "Manto de Nieve", texto: "Inmunidad total.", efectoVisual: "nutrias", peso: 10, activo: true }
];

const eventosCenaEspeciales = [
  { color: "#c71f37", titulo: "Brindis Obligatorio", texto: "El más joven del grupo debe dar un brindis ahora mismo." },
  { color: "#1a5e20", titulo: "Impuesto de Cena", texto: "Todos ponen $5.000 más para las bebidas." },
  { color: "#ffbe0b", titulo: "Abrazo Musical", texto: "Tienen 10 segundos para abrazar a su amigo secreto." },
  { color: "#6a4c93", titulo: "Confesión", texto: "El host debe confesar cuál regalo compró a última hora." },
  { color: "#ff5722", titulo: "Reto de Mímica", texto: "Describe sin hablar el regalo que recibiste o que diste." },
  { color: "#00bcd4", titulo: "Foto Grupal Caótica", texto: "Todos posan para una foto con la peor pose o mueca posible." },
  { color: "#8bc34a", titulo: "Historia Navideña", texto: "Cada uno añade una frase para inventar una historia navideña loca." },
  { color: "#e91e63", titulo: "Cambio de Silla", texto: "Caos total: todos deben moverse inmediatamente a otro puesto de la mesa." }
];

const eventosBase = [
 
  // ---------------- NUTRIA (amables, de ventaja) ----------------
  { id: "nut01", familia: "Nutria", color: "#1a5e20", titulo: "Manto de Nieve", texto: "Mientras dure el evento nadie del grupo puede hacerle bromas ni retos a otro. Paz navideña total.", efectoVisual: "tormenta", peso: 10, activo: true },
  { id: "nut02", familia: "Nutria", color: "#1a5e20", titulo: "Nutria Pistera", texto: "Pídele una pista extra a tu amigo secreto por el buzón. Quien reciba la petición debe responder con una pista real.", efectoVisual: "nutrias", peso: 10, activo: true },
  { id: "nut03", familia: "Nutria", color: "#1a5e20", titulo: "Lluvia de Regalos", texto: "Todos le envían a su amigo secreto un mensaje lindo por el buzón. Cero chiste, puro cariño.", efectoVisual: "nutrias", peso: 12, activo: true },
  { id: "nut04", familia: "Nutria", color: "#1a5e20", titulo: "Nutria Abrazadora", texto: "Escríbele al grupo algo que admiras de una persona del grupo (que no sea tu amigo secreto).", efectoVisual: "nutrias", peso: 10, activo: true },
  { id: "nut05", familia: "Nutria", color: "#1a5e20", titulo: "Día de Perdón", texto: "Cualquier reto o castigo pendiente queda perdonado. Borrón y cuenta nueva.", efectoVisual: "nutrias", peso: 8, activo: true },
  { id: "nut06", familia: "Nutria", color: "#1a5e20", titulo: "Nutria de Oro", texto: "Quien anuncie un extra para la cena (postre, bebida o snack) se gana los aplausos de todo el grupo.", efectoVisual: "nutrias", peso: 10, activo: true },
  { id: "nut07", familia: "Nutria", color: "#1a5e20", titulo: "Nutria Chef", texto: "Cada quien cuenta en el grupo su mejor receta de familia para estas fiestas.", efectoVisual: "nutrias", peso: 10, activo: true },
  { id: "nut08", familia: "Nutria", color: "#1a5e20", titulo: "Nutria Soñadora", texto: "Escribe en el grupo el mejor regalo que recibiste en tu vida y quién te lo dio.", efectoVisual: "nutrias", peso: 10, activo: true },
  { id: "nut09", familia: "Nutria", color: "#1a5e20", titulo: "Playlist Navideña", texto: "Cada persona propone una canción para la playlist de la cena. Entre todos arman una sola lista.", efectoVisual: "nutrias", peso: 10, activo: true },
  { id: "nut10", familia: "Nutria", color: "#1a5e20", titulo: "Comodín Nutria", texto: "Cada quien gana un comodín: puede saltarse el próximo reto que salga en la ruleta, sin dar explicaciones.", efectoVisual: "nutrias", peso: 8, activo: true },
  { id: "nut11", familia: "Nutria", color: "#1a5e20", titulo: "Brindis a Distancia", texto: "A las 8 p. m. todos levantan su bebida y mandan al grupo una foto brindando por todos.", efectoVisual: "nutrias", peso: 8, activo: true },
  { id: "nut12", familia: "Nutria", color: "#1a5e20", titulo: "Nutria Madrugadora", texto: "El primero en mandar un buenos días navideño al grupo se gana el título de Nutria Madrugadora (aplausos obligatorios).", efectoVisual: "nutrias", peso: 10, activo: true },
  { id: "nut13", familia: "Nutria", color: "#1a5e20", titulo: "Dibuja una Nutria", texto: "Dibuja una nutria navideña (aunque te quede fea) y mándala al grupo. La más tierna gana aplausos.", efectoVisual: "nutrias", peso: 8, activo: true },
  { id: "nut14", familia: "Nutria", color: "#1a5e20", titulo: "Nutria Agradecida", texto: "Cada uno agradece en el grupo algo bueno que le pasó este mes.", efectoVisual: "nutrias", peso: 10, activo: true },
  { id: "nut15", familia: "Nutria", color: "#1a5e20", titulo: "Nutria Nocturna", texto: "Antes de dormir, todos le dan las buenas noches a su amigo secreto por el buzón.", efectoVisual: "apagon", peso: 10, activo: true },
 
  // ---------------- REVIL (castigos duros: cuando sale, no viene nada bueno) ----------------
  { id: "rev01", familia: "Revil", color: "#c71f37", titulo: "El Grinch Te Delata", texto: "Manda por el buzón una pista verdadera sobre ti, de las buenas, de las que casi te delatan. Sin trampas.", efectoVisual: "grinch", peso: 7, activo: true },
  { id: "rev02", familia: "Revil", color: "#c71f37", titulo: "Filtro Villancico", texto: "Mientras dure el evento, en el grupo solo se escribe con emojis navideños. Nada de letras.", efectoVisual: "caos", peso: 8, activo: true },
  { id: "rev03", familia: "Revil", color: "#c71f37", titulo: "Castigo Sorteado: Los Platos", texto: "El anfitrión sortea a una persona (sin repetir) que lavará todos los platos de la cena. Que la suerte te perdone.", efectoVisual: "al-reves", peso: 5, activo: true },
  { id: "rev04", familia: "Revil", color: "#c71f37", titulo: "Narrador de Documental", texto: "En el grupo todos hablan como narrador de documental de la naturaleza.", efectoVisual: "caos", peso: 10, activo: true },
  { id: "rev05", familia: "Revil", color: "#c71f37", titulo: "Confesión Obligatoria", texto: "Cuenta al grupo tu anécdota más vergonzosa de Navidad. Tú eliges cuál, pero tiene que ser real y dar vergüenza de verdad.", efectoVisual: "glitch", peso: 7, activo: true },
  { id: "rev06", familia: "Revil", color: "#c71f37", titulo: "Impuesto del Grinch", texto: "Cada uno debe llevar a la cena un plato o bebida extra, además de lo que ya prometió.", efectoVisual: "grinch", peso: 5, activo: true },
  { id: "rev07", familia: "Revil", color: "#c71f37", titulo: "Baile del Grinch", texto: "Manda al grupo un video bailando 10 segundos, sin música y sin cortar. Quien no lo mande antes de que termine el evento bailará 20 segundos en la cena.", efectoVisual: "caos", peso: 6, activo: true },
  { id: "rev08", familia: "Revil", color: "#c71f37", titulo: "Silencio de Radio", texto: "Durante 24 horas nadie escribe en el grupo de WhatsApp. Quien rompa el silencio debe mandar una nota de voz cantando un villancico completo.", efectoVisual: "apagon", peso: 5, activo: true },
  { id: "rev09", familia: "Revil", color: "#c71f37", titulo: "Botones Fugitivos", texto: "Cuidado: los botones de la página huyen cuando intentas tocarlos. Paciencia y buena puntería.", efectoVisual: "fugitivos", peso: 6, activo: true },
  { id: "rev10", familia: "Revil", color: "#c71f37", titulo: "Prohibido la A", texto: "Mientras dure el evento, todos escriben en el grupo sin usar la letra A. Quien se equivoque, que lo asuma con humor.", efectoVisual: "glitch", peso: 6, activo: true },
  { id: "rev11", familia: "Revil", color: "#c71f37", titulo: "Reto del Sabor", texto: "Come algo que detestes (sin riesgo para tu salud ni alergias) y manda al grupo un video de tu reacción.", efectoVisual: "caos", peso: 6, activo: true },
  { id: "rev12", familia: "Revil", color: "#c71f37", titulo: "Foto de Reno", texto: "Cambia tu foto de perfil de WhatsApp por una tuya con cuernos de reno (filtro o dibujo) durante 3 días.", efectoVisual: "glitch", peso: 6, activo: true },
  { id: "rev13", familia: "Revil", color: "#c71f37", titulo: "Apodo Maldito", texto: "El anfitrión sortea a una persona. El grupo le inventa un apodo navideño ridículo (pero cariñoso) y debe usarlo hasta la cena.", efectoVisual: "caos", peso: 5, activo: true },
  { id: "rev14", familia: "Revil", color: "#c71f37", titulo: "Cuarentena de Pantalla", texto: "Guarda tu celular durante 2 horas seguidas y manda al grupo una foto de él guardado como prueba.", efectoVisual: "apagon", peso: 6, activo: true },
  { id: "rev15", familia: "Revil", color: "#c71f37", titulo: "Rima Forzada", texto: "Mientras dure el evento, todos escriben sus mensajes del grupo en rima, aunque sea malísima.", efectoVisual: "glitch", peso: 8, activo: true },
 
  // ---------------- DIFICULTAD (cambian las reglas) ----------------
  { id: "dif01", familia: "Dificultad", color: "#6a4c93", titulo: "Error 404", texto: "Tu próximo mensaje a tu amigo secreto debe ser una adivinanza. Nada de decirlo directo.", efectoVisual: "glitch", peso: 10, activo: true },
  { id: "dif02", familia: "Dificultad", color: "#6a4c93", titulo: "Apagón de Navidad", texto: "Mientras dure el evento, el buzón solo se usa entre las 7 y las 9 de la noche.", efectoVisual: "apagon", peso: 8, activo: true },
  { id: "dif03", familia: "Dificultad", color: "#6a4c93", titulo: "Presupuesto Creativo", texto: "El regalo de la cena debe incluir algo hecho a mano: una tarjeta, un dibujo o un detalle casero.", efectoVisual: "minecraft", peso: 10, activo: true },
  { id: "dif04", familia: "Dificultad", color: "#6a4c93", titulo: "Pista Disfrazada", texto: "Tu próximo mensaje a tu amigo secreto lleva dos pistas verdaderas y una falsa.", efectoVisual: "glitch", peso: 10, activo: true },
  { id: "dif05", familia: "Dificultad", color: "#6a4c93", titulo: "Cuenta Regresiva Express", texto: "Tienes hasta la medianoche de hoy para escribirle algo a tu amigo secreto por el buzón.", efectoVisual: "apagon", peso: 8, activo: true },
  { id: "dif06", familia: "Dificultad", color: "#6a4c93", titulo: "Poeta Obligado", texto: "El regalo de la cena debe venir con una rima de dos versos escrita por ti.", efectoVisual: "minecraft", peso: 10, activo: true },
  { id: "dif07", familia: "Dificultad", color: "#6a4c93", titulo: "Envoltorio Misterioso", texto: "El regalo de la cena debe venir envuelto de forma original: periódico, caja decorada o lo que se te ocurra.", efectoVisual: "nada", peso: 10, activo: true },
  { id: "dif08", familia: "Dificultad", color: "#6a4c93", titulo: "Mensaje en Morse", texto: "Tu próximo mensaje a tu amigo secreto debe ir en código Morse (hay traductores en línea).", efectoVisual: "glitch", peso: 6, activo: true },
  { id: "dif09", familia: "Dificultad", color: "#6a4c93", titulo: "Regalo Monocromático", texto: "Todo lo que acompañe tu regalo (envoltorio, tarjeta y lazo) debe ser de un solo color.", efectoVisual: "minecraft", peso: 8, activo: true },
  { id: "dif10", familia: "Dificultad", color: "#6a4c93", titulo: "Regalo en Dos Partes", texto: "El regalo de la cena lleva una sorpresa extra que entregas aparte, en otro momento de la reunión.", efectoVisual: "nada", peso: 8, activo: true },
  { id: "dif11", familia: "Dificultad", color: "#6a4c93", titulo: "Mensaje de Película", texto: "Tu próximo mensaje a tu amigo secreto debe incluir una frase de película, sin decir de cuál.", efectoVisual: "caos", peso: 8, activo: true },
  { id: "dif12", familia: "Dificultad", color: "#6a4c93", titulo: "Racionamiento de Mensajes", texto: "Durante el evento solo puedes mandar un mensaje por hora en el grupo.", efectoVisual: "apagon", peso: 6, activo: true },
  { id: "dif13", familia: "Dificultad", color: "#6a4c93", titulo: "Boca Cerrada", texto: "Mientras dure el evento no puedes mencionar a tu amigo secreto ni dar pistas sobre su regalo en el grupo.", efectoVisual: "nada", peso: 8, activo: true },
  { id: "dif14", familia: "Dificultad", color: "#6a4c93", titulo: "Reloj de Arena", texto: "Tienes 30 minutos desde que te enteres de este evento para mandarle un mensaje a tu amigo secreto.", efectoVisual: "glitch", peso: 6, activo: true },
  { id: "dif15", familia: "Dificultad", color: "#6a4c93", titulo: "Regalo con Carta", texto: "El regalo de la cena debe incluir una carta escrita a mano por ti.", efectoVisual: "minecraft", peso: 10, activo: true },
 
  // ---------------- NOVEDAD (afectan a todo el grupo) ----------------
  { id: "nov01", familia: "Novedad", color: "#ffbe0b", titulo: "DEDSAFIO 8 Bits", texto: "Mientras dure el evento, todos se llaman en el grupo con nombres de personajes de Minecraft.", efectoVisual: "minecraft", peso: 10, activo: true },
  { id: "nov02", familia: "Novedad", color: "#ffbe0b", titulo: "Tormenta de Fotos", texto: "Todos mandan al grupo una foto de lo que están comiendo en este momento.", efectoVisual: "tormenta", peso: 10, activo: true },
  { id: "nov03", familia: "Novedad", color: "#ffbe0b", titulo: "Hora Dorada de la Vaca", texto: "Todos escriben qué llevarán a la cena. Gana aplausos el aporte más original.", efectoVisual: "nutrias", peso: 10, activo: true },
  { id: "nov04", familia: "Novedad", color: "#ffbe0b", titulo: "Votación del Grinch", texto: "El grupo vota quién ha sido el amigo secreto más misterioso hasta ahora.", efectoVisual: "caos", peso: 8, activo: true },
  { id: "nov05", familia: "Novedad", color: "#ffbe0b", titulo: "Noche de Villancicos", texto: "A las 8 p. m. todos mandan una nota de voz cantando la primera línea de un villancico.", efectoVisual: "caos", peso: 8, activo: true },
  { id: "nov06", familia: "Novedad", color: "#ffbe0b", titulo: "Foto del Recuerdo", texto: "Todos mandan al grupo una foto de cuando eran niños en Navidad.", efectoVisual: "nutrias", peso: 10, activo: true },
  { id: "nov07", familia: "Novedad", color: "#ffbe0b", titulo: "Adivina el Objeto", texto: "Todos mandan una foto muy de cerca de un objeto de su casa; el resto adivina qué es.", efectoVisual: "caos", peso: 8, activo: true },
  { id: "nov08", familia: "Novedad", color: "#ffbe0b", titulo: "Maratón de Pelis", texto: "El grupo vota la película navideña de la semana y después cada uno cuenta qué le pareció.", efectoVisual: "nutrias", peso: 8, activo: true },
  { id: "nov09", familia: "Novedad", color: "#ffbe0b", titulo: "Lista de la Vaca", texto: "Entre todos arman la lista de quién lleva qué a la cena, para detectar repetidos y faltantes.", efectoVisual: "nada", peso: 10, activo: true },
  { id: "nov10", familia: "Novedad", color: "#ffbe0b", titulo: "Mascota Navideña", texto: "Todos mandan una foto de su mascota con gorro de Santa (sin mascota, vale el peluche favorito).", efectoVisual: "nutrias", peso: 8, activo: true },
  { id: "nov11", familia: "Novedad", color: "#ffbe0b", titulo: "Meme de la Semana", texto: "Cada uno manda su mejor meme y el grupo vota el ganador.", efectoVisual: "caos", peso: 8, activo: true },
  { id: "nov12", familia: "Novedad", color: "#ffbe0b", titulo: "Trivia Navideña", texto: "El anfitrión lanza una pregunta de trivia navideña en el grupo. El primero en acertar se lleva los aplausos.", efectoVisual: "caos", peso: 8, activo: true },
  { id: "nov13", familia: "Novedad", color: "#ffbe0b", titulo: "Lo Que Más Espero", texto: "Cada uno cuenta al grupo qué es lo que más espera de la cena.", efectoVisual: "nutrias", peso: 8, activo: true },
  { id: "nov14", familia: "Novedad", color: "#ffbe0b", titulo: "Rincón Decorado", texto: "Todos mandan una foto de su casa o su rincón decorado, o de cómo piensan decorarlo.", efectoVisual: "tormenta", peso: 8, activo: true },
  { id: "nov15", familia: "Novedad", color: "#ffbe0b", titulo: "Brindis en Secreto", texto: "Cada uno prepara en secreto un brindis de una sola línea para la cena. Nadie lo adelanta.", efectoVisual: "nada", peso: 8, activo: true }
 
];