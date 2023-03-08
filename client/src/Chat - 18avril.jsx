import React, { useEffect, useState } from 'react';
import { mockComponent } from 'react-dom/test-utils';
import ScrollToBottom from 'react-scroll-to-bottom';
import moment from 'moment';
import Reglages from './components/Reglages';
import Discussions from './components/Discussions';

function Chat({socket, username, room}) {

    const [currentMessage, setCurrentMessage] = useState(""); //le contenu de la zone de texte où on écrit
    const [messageList, setMessageList] = useState([]);
    const [chatVisible, setChatVisible] = useState(false);
    const [showReglages, setshowReglages] = useState(false);
    const [showDiscussions, setshowDiscussions] = useState(false);
    const [langue, setLangue] = useState("fr");

    //Définition des différents textes et de leurs traductions
    const MesTextes={
      typeBox : {"fr": "Ecrivez ici...", "en": "Type your message here"},
      online : {"fr": "en ligne", "en": "online"},
      videoCall : {"fr": "Appel vidéo", "en": "Video call"},
      audioCall : {"fr": "Appel audio", "en": "Audio call"},
      settings : {"fr": "Réglages", "en": "Settings"},
      closeWindow : {"fr": "Fermer la fenêtre", "en": "Close the window"},
      openWindow : {"fr": "Ouvrir la fenêtre de discussion", "en": "Open the chat window"},
      language: {"fr": "Langue", "en": "Language"}
    };

    //Fonction qui envoie le message vers le serveur
    const sendMessage = async () => {
        if(currentMessage!==""){
            const messageData ={
                room: room,
                author: username,
                message: currentMessage,
                time: moment(new Date()).format('HH[h]mm')

            };

            await socket.emit("send_message", messageData);
            setMessageList((list) => [...list, messageData]);
            setCurrentMessage("");
        }
    }


    //Définissons la fonction à exécuter lorsqu'il y a changement 
    //au niveau du socket serveur
    useEffect( () => {
      //on écoute le signal qui sera émis par le backend (serveur)
      socket.on("receive_message", (data) => {
        setMessageList((list) => [...list, data]);
      });
    }, [socket]);

  return ( !chatVisible ?
    <img className='bulle-chat' onClick={()=>setChatVisible(true)}
     src='../images/bulle-chat.png' alt='-' title={MesTextes.openWindow[langue]} />
    : (
    <div className='chat-parent'>
      <p>Username: {username}</p>
      <p>Room: {room}</p>
      <div className="chat-window">
        <div className="chat-header">
          <div className='chat-header-left'>
            <div className='fleche-retour'>
              <img src='../images/fleche-retour.png' alt='-' 
              onClick={()=>{setshowDiscussions(true);}} />
            </div>
            <div className='info-interlocuteur'>
              <div className='titre-interlocuteur'>{room}</div>
              <div className='details-interlocuteur'>Agent ({MesTextes.online[langue]})</div>
            </div>
          </div>
          <div className='chat-header-right'>
            <div>
              <img src='../images/vcall.png' alt='-' title={MesTextes.videoCall[langue]} />
              <img src='../images/acall.png' alt='-' title={MesTextes.audioCall[langue]} />
              <img onClick={()=>{setshowReglages(true);}} 
              src='../images/param.png' alt='-' title={MesTextes.settings[langue]} />
              <img onClick={()=>setChatVisible(false)}
              src='../images/close.png' alt='-' title={MesTextes.closeWindow[langue]} />
            </div>
          </div>
        </div>
        <div className="chat-body">
          <ScrollToBottom className="message-container" >
          {
            messageList.map((objMessage) => {
              return(
                <div className='message' id={username === objMessage.author ? "you" : "other"} >
                  <div>
                    <div className='message-content'>
                      <p>{objMessage.message}</p>
                    </div>
                    <div className='message-meta'>
                      <p id="time">{objMessage.time}</p>
                      <p id="author">{objMessage.author}</p>
                    </div>
                  </div>
                </div>
              );
            })
          }
          </ScrollToBottom>
        </div>
        <div className="chat-footer">
          <input
            type="text" autoFocus
            placeholder={MesTextes.typeBox[langue]}
            value={currentMessage}
            onChange={(event) => {
              setCurrentMessage(event.target.value);
            }}

            onKeyPress={(event) => {
              if(event.key === "Enter") sendMessage();
            }}
            
          />
          <button className='piece-jointe'><img src='../images/piece-jointe.png' alt='-' /></button>
          <button className='voice'><img src='../images/voice.png' alt='-' /></button>
          <button onClick={sendMessage} >&#9658;</button>
        </div>
        {
          (()=>(showReglages ? <Reglages  setshowReglages={setshowReglages} 
            langue={langue} setLangue={setLangue} MesTextes={MesTextes} /> : ""))()
        }
        {
          showDiscussions ? <Discussions  setshowReglages={setshowReglages} 
          langue={langue} setLangue={setLangue} MesTextes={MesTextes} /> : ""
        }          
        
      </div>
    </div>
    )
    
  )
}

export default Chat;