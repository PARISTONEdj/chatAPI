
var express = require("express");

var port = 5000;

var app = express();

const multer = require('multer');

const path = require('path');

const cors = require('cors');

const http = require("http");

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
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/'); // Dossier de stockage des images
  },
  filename: function (req, file, cb) {
    // cb(null, file.originalname); 
    const name = file.originalname.split(' ').join('_');
    const extension = MIME_TYPES[file.mimetype];
    cb(null, name + Date.now() + '.' + extension);// Utilisez le nom original du fichier
  },
});

const upload = multer({ storage: storage });

// Servez les fichiers statiques
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Route pour gérer le téléchargement d'images
app.post('/upload', upload.single('image'), (req, res) => {
  // Obtenez le nom du fichier téléchargé
  const filename = req.file.filename;
  // Générez l'URL complète de l'image
  const imageUrl = `http://localhost:${port}/uploads/${filename}`;
  res.json({ imageUrl });
});



 


