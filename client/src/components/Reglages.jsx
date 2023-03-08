import React from 'react'
import "./Reglages.css"

const Reglages = ({setshowReglages, langue, setLangue, MesTextes}) => {


  return (
    <div className='zone-reglages'>
        <div className='en-tete-reglages'>
            <div className='titre'>{MesTextes.settings[langue]}</div>
            <div className='fermer' onClick={()=>{setshowReglages(false);}}>X</div>
        </div>
        <div className='un-reglage'>
          <p>{MesTextes.language[langue]}</p>
          <select value = {langue} onChange={(event)=>{setLangue(event.currentTarget.value);}}>
              <option value="fr">Français</option>
              <option value="en">Anglais</option>
          </select>
        </div>
        
    </div>
  );
}

export default Reglages