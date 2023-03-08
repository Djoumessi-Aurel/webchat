import React, {useState} from 'react';
import ElementDiscussion from './ElementDiscussion';
import './Discussions.css';
import './ElementDiscussion.css';
import Reglages from './Reglages';
import Contacts from './Contacts';
import { generateRoomId } from '../functions/fonctions';


const Discussions = ({socket, roomList, messageList, contactList, userList, chatUser,
    setRoom, setshowDiscussions, setChatVisible, setshowContacts, showContacts, setEnteteDiscussion,
     langue, setLangue, MesTextes}) => {

    const [showReglages, setshowReglages] = useState(false);

    return (
        <div className='fenetre-discussions'>
            <div className="titre-liste">
                <div>
                    {MesTextes.users[langue]}{/*MesTextes.chats[langue]*/} ({userList.length - 1})
                    {/* [ {(userList.filter(user => user.online)).length} {MesTextes.online[langue]} ] */}
                </div>
                <div>
                    <img onClick={()=>{setshowReglages(true);}} 
                    src='../images/param.png' alt='-' title={MesTextes.settings[langue]} />
                    <img onClick={()=>setChatVisible(false)}
                    src='../images/close.png' alt='-' title={MesTextes.closeWindow[langue]} />
                </div>
            </div>
            <div className="liste-discussions">
                {
                    userList
                    .filter((user) => user.id!==chatUser.id)
                    .map((user, index) => {
                        let myvar=generateRoomId(chatUser.id, user.id);
                        let messageComplet = messageList.filter( //Les messages d'une discussion
                            (message) => message.room === myvar
                        );
                        let messageL = messageComplet.filter( //Les messages non lus
                            (message) => message.readen === false
                        );
                        
                        let lastMessage = "", lastTime = "", lastMessageAuthor="";

                        if(messageComplet.length>0){
                            lastMessage = messageComplet[messageComplet.length - 1]; lastTime = lastMessage.time;
                            lastMessageAuthor = lastMessage.author;
                        if(lastMessage.type==="text") lastMessage = lastMessage.message;
                        if(lastMessage.type==="voice") lastMessage = MesTextes.messageVoice[langue];
                        else if(lastMessage.type==="file") lastMessage = MesTextes.messageFile[langue];
                        }

                        return(
                            <ElementDiscussion chatUser={chatUser} otherUser={user} socket={socket} key={index} 
                            setEnteteDiscussion={setEnteteDiscussion} nbNonLus={messageL.length} 
                            lastMessage={lastMessage} lastTime={lastTime}  lastMessageAuthor={lastMessageAuthor}
                            idRoom={generateRoomId(chatUser.id, user.id)} setRoom={setRoom} setshowDiscussions={setshowDiscussions} />
                        );
                      })
                }

            </div>
            {
                showReglages ? <Reglages  setshowReglages={setshowReglages} 
                langue={langue} setLangue={setLangue} MesTextes={MesTextes} /> : ""
            }

            {
            showContacts ? 
            <Contacts socket={socket} setRoom={setRoom} contactList={contactList} 
            setChatVisible={setChatVisible} setshowContacts={setshowContacts} 
            setshowDiscussions={setshowDiscussions} langue={langue} MesTextes={MesTextes} /> 
            : 
            <img className='affiche-contacts' onClick={()=>setshowContacts(true)}
            src='../images/plus.png' alt='-' title={MesTextes.showContacts[langue]} />
            }
        </div>
    );
};

export default Discussions;