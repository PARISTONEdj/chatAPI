
var express = require("express");

var port = 5000;

var app = express();

const multer = require('multer');

const path = require('path');

const cors = require('cors');

const http = require("http");

const multerS3 = require('multer-s3');

// import { S3Client, ListBucketsCommand } from "@aws-sdk/client-s3";

const { S3Client } = require("@aws-sdk/client-s3");


// AWS.config.update({
//   accessKeyId: 'AKIAWPARM77ULVIV4LEX',
//   secretAccessKey: '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',
//   region: 'Europe (Stockholm) eu-north-1'
// })

const s3 = new S3Client({
  region: "eu-north-1", // Remplacez "votre_region_aws" par votre région AWS.
  credentials: {
    accessKeyId: "AKIAWPARM77ULVIV4LEX", // Remplacez par votre clé d'accès AWS.
    secretAccessKey: "34tW8pcAy4f05cPfQENN+HQEQxGAgMb5hUM4iyuN", // Remplacez par votre clé secrète AWS.
  },
});
// const socketIO = require("socket.io");

const server = http.createServer(app);
// const io = socketIO(server);
// const server = require("http").createServer();
const io = require("socket.io")(server, {
  cors: {
    origin: "*",
  },
});

var bodyParser = require("body-parser");

const mongoose = require('mongoose');

const User = require("./models/user");

var userRouter = require("./routes/userRoutes").router;

var publicationRouter = require("./routes/publicationRoutes").router;

var chatRouter = require("./routes/chatRoutes").router;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  next();
});

mongoose.connect("mongodb+srv://leroyparistone:3QTwJlUjkAoAccAq@cluster0.tcxrwgy.mongodb.net/?retryWrites=true&w=majority",
{ useNewUrlParser: true,
  useUnifiedTopology: true })
.then(() => console.log('Connexion à MongoDB réussie !'))
.catch(() => console.log('Connexion à MongoDB échouée !'));


io.on("connection", (socket) => {
  console.log("Nouvelle connexion WebSocket établie.");

  socket.on("chatMessage", (message) => {
    console.log("Nouveau message en temps réel : ", message);
    socket.broadcast.emit("chatMessage", message); 
  });

  socket.on("Appel", (appel) => {
    console.log("Nouvel appel en temps réel : ", appel);
    socket.broadcast.emit("Appel", appel); 
  });

  socket.on("disconnect", () => {
    console.log("La connexion WebSocket a été fermée.");
  });
});


server.listen(port, ()=>console.log("le serveur demare"));


app.get("/", function(req, res){
    res.send("hello");
})

app.use("/users/", userRouter);

app.use("/publications/", publicationRouter);

app.use("/chats/", chatRouter);

const MIME_TYPES = {
  'image/jpg': 'jpg',
  'image/jpeg': 'jpg',
  'image/png': 'png'
};
  // Configuration du stockage des fichiers
// const storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     cb(null, 'uploads/'); // Dossier de stockage des images
//   },
//   filename: function (req, file, cb) {
//     // cb(null, file.originalname); 
//     const name = file.originalname.split(' ').join('_');
//     const extension = MIME_TYPES[file.mimetype];
//     cb(null, name + Date.now() + '.' + extension);// Utilisez le nom original du fichier
//   },
// });

// const upload = multer({ storage: storage });

// Servez les fichiers statiques


// app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Route pour gérer le téléchargement d'images
// app.post('/upload', upload.single('image'), (req, res) => {
//   // Obtenez le nom du fichier téléchargé
//   const filename = req.file.filename;
//   // Générez l'URL complète de l'image
//   const imageUrl = `https://chatapi-g6pn.onrender.com/uploads/${filename}`;
//   res.json({ imageUrl });
// });

const upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: 'chatmobile',
    metadata: function (req, file, cb) {
      cb(null, {fieldName: file.fieldname});
    },
    key: function (req, file, cb) {
      const extension = file.originalname.split('.').pop(); // Obtient l'extension du fichier
      cb(null, Date.now().toString() + '.' + extension);
    }
  })
});

app.post('/upload', upload.array('image', 3), function(req, res, next) {
  const imageUrl = req.files.length > 0 ? req.files[0].location : null;

  if (imageUrl) {
    res.json({ imageUrl });
  } else {
    // Gérez le cas où aucune image n'a été téléchargée
    res.status(400).json({ error: 'Aucune image téléchargée' });
  }
});


 


