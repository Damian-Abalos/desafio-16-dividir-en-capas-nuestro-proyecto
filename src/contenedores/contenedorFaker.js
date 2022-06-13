const { faker } = require("@faker-js/faker");
/*------------- [Productos faker]-------------*/
function generarCombinacion() {
  return {
    nombre: faker.commerce.product(),
    precio: faker.commerce.price(),
    imagen: faker.image.imageUrl(),
  };
}
function generarData(cantidad) {
  const productos = [];
  for (let i = 0; i < cantidad; i++) {
    productos.push(generarCombinacion());
  }
  return productos;
}
const productosFaker = generarData(5);

module.exports = productosFaker