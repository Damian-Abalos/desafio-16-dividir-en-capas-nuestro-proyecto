const { model } = require("mongoose");
const userSchema = require("../schemas/user.schema");

const User = model("usuarios", userSchema);

// const ContenedorMongo = require("../contenedores/ContenedorMongoDB");
// const usersDAO = new ContenedorMongo(userModel);
module.exports = User;