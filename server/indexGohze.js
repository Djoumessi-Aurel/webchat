//CODE DU SERVEUR DU WEBCHAT
const moment = require('moment');

const express = require('express');
const app = express();
const fs = require('fs');
const https = require('https');
//const http = require('http');
const cors = require('cors');
const {Server} = require('socket.io');
app.use(cors());

const siofu = require("socketio-file-upload");//---
/*const app2 = express()
    .use(siofu.router)
    .listen(8901);*/
    app.use(siofu.router);
    app.use(express.static('uploads')); //Pour pouvoir accéder au contenu du dossier uploads

const sslOptions = {
    key: fs.readFileSync("./certification/server.key"),
    cert: fs.readFileSync("./certification/server.cer")
};

//const server = http.createServer(app);
const server = https.createServer(sslOptions, app);

const parametres = require('./parametres.json');

const io = new Server(server
    , {
    cors: {
        // origin: parametres.urlLancement + ':' + parametres.portClient, //"https://192.168.43.11:3000",   // origin: "https://localhost:3000" l'url de la page qui va envoyer des messages au serveur
        origin: '*',
        // methods: ["GET", "POST", "PUT", "PATCH", "DELETE"]
    }
}
);


const userList = new Array();


//événement qui détecte que quelqu'un est connecté au serveur io
io.on("connection", (socket) => {
    console.log("Utilisateur connecté! l'id du socket est: " + socket.id);
    console.log("Adresse du client:",socket.handshake.address);
    console.log("En-tête:",socket.handshake.headers);

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

    socket.on("user_just_arrived", (data) => {
        // console.log(data + " vient d'arriver");
        if(data){
            data.socketid = socket.id; data.online=true;

            index = userList.findIndex(user => user.id==data.id); //on recherche si l'utilisateur est déjà dans le tableau
      
            if(index>=0) { //L'utilisateur est déjà dans le tableau
                userList[index]=data;
                // console.log("old user online");
                // console.log(userList[index]);
                //console.log(userList);
            }
            else{
                userList.push(data); //console.log("new user added" + data.socketid);
                // console.log(data);
            }
            io.emit("user_just_arrived", userList); //On envoie la liste des tous les utilisateurs
        }
    } );

    socket.on("disconnect", () => {
        console.log("User Disconnected", socket.id);
        index = userList.findIndex(user => {//console.log(user.socketid + "et " + socket.id)
     return user.socketid == socket.id});

        if(index>=0) { //L'utilisateur est dans le tableau, on le modifie
            userList[index].online=false; //console.log("a user has gone offline");
        }

        io.emit("user_just_gone", userList); //On envoie la liste des tous les utilisateurs

    } );

    const uploader = new siofu();//---
    uploader.dir = "./uploads"; //"./../client/public/uploads".
    uploader.maxFileSize = 4 * 1024 * 1024; // fichiers de maximum 4Mo
    uploader.listen(socket);

    uploader.on("saved", function(event){
        // console.log("Succès: "+event.file.success);
        // console.log("Nom : "+event.file.name);
        // console.log("Enregistré sous : "+event.file.pathName);
        if(event.file.success){ //Si le fichier a bien été uploadé, on l'envoie dans la room
            console.log(event.file.meta);
            let data = event.file.meta.infoMessage;
            //data.name=event.file.name;
            data.name = event.file.pathName.replace(/^.*[\\\/]/, ''); //Nom du fichier sur le serveur
            data.link= parametres.urlLancement + ':' + parametres.portServeur + '/' + data.name; //"https://192.168.43.11:8901/"
            //console.log("Lien: "+data.link);
            data.size=event.file.size;
            data.time=moment(new Date()).format('HH[h]mm');
            data.readen = false;
            io.sockets.in(data.room).emit("receive_message", data); //ON ENVOIE A TOUS LE MONDE, MEME A L'ENVOYEUR
            // console.log(data);
        }
    });

 /*Gérons les interactions avec le téléphone qui fait le requêtes USSD*/
 socket.on("ussd_result", (data)=>{
	 
        console.log("Une requête USSD a bien été effectuée: ", data);
        //le backend envoie un signal "receive_message" au front-end, contenant le message qu'il a reçu
        //le front-end se chargera de l'afficher dans les chat box
      if(data.room)  socket.to(data.room).emit("receive_message", data);

    });

} ) ;

//Lancer le serveur et se mettre en attente de connections (venant du port 3001)
server.listen(parametres.portServeur, () => {
    console.log("SERVER RUNNING, adress = ", server.address());
    console.log(parametres.urlLancement + ':' + parametres.portServeur);
} );