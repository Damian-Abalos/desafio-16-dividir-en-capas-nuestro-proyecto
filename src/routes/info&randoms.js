const express = require("express")
const infoYrandoms = express.Router()
const path = require("path")
const compression = require('compression')

infoYrandoms.get('/info', (req, res) => {
   res.render('info', {
      argumentos: process.argv,
      directorio: process.cwd(),
      idProceso: process.pid,
      versionNode: process.version,
      sistemaOperativo: process.platform,
      memoria: process.memoryUsage().heapTotal,
      path: process.execPath
   })
})

infoYrandoms.get('/info-log', (req, res) => {
   const info = {
       argumentos: args,
       directorio: process.cwd(),
       idProceso: process.pid,
       versionNode: process.version,
       sistemaOperativo: process.platform,
       memoria: process.memoryUsage().heapTotal,
       path: process.execPath,
       numProcesadores: numCPUs
   }
   console.log(info)

   res.render('info', {
       argumentos: args,
       directorio: process.cwd(),
       idProceso: process.pid,
       versionNode: process.version,
       sistemaOperativo: process.platform,
       memoria: process.memoryUsage().heapTotal,
       path: process.execPath,
       numProcesadores: numCPUs
   })
})

infoYrandoms.get('/infoZip', compression(), (req, res) => {
   res.render('info', {
       argumentos: args,
       directorio: process.cwd(),
       idProceso: process.pid,
       versionNode: process.version,
       sistemaOperativo: process.platform,
       memoria: process.memoryUsage().heapTotal,
       path: process.execPath,
       numProcesadores: numCPUs
   })
})

infoYrandoms.get('/api/randoms', (req, res) => {
   let cant = req.query.cant
   if (!cant) cant = 100000000
   // //proceso fork
   // const forked = fork(path.join(path.dirname(''), '/api/randoms.js'))
   // forked.on('message', msg => {
   //    if (msg == 'listo') {
   //       forked.send(cant)
   //    } else {
   //       res.send(msg)
   //    }
   // })
})

module.exports = infoYrandoms;