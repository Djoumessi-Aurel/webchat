import React, { useState } from 'react';
import io from 'socket.io-client';
import Chat from './Chat';
import "./App.css";
const parametres = require('./parametres.json');

// io.connect("https://localhost:8901");
const socket = io.connect(parametres.urlLancement + ':' + parametres.portServeur); //"https://192.168.43.11:8901" //on se connecte au serveur sur le port 8901

const App = () => {

        const [username, setUsername] = useState("");
        const [room, setRoom] = useState("");
        const [showChat, setShowChat] = useState(true);

        const joinRoom = () => {
            if(username !=="" && room!== ""){
                socket.emit("join_room", room);
                setShowChat(true);
            }
        }

        const MesTextes = parametres.MesTextes;

        return(
        <div className='App'>
            {!showChat ? //Si showChat est à false (c-à-d on n'a pas encore rejoint une discussion)
            (
            <div className='joinChatContainer'>
                <h3>Join A Chat</h3>
                <input type="text" autoFocus placeholder='Votre nom' 
                onChange={ (event)=>{
                    setUsername(event.target.value);
                } } 
                onKeyPress={(event) => {
                    if(event.key === "Enter") joinRoom();
                  }}
                />

                <input type="text" placeholder='Room id' 
                onChange={ (event)=>{
                    setRoom(event.target.value);
                } } 
                onKeyPress={(event) => {
                    if(event.key === "Enter") joinRoom();
                  }}
                />

                <button onClick={joinRoom} >Join A Room</button>
            </div>

            ) : //Sinon (showChat est à true),on affiche le chat
                (
            <>
            <input type="file" id="siofu_input" />
            <Chat socket={socket} username={username} room={room} setRoom={setRoom} MesTextes={MesTextes} />
            </>
            )
        }
        </div>
        );
}

export default App;