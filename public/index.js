const socket = io();
const date = new Date();
let dia = date.getDate();
let mes = date.getMonth();
let año = date.getFullYear();
let hora = date.getHours();
let minutos = date.getMinutes();
let segundos = date.getSeconds();
const ahora = `${dia}/${mes}/${año} ${hora}:${minutos}:${segundos}`;

function addProduct(e) {
  const producto = {
    nombre: document.getElementById("nombre").value,
    precio: document.getElementById("precio").value,
    imagen: document.getElementById("imagen").value,
  };
  socket.emit("productoDesdeElCliente", producto);
  return false;
}

function addMessage(e) {
    if (
        document.getElementById("username").value == "" ||
        document.getElementById("texto").value == "" 
      ) {
        alert("Campos Incompletos");
        return false;
      }
  const mensaje = {
    author: document.getElementById("username").value,
    text: document.getElementById("texto").value,
  };
  socket.emit("mensajeDesdeElCliente", mensaje);
  document.getElementById("mensaje").value = "";
  return false;
}

socket.on("productoDesdeElServidor", (prod) => {
  const productosHTML = prod
    .map(
      (prod) => `
        <div class="row warning">
            <div class="col-4">${prod.nombre}</div>             
            <div class="col-4">${prod.precio}</div>             
            <div class="col-4"><img style="max-width: 50px;" src="${prod.imagen}" alt=""></div>             
        </div>`
    )
    .join("");
  document.getElementById("mi-tr").innerHTML = productosHTML;
});

socket.on("mensajeDesdeElServidor", (msjs) => {
  const mensajesHTML = msjs
    .map(
      (msj) =>
        `<div class="d-flex"><p style="color: blue;">${msj.mensaje.author}</p><p style="color: brown;">[${ahora}]</p>:<p style="color: green;">${msj.mensaje.text}</p></div>`
    )
    .join("");
  document.getElementById("mi-p").innerHTML = mensajesHTML;
});
