import React from 'react';
import { formatBytes } from '../functions/fonctions'
import {
    getMaterialFileIcon,
    getMaterialFolderIcon,
    getVSIFileIcon,
    getVSIFolderIcon,
  } from "file-extension-icon-js";


const Message = ({chatUser, objMessage, MesTextes, langue}) => {
    return (
        <div className='message' id={chatUser.id === objMessage.author.id ? "you" : "other"} >
                  <div>
                    <div className={'message-content'+ (objMessage.type==="voice"? " sans-bord" : "")}>
                      {objMessage.type==="file" || objMessage.type==="voice" ? 

                      <div className="piece-jointe" onClick={(event)=>event.currentTarget.querySelector('a').click()}>
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
                      <p id="author">{objMessage.author.name}</p>
                    </div>
                  </div>
                </div>
    );
};

export default Message;