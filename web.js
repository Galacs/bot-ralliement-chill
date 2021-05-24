const DEBUG = true;
let socket;

if (DEBUG) {
    socket = new WebSocket("ws://localhost:3000");
} else {
    socket = new WebSocket("ws://ralliement-chill-bot.herokuapp.com:3000");
}


function SEND_DATA() {
    const TEMPLATE_DATA = {
        name:"none",
        type:"PLAYING",
        url:"http://www.google.com",
        passwd:null
    };
    
    let data = {
        name:"none",
        type:"PLAYING",
        url:"http://www.google.com",
        passwd: null
    };

    data.name = document.getElementById('name').value;
    data.type = document.getElementById('type').value;
    data.url = document.getElementById('url').value;
    data.passwd = document.getElementById('passwd');
    if (!data.name) data.name = TEMPLATE_DATA.name;
    if (!data.type) data.type = TEMPLATE_DATA.type;
    if (!data.url) data.url = TEMPLATE_DATA.url;
    if (!data.passwd) data.passwd = TEMPLATE_DATA.passwd;

    socket.send(JSON.stringify(data));
}

socket.onmessage = (event) => {
    if (event.data == 'ERR') {
        alert("Une erreur est survenue durant la definition de la RPC ou le mot de passe est incorrect");
    } else if (event.data == 'OK') {
        alert("RPC changee !");
    } else {
        alert('Le serveur a repondu avec un message inconnu');
    }
}

window.onload = () => {
    document.getElementById("send").addEventListener( 'click' ,SEND_DATA);    
}