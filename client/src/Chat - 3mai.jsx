import React, { useEffect, useState } from 'react';
import { mockComponent } from 'react-dom/test-utils';
import ScrollToBottom from 'react-scroll-to-bottom';
import { useCookies } from 'react-cookie';
import moment from 'moment';
import Discussions from './components/Discussions';
import Reglages from './components/Reglages';
import { getIdUtilisateur, formatBytes } from './functions/fonctions'
import {
  getMaterialFileIcon,
  getMaterialFolderIcon,
  getVSIFileIcon,
  getVSIFolderIcon,
} from "file-extension-icon-js";
import MicRecorder from 'mic-recorder-to-mp3';
//require('./functions/fonctions');

function Chat({socket, username, room, setRoom}) {

    const [currentMessage, setCurrentMessage] = useState(""); //le contenu de la zone de texte où on écrit

    const [messageList, setMessageList] = useState([]);
    const [roomList, setRoomList] = useState([]);
    const [contactList, setContactList] = useState([]);
    const [showContacts, setshowContacts] = useState(false);

    const [chatVisible, setChatVisible] = useState(false);
    const [showDiscussions, setshowDiscussions] = useState(false);
    const [showReglages, setshowReglages] = useState(false);
    const [langue, setLangue] = useState("fr");
    const [cookies, setCookie, removeCookie] = useCookies();
    const [goingFiles, setGoingFiles] = useState([]);

    // récupérons l'id de l'utilisateur du chat
    const [idChatUser, setIdChatUser] = useState();
    //let idChatUser = getIdUtilisateur(cookies, setCookie);


    //Définition des différents textes et de leurs traductions
    const MesTextes={
      typeBox : {"fr": "Ecrivez ici...", "en": "Type your message here"},
      online : {"fr": "en ligne", "en": "online"},
      videoCall : {"fr": "Appel vidéo", "en": "Video call"},
      audioCall : {"fr": "Appel audio", "en": "Audio call"},
      settings : {"fr": "Réglages", "en": "Settings"},
      closeWindow : {"fr": "Fermer la fenêtre", "en": "Close the window"},
      openWindow : {"fr": "Ouvrir la fenêtre de discussion", "en": "Open the chat window"},
      showContacts : {"fr": "Ouvrir la liste des contacts", "en": "Open the contact list"},
      chats : {"fr": "Discussions", "en": "Chats"},
      language: {"fr": "Langue", "en": "Language"},
      dataUnits:{"fr": ['octets', 'Ko', 'Mo', 'Go', 'To', 'Po', 'Eo', 'Zo', 'Yo'], 
                  "en": ['bytes', 'Kb', 'Mb', 'Gb', 'Tb', 'Pb', 'Eb', 'Zb', 'Yb']
                },
      recordVoice: {"fr": "Enregistrer un message vocal", "en": "Record a voice note"},
      sendVoice: {"fr": "Envoyer en envoyer", "en": "Save and send"},
      deleteVoice: {"fr": "Annuler le message vocal", "en": "Cancel the voice note"}
    };

    //Fonction qui envoie le message vers le serveur
    const sendMessage = async () => {
        if(currentMessage!==""){
            const messageData ={
                type: "text",
                link:"",
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


    useEffect( () => {
      setIdChatUser(getIdUtilisateur(cookies, setCookie));
    }, []);

    //Définissons la fonction à exécuter lorsqu'il y a changement 
    //au niveau du socket serveur
    useEffect( () => {
      //on écoute le signal qui sera émis par le backend (serveur)
      socket.on("receive_message", (data) => {
        setMessageList((list) => [...list, data]);
      });

    }, [socket]);

    //---
    const SocketIOFileUpload = require('socketio-file-upload');
    const uploader = new SocketIOFileUpload(socket);
    uploader.maxFileSize = 4 * 1024 * 1024; // fichiers de maximum 4Mo

    uploader.addEventListener("start", function(event){
              const messageData ={
                type: "file",
                link:"",
                room: room,
                author: username,
                message: "", //currentMessage
                time: ""
            };
      if(event.file.isVoice) {messageData.type="voice";}
      event.file.meta.infoMessage = messageData; //Les données concernant la pièce jointe
      });

    uploader.addEventListener("complete", function(event){
      console.log("Succès: "+event.success);
      console.log("Nom : "+event.file.name);
      //console.log("Nom final : "+event.file.base);
      //console.log("Enregistré sous : "+event.file.pathName);
      //console.log(event.detail);
  });

    uploader.addEventListener("error", function(data){

      console.log("Echec de l'envoi du fichier "+data.file.name+"\nDétails: "+data.message);
            if (data.code === 1) {
                alert("Vous ne pouvez pas envoyer des fichiers de plus de 4Mo");
                document.getElementById("siofu_input").value="";
            }
        });



         useEffect( () => {
          let chatWindow = document.getElementById('chat-window');
          let fileInput = document.getElementById("siofu_input");
          if(fileInput) uploader.listenOnInput(fileInput);
          if(chatWindow) uploader.listenOnDrop(chatWindow);
        }, [chatVisible]);


        //GESTION DE L'AUDIO

        const [Mp3Recorder, setMp3Recorder] = useState(new MicRecorder({ bitRate: 128 }))
        const [voiceAuthorised, setVoiceAuthorised] = useState(true);
        const [voiceRecording, setVoiceRecording] = useState(false);
        const [blobURL, setBlobURL] = useState('');

  const beginRecording =() => {
    //setVoiceRecording(true);
    if (!voiceAuthorised) {
      console.log('Permission Denied');
    } else {
      Mp3Recorder
        .start()
        .then(() => {
          setVoiceRecording(true);
        }).catch((e) => console.error(e));
    }
  }
  const deleteRecording =() => {
    setVoiceRecording(false);
    Mp3Recorder.stop();
  }
  const sendRecording =() => {
    //setVoiceRecording(false);
    Mp3Recorder
      .stop()
      .getMp3()
      .then(([buffer, blob]) => { console.log(buffer, blob);
        
        setBlobURL(URL.createObjectURL(blob));
        setVoiceRecording(false);

        //On utilise le timestamp de l'instant d'envoi comme nom du fichier
        const file = new File(buffer, Date.now() + '.mp3', {
          type: blob.type,
          lastModified: Date.now()
        });
        file.isVoice=true; //On ajoute un attribut au fichier, spécifiant qu'il est un voice
        uploader.submitFiles([file]);

      }).catch((e) => console.log(e));
  }


  useEffect( async () => {

    const streamHandler = () => {
      console.log('Permission Granted');
      setVoiceAuthorised(true);
    };
    const StreamErrorHandler = () => {
      console.log('Permission Denied');
      setVoiceAuthorised(false);
    };

    /* ACCES AU MICRO DE L'UTILISATEUR */
        navigator.getUserMedia = (
          navigator.getUserMedia ||
          navigator.webkitGetUserMedia ||
          navigator.mozGetUserMedia ||
          navigator.msGetUserMedia
      );

      //if (typeof navigator.mediaDevices.getUserMedia === 'undefined'
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        console.log("Nous allons utiliser navigator.mediaDevices.getUserMedia()");
          await navigator.mediaDevices.getUserMedia({
            audio: true
        }).then(streamHandler).catch(StreamErrorHandler);

      } else {
            navigator.getUserMedia({
              audio: true
          }, streamHandler, StreamErrorHandler);
      }
    /* fIN ACCES AU MICRO */

    
  }, []);

  //FIN DE LA GESTION DE L'AUDIO


  return ( !chatVisible ?
    <img className='bulle-chat' onClick={()=>setChatVisible(true)}
     src='../images/bulle-chat.png' alt='-' title={MesTextes.openWindow[langue]} />
    : (
    <div className='chat-parent'>
      {/* <audio src={blobURL} controls="controls" /> */}
      <p>Username: {username}, id: {idChatUser}</p>
      <p>Room: {room}</p>
      <div className="chat-window" id='chat-window'>
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
            messageList
            .filter((message) => message.room===room)
            .map((objMessage) => {
              return(
                <div className='message' id={username === objMessage.author ? "you" : "other"} >
                  <div>
                    <div className={'message-content'+ (objMessage.type==="voice"? " sans-bord" : "")}>
                      {objMessage.type==="file" || objMessage.type==="voice" ? 

                      <div className="piece-jointe">
                        {
                          objMessage.type==="voice" ? 
                          <audio className='voice-note' controls preload='metadata'>
                            <source src={objMessage.link} type="audio/mpeg"/>
                            Your browser does not support the audio element.
                          </audio>
                          :
                          <div className="zone-haut">
                            <div className='logo-piece-jointe'><img src={getVSIFileIcon(objMessage.name)} alt="logo" className="logo-piece-jointe" /></div>
                            <div className='lien-piece-jointe'>
                              <a href={objMessage.link} target="_blank" download>{objMessage.name}</a>
                            </div>
                          </div>
                        }
                        <div className={objMessage.type==="voice" ? "details-audio" : "zone-bas"}>
                          {formatBytes(objMessage.size, MesTextes.dataUnits[langue])} . {objMessage.name.split(".").pop().toUpperCase()}
                        </div>
                        
                      </div>
                      
                       : 
                      <p>{objMessage.message}</p>
                      }
                    
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
          <button className='piece-jointe' onClick={()=>document.getElementById("siofu_input").click()} >
            <img src='../images/piece-jointe.png' alt='-' />
          </button>
          <button className='voice' onClick={!voiceRecording? beginRecording : sendRecording} >
           {!voiceRecording? <img src='../images/voice.png' alt='-' /> : <img src='../images/send-voice.png' alt='-' />}
          </button>
          <button onClick={!voiceRecording? sendMessage : deleteRecording} >
            {!voiceRecording? <img src='../images/send.png' alt='-' /> : <img src='../images/delete-voice.png' alt='-' />}
          </button>
        </div>

        
        
        
        
        {
          showDiscussions ? 
          <Discussions socket={socket} roomList={roomList} setRoom={setRoom} contactList={contactList}
          setshowDiscussions={setshowDiscussions} langue={langue} setLangue={setLangue} 
          setChatVisible={setChatVisible} showContacts={showContacts} setshowContacts={setshowContacts}
           MesTextes={MesTextes} /> : ""
        }  
        {
          showReglages ? <Reglages  setshowReglages={setshowReglages} 
          langue={langue} setLangue={setLangue} MesTextes={MesTextes} /> : ""
        }        
        
      </div>
    </div>
    )
    
  )
}

export default Chat;