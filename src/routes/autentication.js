const express = require("express");
const passport = require("passport");
const autentication = express.Router();
const { Strategy: LocalStrategy } = require("passport-local");
const bCrypt = require("bcrypt");
const mongoose = require('mongoose')
const logger = require('../loggers/logger')

mongoose
  .connect("mongodb://localhost:27017/usuarios")
  .then(console.log("Base de datos Mongoose conectada"))
  .catch((error) => {
    console.log(`Error: ${error}`)
  })

const User = require("../daos/userDaoMongoDB");

/*------------- [LocalStrategy - Login]-------------*/
passport.use('login', new LocalStrategy(
  (username, password, done) => {
      User.findOne({ username }, (err, user) => {
          if (err)
              return done(err);

          if (!user) {
              console.log('User Not Found with username ' + username);
              return done(null, false);
          }

          if (!isValidPassword(user, password)) {
              console.log('Invalid Password');
              return done(null, false);
          }

          return done(null, user);
      });
  })
);

function isValidPassword(user, password) {
  return bCrypt.compareSync(password, user.password);
}
/*------------- [LocalStrategy - Signup]-------------*/
passport.use(
  "signup",
  new LocalStrategy(
    {
      passReqToCallback: true,
    },
    (req, username, password, done) => {
      User.findOne({ username: username }, function (err, user) {
        console.log(user);
        console.log(username);
        if (err) {
          console.log("Error in SignUp: " + err);
          return done(err);
        }
        if (user) {
          console.log("User already exists");
          return done(null, false);
        }
        const newUser = {
          username: username,
          password: createHash(password),
        };
        User.create(newUser, (err, userWithId) => {
          if (err) {
            console.log("Error in Saving user: " + err);
            return done(err);
          }
          console.log(user);
          console.log("User Registration succesful");
          return done(null, userWithId);
        });
      });
    }
  )
);
function createHash(password) {
  return bCrypt.hashSync(password, bCrypt.genSaltSync(10), null);
}

/*------------- [Serializar y deserializar]-------------*/
passport.serializeUser((user, done) => {
  done(null, user._id);
});
passport.deserializeUser((id, done) => {
  User.findById(id, done);
});

// Index
autentication.get("/", (req, res) => {
  if (req.isAuthenticated()) {
    let user = req.user;
    let userMail = user.username;
    res.render("home", { userMail });
  } else {
    res.redirect("/login");
  }
});
// Login
autentication.get("/login", (req, res) => {
  if (req.isAuthenticated()) {
    let user = req.user;
    console.log("user logueado");
    res.render("profileUser", { user });
  } else {
    console.log("user NO logueado");
    res.render("login");
  }
});
autentication.post(
  "/login",
  passport.authenticate("login", {
    failureRedirect: "/login-error",
    successRedirect: "/",
  })
);
autentication.get("/login-error", (req, res) => {
  console.log("error en login");
  res.render("login-error", {});
});
// signup
autentication.get("/signup", (req, res) => {
  res.render("signup");
});
autentication.post(
  "/signup",
  passport.authenticate("signup", {
    failureRedirect: "/signup-error",
    successRedirect: "/",
  })
);
autentication.get("/signup-error", (req, res) => {
  console.log("error en signup");
  res.render("signup-error", {});
});
// Logout
autentication.get("/logout", (req, res) => {
  req.logout();
  res.redirect("/");
});
// Fail route
autentication.get("*", (req, res) => {
  const { url, method } = req;
  logger.warn(`Ruta ${method} ${url} no implementada`);
  res.send(`Ruta ${method} ${url} no está implementada`);
  res.status(404).render("routing-error", {});
});

/*---------------- [Autorizar rutas protegidas] ---------------*/
function checkAuthentication(req, res, next) {
  if (req.isAuthenticated()) {
    next();
  } else {
    res.redirect("/login");
  }
}
autentication.get("/ruta-protegida", checkAuthentication, (req, res) => {
  let user = req.user;
  console.log(user);
  res.send("<h1>Ruta OK!</h1>");
});

module.exports = autentication;
// /*------------- [bcrypt] -------------*/
// const rounds = 12

// const hashPassword = (password, rounds) => {
//     const hash = bcrypt.hashSync(password, rounds, (err, hash) => {
//         if (err) {
//             console.error(err)
//             return err
//         }
//         return hash
//     })
//     return hash
// }

// const comparePassword = (password, hash) => {
//     const bool = bcrypt.compareSync(password, hash, (err, res) => {
//         if (err) {
//             console.error(err)
//             return false
//         }
//         return res
//     })
//     return bool
// }

// /*------------- [Passport]-------------*/
// passport.use(new LocalStrategy(async function (nombre, password, done) {
//     let existeUsuario
//     try {
//         existeUsuario = await userDAO.getById(nombre)
//     } catch (err) {
//         throw done(err)
//     }
//     if (!existeUsuario) {
//         console.log('Usuario no encontrado')
//         return done(null, false);
//     }
//     const bool = await comparePassword(password, existeUsuario.password)
//     if (bool == false) {
//         console.log('Contraseña invalida')
//         return done(null, false);
//     }

//     return done(null, existeUsuario);
// }))

// /*------------- [Serializar y deserializar]-------------*/
// passport.serializeUser((usuario, done) => {
//     done(null, usuario.nombre);
// })

// passport.deserializeUser(async (nombre, done) => {
//     let usuario
//     try {
//         usuario = await userDAO.getById(nombre)
//     } catch (err) {
//         throw done(err)
//     }
//     done(null, usuario);
// });

// passport.use('login', new LocalStrategy(
//     async (username, password, done) => {
//         await userDAO.getById({ username }, (err, user) => {
//             if (err)
//                 return done(err);

//             if (!user) {
//                 console.log('User Not Found with username ' + username);
//                 return done(null, false);
//             }

//             if (!isValidPassword(user, password)) {
//                 console.log('Invalid Password');
//                 return done(null, false);
//             }

//             return done(null, user);
//         });
//     })
// );
// // /*------------- [LocalStrategy - Signup]-------------*/
// // passport.use('signup', new LocalStrategy({
// //     passReqToCallback: true
// // },
// //     (req, username, password, done) => {
// //         userDAO.getById({ 'username': username }, function (err, user) {
// //             console.log(user);
// //             console.log(username);
// //             if (err) {
// //                 console.log('Error in SignUp: ' + err);
// //                 return done(err);
// //             }
// //             if (user) {
// //                 console.log('User already exists');
// //                 return done(null, false)
// //             }
// //             const newUser = {
// //                 username: username,
// //                 password: createHash(password)
// //             }
// //             userDAO.saveElement(newUser, (err, userWithId) => {
// //                 if (err) {
// //                     console.log('Error in Saving user: ' + err);
// //                     return done(err);
// //                 }
// //                 console.log(user)
// //                 console.log('User Registration succesful');
// //                 return done(null, userWithId);
// //             });
// //         });
// //     })
// // )
// // function createHash(password) {
// //     return bCrypt.hashSync(
// //         password,
// //         bCrypt.genSaltSync(10),
// //         null);
// // }
// // /*------------- [Serializar y deserializar]-------------*/
// // passport.serializeUser((user, done) => {
// //     done(null, user._id);
// // });
// // passport.deserializeUser((id, done) => {
// //     userDAO.findById(id, done);
// // });
// /*---------------- [Rutas] ---------------*/
// // Index
// autentication.get('/', (req, res) => {
//     if (req.isAuthenticated()) {
//         let user = req.user;
//         let userMail = user.username
//         res.render('profileUser', { userMail })

//     } else {
//         res.redirect('/login')
//     }
// })
// // Login
// autentication.get('/login', (req, res) => {
//     if (req.isAuthenticated()) {
//         let user = req.user;
//         console.log('user logueado');
//         res.render('profileUser', { user })
//     } else {
//         console.log('user NO logueado');
//         res.render('login')
//     }
// })
// autentication.post('/login', passport.authenticate('login', { failureRedirect: '/login-error', successRedirect: '/' }))
// autentication.get('/login-error', (req, res) => {
//     console.log('error en login');
//     res.render('login-error', {})
// })
// // signup
// autentication.get('/signup', (req, res) => {
//     res.render('signup')
// })
// autentication.post('/signup', async (req, res) => {
//     const {
//         nombre,
//         password
//     } = req.body;
//     let newUsuario = null
//     try {
//         newUsuario = await userDAO.getById(nombre)
//     } catch (err) {
//         throw new Error(err)
//     }
//     if (newUsuario) {
//         res.render('signup-error')
//     } else {
//         const hash = hashPassword(password, rounds)
//         const usuarioData = {
//             nombre,
//             password: hash
//         }
//         try {
//             const graba = await userDAO.saveElement(usuarioData)
//         } catch (err) {
//             throw new Error(err)
//         }
//         res.redirect('/login')
//     }
// });
// autentication.get('/signup-error', (req, res) => {
//     console.log('error en signup');
//     res.render('signup-error', {})
// })
// // Logout
// autentication.get('/logout', (req, res) => {
//     req.logout()
//     res.redirect('/')
// })
// // Fail route
// autentication.get('*', (req, res) => {
//     const {url, method} = req
//     logger.warn(`Ruta ${method} ${url} no implementada`)
//     res.send(`Ruta ${method} ${url} no está implementada`)
//     res.status(404).render('routing-error', {})
// })
// /*---------------- [Autorizar rutas protegidas] ---------------*/
// function checkAuthentication(req, res, next) {
//     if (req.isAuthenticated()) {
//         next()
//     } else {
//         res.redirect("/login")
//     }
// }
// autentication.get('/ruta-protegida', checkAuthentication, (req, res) => {
//     let user = req.user
//     console.log(user);
//     res.send('<h1>Ruta OK!</h1>')
// })
