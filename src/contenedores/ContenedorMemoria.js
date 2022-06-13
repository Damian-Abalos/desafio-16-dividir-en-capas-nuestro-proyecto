class ContenedorMemoria {
    constructor(collection) {
      this.collection = collection;
      this.arrayMensajes = [];
    }
  
    getMessages = () => {
      try {
        const messages = this.arrayMensajes;
        return (messages);
      } catch (error) {
        throw new Error(`Error al buscar: ${error}`);
      }
    };
  
    saveMessages = (datos) => {
      try {
        this.arrayMensajes.push(datos);
        return "mensaje enviado 🆗";
      } catch (error) {
        throw new Error(`Error al buscar: ${error}`);
      }
    };
  }
  
  module.exports = ContenedorMemoria;