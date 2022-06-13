const express = require("express");
const session = require("express-session");
const { Server: IOServer } = require("socket.io");
const { Server: HttpServer } = require("http");
const cluster = require("cluster");
const minimist = require("minimist");
const passport = require("passport");
const compression = require("compression");
const MongoStore = require("connect-mongo");
const cookieParser = require("cookie-parser");
const handlebars = require("express-handlebars");
require("dotenv").config();
const URLDB = process.env.URLDB;
const numCPUs = require("os").cpus().length;
const logger = require("./src/loggers/logger");

/*-------------[argumentos]-------------*/
const options = {
  alias: {
    p: "port",
    m: "modo",
  },
  default: {
    port: "8080",
    modo: "FORK",
  },
};
const args = minimist(process.argv.slice(2), options);
const port = parseInt(args.port) || 8080;
const modo = args.modo.toUpperCase();
console.log(modo);
/*---------------[App]----------------*/
const app = express();
const httpServer = new HttpServer(app);
const io = new IOServer(httpServer);

app.use(express.static("./public"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(compression());
app.use(
  session({
    store: MongoStore.create({
      mongoUrl: URLDB,
    }),
    secret: "shh",
    resave: false,
    saveUninitialized: false,
    rolling: true,
    cookie: {
      httpOnly: false,
      secure: false,
      maxAge: 600000,
    },
  })
);
app.use(passport.initialize());
app.use(passport.session());
app.use((req, res, next) => {
  logger.info(`Ruta: ${req.path}, Método: ${req.method}`);
  next();
});

/*------------- [Sockets]-------------*/
const webSocket = require("./src/routes/sockets");
const onConnection = (socket) => {
  webSocket(io, socket);
};
io.on("connection", onConnection);
/*-----[Motor de plantillas - HBS]-----*/
app.engine(
  "hbs",
  handlebars.engine({
    extname: ".hbs",
    defaultLayout: "index.hbs",
    layoutsDir: __dirname + "/views/layouts",
    partialsDir: __dirname + "/views/partials",
  })
);
app.set("views", "./views");
app.set("view engine", "hbs");
/*------------- [Public]-------------*/
app.use("/static", express.static("public"));
/*------------- [Rutas]-------------*/
const autentication = require("./src/routes/autentication");
const infoYrandoms = require("./src/routes/info&randoms");
app.use("", autentication);
app.use("", infoYrandoms);

/*---------------- [Server] ---------------*/
if (modo === "CLUSTER") {
  //modo CLUSTER
  if (cluster.isMaster) {
    console.log(`Número de CPU: ${numCPUs}`);
    console.log(`PID MASTER ${process.pid}`);
    for (let i = 0; i < numCPUs; i++) {
      cluster.fork();
    }
    cluster.on("exit", (worker) => {
      console.log(
        "Worker",
        worker.process.pid,
        "died",
        new Date().toLocaleString()
      );
      cluster.fork();
    });
  } else {
    const connectedServer = httpServer.listen(port, function () {
      console.log(
        `Servidor HTTP con Websockets escuchando en el puerto ${
          connectedServer.address().port
        }, modo: ${modo} - PID: ${process.pid}`
      );
    });
    connectedServer.on("error", (error) =>
      console.log(`Error en servidor: ${error}`)
    );
  }
} else {
  //modo FORK por defecto
  const connectedServer = httpServer.listen(port, function () {
    console.log(
      `Servidor HTTP con Websockets escuchando en el puerto ${
        connectedServer.address().port
      }, modo: ${modo} - PID: ${process.pid}`
    );
  });
  connectedServer.on("error", (error) =>
    console.log(`Error en servidor: ${error}`)
  );
  process.on("exit", (code) => {
    console.log("Exit code -> ", code);
  });
}