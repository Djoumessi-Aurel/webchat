import React, { useEffect, useState } from 'react';
import { mockComponent } from 'react-dom/test-utils';
import ScrollToBottom from 'react-scroll-to-bottom';
import { useCookies } from 'react-cookie';
import moment from 'moment';
import Discussions from './components/Discussions';
import Reglages from './components/Reglages';
import { getChatUser } from './functions/fonctions'
import MicRecorder from 'mic-recorder-to-mp3';
import Message from './components/Message';
import { generateRoomId } from './functions/fonctions';
//require('./functions/fonctions');

function Chat({socket, room, setRoom, MesTextes}) {

    const [currentMessage, setCurrentMessage] = useState(""); //le contenu de la zone de texte où on écrit

    const [messageList, setMessageList] = useState([]);
    const [onlineSocketsIds, setOnlineSocketsIds] = useState([]); //Les id de socket des utilisateur en ligne
    const [userList, setUserList] = useState([]); //Les id de tous les utilisateurs qui se sont connectés au serveur
    const [roomList, setRoomList] = useState([]);
    const [contactList, setContactList] = useState([]);
    const [enteteDiscussion, setEnteteDiscussion] = useState({});
    const [showContacts, setshowContacts] = useState(false);

    const [chatVisible, setChatVisible] = useState(false);
    const [showDiscussions, setshowDiscussions] = useState(false);
    const [showReglages, setshowReglages] = useState(false);
    const [langue, setLangue] = useState("fr");
    const [cookies, setCookie, removeCookie] = useCookies();
    const [goingFiles, setGoingFiles] = useState([]);

    // récupérons l'id de l'utilisateur du chat
    const [chatUser, setChatUser] = useState();
    //let idChatUser = getChatUser(cookies, setCookie);
 

    //Fonction qui envoie le message vers le serveur
    const sendMessage = async () => {
        if(currentMessage!==""){
            const messageData ={
                type: "text",
                link:"",
                room: room,
                author: chatUser,
                message: currentMessage,
                time: moment(new Date()).format('HH[h]mm'),
                readen: false

            };

            // await socket.emit("send_message", messageData);
            if(!showDiscussions) messageData.readen=true;
            setMessageList((list) => [...list, messageData]);
            setCurrentMessage("");
        }
    };

    /* Fonction qui actualise le statut (lu ou non lu des messages) */
    useEffect( () => {
      if(!showDiscussions) messageList.forEach((value) => {if(value.room===room) value.readen = true;});
    }
    );


    //Définissons la fonction à exécuter lorsqu'il y a changement 
    //au niveau du socket serveur
    useEffect( () => {

      let valeur = getChatUser(cookies, setCookie);
      valeur.online=true;
      setChatUser(valeur);
      socket.emit("user_just_arrived", valeur); // console.log("valeur à envoyer");console.log(valeur);

      //on écoute le signal qui sera émis par le backend (serveur)
      socket.on("receive_message", (data) => { //console.log("MESSAGE RECU"); console.log(data);
        if(!showDiscussions) data.readen=true;
        setMessageList((list) => [...list, data]);
      });

      socket.on("user_just_arrived", (data) => { //On reçoit la liste des utilisateurs
        setUserList(data);
        console.log("Un nouvel utilisateur est arrivé! La liste est: "); console.log(data);

        //On crée les rooms contenant tous les couples d'utilisateur et on les rejoint
        data.forEach(user => { console.log(valeur)
          if(user.id!==valeur.id){
            socket.emit("join_room", generateRoomId(user.id, valeur.id));
          }
        });
         
      });

      socket.on("user_just_gone", (data) => { //On reçoit la liste des utilisateurs
        setUserList(data);
        console.log("Un utilisateur est parti! La liste est: "); console.log(data);
      });

    }, [socket]);

    //---
    const SocketIOFileUpload = require('socketio-file-upload');
    const uploader = new SocketIOFileUpload(socket);
    uploader.maxFileSize = 4 * 1024 * 1024; // fichiers de maximum 4Mo
    
    useEffect(() => {
      uploader.addEventListener("start", function(event){

        let myRoom = document.getElementById('room').innerHTML;
        let myUser={id: parseInt(document.getElementById('chatUser.id').innerHTML, 10),
                     name: document.getElementById('chatUser.name').innerHTML
                    };

        const messageData ={
          type: "file",
          link:"",
          room: room || myRoom,
          author: chatUser || myUser,
          message: "", //currentMessage
          time: "",
          readen: false
          };
        if(event.file.isVoice) {messageData.type="voice";}
        event.file.meta.infoMessage = messageData; //Les données concernant la pièce jointe
        });
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


        // ******* GESTION DE L'AUDIO ******* //

        const [Mp3Recorder, setMp3Recorder] = useState(new MicRecorder({ bitRate: 128 }))
        const [voiceAuthorised, setVoiceAuthorised] = useState(true); //TRES IMPORTANT QUE CECI soit à TRUE au départ
        const [voiceRecording, setVoiceRecording] = useState(false);
        const [blobURL, setBlobURL] = useState('');

  const beginRecording =() => {
    accederMicro(); //on demande l'accès au micro
    if (!voiceAuthorised) {
      console.log('You do not have the permission to record.');
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
      .then(([buffer, blob]) => { //console.log(buffer, blob);
        
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


  const streamHandler = () => {
    console.log('Permission Granted (to use de micro)'); //Lorsqu'on accepte l'accès au micro 
    setVoiceAuthorised(true);
  };
  const StreamErrorHandler = () => {
    console.log('Permission Denied  (to use de micro)'); //lorsqu'on refuse l'accès au micro
    setVoiceAuthorised(false);
  };

  const accederMicro = async () => { //Fonction qui demande l'accès au micro
    //if(voiceAuthorised) return;
    /* ACCES AU MICRO DE L'UTILISATEUR */
    navigator.getUserMedia = (
      navigator.getUserMedia ||
      navigator.webkitGetUserMedia ||
      navigator.mozGetUserMedia ||
      navigator.msGetUserMedia
  );

  //if (typeof navigator.mediaDevices.getUserMedia === 'undefined'
  if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
    // console.log("Nous allons utiliser navigator.mediaDevices.getUserMedia()");
      await navigator.mediaDevices.getUserMedia({
        audio: true
    }).then(streamHandler).catch(StreamErrorHandler);

  } else {
        navigator.getUserMedia({
          audio: true
      }, streamHandler, StreamErrorHandler);
  }

/* fIN ACCES AU MICRO */
  };

  // ******* FIN DE LA GESTION DE L'AUDIO ******* //

  useEffect(async () => { if(!showDiscussions && chatVisible)
    if(window.screen.width > 600) document.getElementById('input-saisie-texte').focus();
  }, [showDiscussions]);


  return ( !chatVisible ?
    <img className='bulle-chat' onClick={()=>setChatVisible(true)}
     src='../images/bulle-chat.png' alt='-' title={MesTextes.openWindow[langue]} />
    : (
    <div className='chat-parent'>
      {/* <audio src={blobURL} controls="controls" /> */}
      <div>Name: <b>{chatUser.name}</b>, id: {chatUser.id}</div>
      <div className='hide'>Room: {room} Nombre d'users: {userList.length} [
        {(userList.filter(user => user.online)).length} en ligne]</div>
        <div className='hide' id='room'>{room}</div>
        <div className='hide' id='chatUser.id'>{chatUser.id}</div>
        <div className='hide' id='chatUser.name'>{chatUser.name}</div>
      <div className="chat-window" id='chat-window'>
        <div className="chat-header">
          <div className='chat-header-left'>
            <div className='fleche-retour'>
              {/* <img src='../images/fleche-retour.png' alt='-' 
              onClick={()=>{setshowDiscussions(true);}} /> */}
              <img src='../images/fleche-retour.png' alt='-' />
            </div>
            <div className='info-interlocuteur'>
              Fine tuned AI
              {/* <div className='titre-interlocuteur'>
                  {enteteDiscussion.otherUser ? enteteDiscussion.otherUser.name : room}
              </div>
              <div className='details-interlocuteur'>
                {   enteteDiscussion.otherUser && enteteDiscussion.otherUser.online ? 
                  "(" + MesTextes.online[langue] + ")" : ""
                }
              </div> */}
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
            .map((objMessage, index) => {
              return(
                <Message chatUser={chatUser} objMessage={objMessage} MesTextes={MesTextes} langue={langue} 
                key={index} />
              );
            })
          }
          </ScrollToBottom>
        </div>
        <div className="chat-footer">
          <input
            type="text"  id="input-saisie-texte" autocomplete="off" 
            placeholder={MesTextes.typeBox[langue]}
            value={currentMessage}
            onChange={(event) => {
              setCurrentMessage(event.target.value);
            }}

            onKeyPress={(event) => {
              if(event.key === "Enter") sendMessage();
            }}
            
          />
          {/* <button className='piece-jointe' onClick={()=>document.getElementById("siofu_input").click()} >
            <img src='../images/piece-jointe.png' alt='-' />
          </button>
          <button className='voice' onClick={!voiceRecording? beginRecording : sendRecording} >
           {!voiceRecording? <img src='../images/voice.png' alt='-' /> : <img src='../images/send-voice.png' alt='-' />}
          </button> */}
          <button onClick={!voiceRecording? sendMessage : deleteRecording} >
            {!voiceRecording? <img src='../images/send.png' alt='-' /> : <img src='../images/delete-voice.png' alt='-' />}
          </button>
        </div>      
        
        {
          showDiscussions ? 
          <Discussions socket={socket} roomList={roomList} messageList={messageList} setRoom={setRoom} contactList={contactList}
          chatUser={chatUser} userList={userList} setshowDiscussions={setshowDiscussions} langue={langue} setLangue={setLangue} 
          setChatVisible={setChatVisible} showContacts={showContacts} setshowContacts={setshowContacts}
          setEnteteDiscussion={setEnteteDiscussion}
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