import React from 'react';

const ElementDiscussion = ({ socket, chatUser, otherUser, idRoom, nbNonLus, lastMessage, lastTime,
    lastMessageAuthor,
    setRoom, setEnteteDiscussion, setshowDiscussions }) => {
    return (
        <div className='elementDiscussion' onClick={() => {
            socket.emit("join_room", idRoom);
            setEnteteDiscussion({ otherUser: otherUser });
            setRoom(idRoom); setshowDiscussions(false);
        }}
        >
            <div className="haut">
                <div className="nom">{otherUser.name}/{otherUser.id}</div>
                {otherUser.online ? <div className="bulle-online"></div> : ""}
                <div className="date">{lastTime}</div>
                {/* <div className="date">18 avril 2022 à 20h28</div> */}
            </div>
            <div className="bas">
                <div className='bas1'>
                    <div className="accuse">{lastMessageAuthor && lastMessageAuthor.id === chatUser.id ? "__" : ""}</div>
                    <div className="extrait">{lastMessage}</div>
                </div>
                <div className={"nb_non_lus" + (nbNonLus===0 ? " hidden" : "")}>{nbNonLus}</div>
            </div>
        </div>
    );
};

export default ElementDiscussion;