import React, {useEffect} from 'react';
import ElementContact from './ElementContact';
import axios from 'axios';

const Contacts = ({socket, contactList, langue, MesTextes, setRoom, setChatVisible, 
    setshowContacts, setshowDiscussions}) => {
        //const [data, setData] = useState([]);

        // Le useEffect se joue lorsque le composant est monté
    useEffect(() => {
        axios.get("https://192.168.43.82:8443/users/") //On récupère tous les utilisateurs via l'API
            .then((res) => {//setData(res.data);
            console.log(res.data);})
    }, []);

    return (
        <div className='fenetre-contacts'>
            <div className="titre-liste">
                <div className='fleche-retour'>
                    <img src='../images/fleche-retour.png' alt='-' 
                    onClick={()=>{setshowContacts(false);}} />
                </div>
                <div>
                    Contacts (174)
                </div>
                <div>
                    <img onClick={()=>setChatVisible(false)}
                    src='../images/close.png' alt='-' title={MesTextes.closeWindow[langue]} />
                </div>
            </div>
            <div className="liste-contacts">
                <ElementContact socket={socket} idRoom="11" setRoom={setRoom} setshowDiscussions={setshowDiscussions} />
                <ElementContact socket={socket} idRoom="12" setRoom={setRoom} setshowDiscussions={setshowDiscussions} />
            </div>
        </div>
    );
};

export default Contacts;