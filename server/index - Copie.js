//CODE DU SERVEUR DU WEBCHAT


const express = require('express');
const app = express();
const http = require('http');
const cors = require('cors');
const {Server} = require('socket.io');
app.use(cors());

const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: "http://localhost:3000",   //l'url de la page qui va envoyer des messages au serveur
        methods: ["GET", "POST", "DELETE"]
    }
});

//événement qui détecte que quelqu'un est connecté au serveur io
io.on("connection", (socket) => {
    console.log("Utilisateur connecté! l'id du socket est: " + socket.id);

    socket.on("join_room", (data)=>{
        socket.join(data);
        console.log("User with ID: ", socket.id, " joined room ", data);
    });

    //Lorsqu'il reçoit le message venant du front-end...
    socket.on("send_message", (data)=>{
        console.log(data);
        //le backend envoie un signal "receive_message" au front-end, contenant le message qu'il a reçu
        //le front-end se chargera de l'afficher dans les chat box
        socket.to(data.room).emit("receive_message", data);

    });

    socket.on("disconnect", () => {
        console.log("User Disconnectd", socket.id);
    } );
} ) ;

//Lancer le serveur et se mettre en attente de connections (venant du port 3001)
server.listen(3001, () => {
    console.log("SERVER RUNNING");
} );