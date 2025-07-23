let cursos = [];
let carrito = JSON.parse(localStorage.getItem("carrito")) || [];

const btnCerrarSesion = document.getElementById("btnCerrarSesion");
const loginForm = document.getElementById("loginForm");
const contenedorCursos = document.getElementById("catalogo");
const listaCarrito = document.getElementById("lista-carrito");
const totalCarrito = document.getElementById("total");
const botonFinalizar = document.getElementById("finalizarCompra");

const loginModal = document.getElementById("loginModal");
const recuperarModal = document.getElementById("recuperarModal");

// Mostrar alertas SweetAlert2
function mostrarAlerta(titulo, texto, icono = "info") {
  Swal.fire(titulo, texto, icono);
}

// Mostrar u ocultar modales con transición
function mostrarModalLogin(mostrar) {
  if (mostrar) {
    loginModal.classList.add("show");
  } else {
    loginModal.classList.remove("show");
  }
}

function mostrarModalRecuperar(mostrar) {
  if (mostrar) {
    recuperarModal.classList.add("show");
  } else {
    recuperarModal.classList.remove("show");
  }
}

// Verificar login
function chequearLogin() {
  const usuario = localStorage.getItem("usuario");
  if (usuario) {
    mostrarModalLogin(false);
    btnCerrarSesion.style.display = "inline-block";
  } else {
    btnCerrarSesion.style.display = "none";
  }
  document.querySelector("main").style.display = "flex";
  cargarCursos();
}

// Cargar cursos desde JSON
function cargarCursos() {
  fetch("cursos.json")
    .then(res => res.json())
    .then(data => {
      cursos = data;
      renderizarCursos();
      renderizarCarrito();
    });
}

// Eventos

// Login
loginForm.addEventListener("submit", e => {
  e.preventDefault();
  const usuario = document.getElementById("usuario").value.trim();
  const password = document.getElementById("password").value;
  const usuarios = JSON.parse(localStorage.getItem("usuarios")) || [];
  const user = usuarios.find(u => u.usuario === usuario && u.password === password);

  if (user) {
    localStorage.setItem("usuario", usuario);
    mostrarAlerta("Bienvenido", `Hola ${usuario}`, "success");
    chequearLogin();
  } else {
    mostrarAlerta("Error", "Usuario o usuairos incorrectos", "error");
  }
});

// Botón cerrar sesión
btnCerrarSesion.addEventListener("click", () => {
  localStorage.removeItem("usuario");
  carrito = [];
  actualizarCarrito();
  chequearLogin();
  mostrarAlerta("Sesión cerrada", "Volvé pronto", "info");
});

// Botón mostrar login modal manual
document.getElementById("btnLogin").addEventListener("click", () => {
  mostrarModalLogin(true);
});

// Recuperar usuarios - abrir modal
document.getElementById("recuperarClave").addEventListener("click", e => {
  e.preventDefault();
  mostrarModalLogin(false);
  mostrarModalRecuperar(true);
});

// Recuperar contraseña - formulario
const recuperarForm = document.getElementById("recuperarForm");
recuperarForm.addEventListener("submit", e => {
  e.preventDefault();
  const email = document.getElementById("emailRecuperar").value.trim();
  let usuarios = JSON.parse(localStorage.getItem("usuarios")) || [];
  const user = usuarios.find(u => u.email === email);
  if (!user) {
    Swal.fire("Error", "No se encontró un usuario con ese correo.", "error");
  } else {
    Swal.fire("Éxito", "Se ha enviado un enlace de recuperación a tu correo (simulado).", "success");
    mostrarModalRecuperar(false);
  }
});

// Cancelar recuperación
document.getElementById("cerrarRecuperar").addEventListener("click", () => {
  mostrarModalRecuperar(false);
});

// Agregar al carrito
function agregarAlCarrito(id) {
  const usuarioLogueado = localStorage.getItem("usuario");
  if (!usuarioLogueado) {
    mostrarAlerta("Debes iniciar sesión", "Iniciá sesión para agregar cursos al carrito.", "warning");
    return;
  }

  if (carrito.find(c => c.id === id)) {
    mostrarAlerta("Ya está en el carrito", "Este curso ya fue agregado.", "info");
    return;
  }

  const cursoSeleccionado = cursos.find(curso => curso.id === id);
  carrito.push(cursoSeleccionado);
  actualizarCarrito();

  mostrarAlerta("¡Curso agregado!", `${cursoSeleccionado.titulo} fue agregado al carrito.`, "success");
}

// Renderizar cursos
function renderizarCursos() {
  contenedorCursos.innerHTML = "";
  cursos.forEach(curso => {
    const div = document.createElement("div");
    div.className = "card-curso";
    div.innerHTML = `
      <img src="${curso.imagen}" alt="${curso.titulo}">
      <h3>${curso.titulo}</h3>
      <p>${curso.descripcion}</p>
      <p><strong>$${curso.precio}</strong></p>
      <button onclick="agregarAlCarrito(${curso.id})">Agregar al carrito</button>
    `;
    contenedorCursos.appendChild(div);
  });
}

// Renderizar carrito
function renderizarCarrito() {
  listaCarrito.innerHTML = "";
  carrito.forEach((curso, index) => {
    const li = document.createElement("li");
    li.innerHTML = `
      ${curso.titulo} - $${curso.precio}
      <button onclick="eliminarDelCarrito(${index})">❌</button>
    `;
    listaCarrito.appendChild(li);
  });
  const total = carrito.reduce((acc, curso) => acc + curso.precio, 0);
  totalCarrito.textContent = total;
}

// Eliminar del carrito con confirmación Swal
function eliminarDelCarrito(index) {
  Swal.fire({
    title: '¿Eliminar curso?',
    text: '¿Querés eliminar este curso del carrito?',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Sí, eliminar',
    cancelButtonText: 'Cancelar',
  }).then((result) => {
    if (result.isConfirmed) {
      carrito.splice(index, 1);
      actualizarCarrito();
      Swal.fire('Eliminado', 'El curso fue eliminado del carrito.', 'success');
    }
  });
}

// Actualizar carrito
function actualizarCarrito() {
  renderizarCarrito();
  localStorage.setItem("carrito", JSON.stringify(carrito));
}

// Finalizar compra
botonFinalizar.addEventListener("click", () => {
  if (carrito.length === 0) {
    mostrarAlerta("Carrito vacío", "Agregá algún curso antes de continuar.", "warning");
    return;
  }

  const resumen = carrito.map(c => c.titulo).join("\n");

  Swal.fire({
    title: "¿Confirmás tu compra?",
    text: resumen,
    icon: "question",
    showCancelButton: true,
    confirmButtonText: "Sí, comprar",
    cancelButtonText: "Cancelar"
  }).then((result) => {
    if (result.isConfirmed) {
      carrito = [];
      actualizarCarrito();
      mostrarAlerta("¡Gracias!", "Tu compra fue registrada con éxito.", "success");
    }
  });
});

// Cargar al inicio
document.addEventListener("DOMContentLoaded", () => {
  chequearLogin();
});
