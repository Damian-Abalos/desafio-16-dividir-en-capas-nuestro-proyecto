const logger = require("../loggers/logger");
const ContenedorMemoria = require("../contenedores/ContenedorMemoria");
const contenedorMessages = new ContenedorMemoria("mensajes");
console.log(contenedorMessages.getMessages());

const listaProductos = [];
const productosFaker = require("../contenedores/ContenedorFaker");
productosFaker.forEach(producto => listaProductos.push(producto))
console.log(listaProductos);

module.exports = (io, socket) => {
  logger.info(`WebSockets: Nuevo cliente conectado`);
  try {
    console.log("¡Nuevo cliente conectado!");

    socket.emit("productoDesdeElServidor", listaProductos);
    const mensajes = contenedorMessages.getMessages()
    console.log(mensajes);
    socket.emit('mensajeDesdeElServidor', mensajes)

    // contenedorMessages.getMessages().then((result) => {
    //   if (result.status === "success") {
    //     console.log(result.payload);
    //     socket.emit("mensajeDesdeElServidor", (result.payload));
    //   }
    // });

    // socket.on("mensajeDesdeElCliente", async (message) => {
    //   await contenedorMessages.saveMessages(message);
    //   let messages = await contenedorMessages.getMessages();
    //   io.sockets.emit("mensajeDesdeElServidor", messages);
    // });
  
    socket.on("productoDesdeElCliente", (data) => {
      listaProductos.push({ socketid: socket.id, producto: data });
      io.sockets.emit("productoDesdeElServidor", listaProductos);
    });
    socket.on("mensajeDesdeElCliente", (data) => {
      mensajes.push({ socketid: socket.id, mensaje: data });
      io.sockets.emit("mensajeDesdeElServidor", mensajes);
    });
  } catch (error) {
    socket.emit("error", {
      error: error.message,
    });
  }
};
