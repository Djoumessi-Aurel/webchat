
// retourne l'utilisateur du chat (en le récupérant ou en le créant s'il n'existe pas encore)
export function getChatUser (cookies, setCookie){
    let valeur;
    if(cookies.chatUser){
        valeur = cookies.chatUser;
        console.log("Ancien utilisateur id= " + valeur.id + " Nom=" + valeur.name);
    }
    else {
        const { uniqueNamesGenerator, colors, names } = require('unique-names-generator');
        const randomName = uniqueNamesGenerator({ dictionaries: [colors, names] });

        valeur = {id: Date.now(), name: randomName, socketid:"", online:false};
        setCookie('chatUser', valeur, { path: '/', 
        maxAge: 90*24*3600 //durée de 90 jours
       // domain:'http://192.168.43.11:3000/' 
    });
        console.log("Nouvel utilisateur id= " + valeur.id + " Nom=" + valeur.name);
    }
    return valeur;
}

export function formatBytes(bytes, unites, decimals = 2) {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;

    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + '' + unites[i];
}

export function generateRoomId(id1, id2) {
    if (id1 < id2) return id1 + '' + id2;
    else  return id2 + '' + id1;
}