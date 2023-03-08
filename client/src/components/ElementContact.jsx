import React from 'react';

const ElementContact = () => {
    return (
        <div className='elementContact' onClick={()=>{/*socket.emit("join_room", idRoom); 
    setRoom(idRoom); setshowDiscussions(false);*/}}
        >
            <div className="haut">
                <div className="nom">Kana Shérelle</div>
                <div className="vu_le">vvv</div>
            </div>            
            <div className="bas">
                <div className="presentation">Semper Fidelis</div>
            </div>
        </div>
    );
};

export default ElementContact;