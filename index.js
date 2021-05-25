const Discord = require("discord.js")
const fs = require("fs");
const { exit } = require("process");
const http = require("http");


const PASSWD = "passwd"

const NICE_ID = "340521732823580672"
let TOKEN;

//const socket = new WebSocket("ws://localhost:3000");

const COMMANDES = [
    "help - Montre cette aide",
    "membre [x] - Change la limite de membre du salon dans lequel on se situe (si compatible, Permission requise : Aucune)",
    "adsalon [id] - Ajoute un salon compatible par son id (Permission requise : Administrateur / Développeur)",
    "rmsalon [id] - Supprime un salon des salons compatibles par son id (Permission requise : Administrateur / Développeur)",
    "lssalon - Affiche une liste des id des salons compatibles (Permission requise : Administrateur / Développeur)",
    "prefix [prefix] - Change le préfixe des commandes. Celui-ci doit faire 1 lettre. Si plusieurs sont données, seule la première sera prise en compte (Permission requise : Administrateur / Développeur)",
    "mvall [id] - Déplace tous les utilisateurs d'un salon (plein) dans un autre salon."
];

//*
//*Lecture du token et décodage
//*
try {
    let fileData = fs.readFileSync("token");
    let tempData = Buffer.from(fileData.toString('utf-8'), 'base64');
    TOKEN = tempData.toString('utf-8');
    console.log( TOKEN );
} catch {
    //! En cas d'erreur, arrêt du bot
    console.error("[FATAL] Impossible de lire le token ou de le décrypter. Arrêt du bot...");
    exit();
}



let OK_ID = ["830401294178975785", "830000810494132234"];
let prefix = "µ";
let CONFIG = {};
let config_read = false;
//*
//* Lecture du fichier options.json
//*
try {
    CONFIG = fs.readFileSync("options.json");
    config_read = true;
} catch {
    //! En cas d'erreur
    //* Création avec les paramètres par défaut (prefix = "µ", salons => Tous les salons chill du Ralliement))
    //*
    console.warn("[ERROR] Lecture impossible de options.json. Creation avec les parametres par defaut...");
    CONFIG = {
        "prefix" : "µ",
        "salons" : ["830401294178975785", "830000810494132234"]
    }
    fs.writeFileSync("options.json", JSON.stringify(CONFIG));
    console.warn("Cree !");
    OK_ID = CONFIG.salons;
    prefix = CONFIG.prefix;
}

//* Tentative de parsing JSON sur la config (si réussi)

if (config_read) {
    try {
        CONFIG = JSON.parse(CONFIG);
        console.log("[INFO] Parse JSON réussi. Test...");
        OK_ID = CONFIG.salons;
        prefix = CONFIG.prefix;
        console.log("[INFO] Test JSON établi. Paré au démmarrage !");
    } catch {
        //! En cas d'échec du parse
        //* Création avec les paramètres par défaut (prefix = "µ", salons => Tous les salons chill du Ralliement))
        //*
        console.error("[ERROR] Echec lors du parse JSON sur CONFIG ou lors du test du parse. Creation de la config avec les parametres par defaut...");
        CONFIG = {
            "prefix" : "µ",
            "salons" : ["830401294178975785", "830000810494132234"]
        };
        OK_ID = CONFIG.salons;
        prefix = CONFIG.prefix;
        warn("[WARN] Cree !");
    }
}

const client = new Discord.Client();


client.on("message", async message => {
    if (message.content.startsWith(prefix)) {
        if (!message.guild.members.resolve(client.user.id).hasPermission("ADMINISTRATOR")) {
            message.channel.send("Ce connard de Yann n'a pas donné les permissions administrateur. De ce fait je ne peux répondre à quelconque commande");
            return;
        }
        const content = message.content;
        var suppcomm = content.substr(0,7);
        if (suppcomm == prefix + "membre") {
            const member = client.guilds.resolve(message.guild.id).members.resolve(message.author.id);
            const nombre = content.substring(8, content.length);
            const iNombre = parseInt(nombre);
            if (iNombre == NaN) {
                message.author.send($`{nombre} n'est pas un nombre valide, vérifiez qu'il n'y a bien qu'un seul espace`);
                return;
            }
            if (iNombre > 99) {
                message.channel.send($`{iNombre} est trop grand. La limite maximum d'utilisateurs dans un salon est 99`);
                return;
            }
            if (member.voice.channel) {
                if (!OK_ID.includes(member.voice.channel.id)) {
                    message.channel.send("Tu n'es pas dans un salon compatible ! ");
                } else {
                    if (iNombre == 69 || iNombre == 42) {
                        function re(reaction) {
                            message.react(reaction);
                        }
                        re("🇳");
                        re("🇮");
                        re("🇨");
                        re("🇪");
                    }
                    message.channel.send("Fait !");
                    member.voice.channel.setUserLimit(iNombre);
                }
            } else {
                message.channel.send("Tu dois être connecté à un salon vocal pour utiliser cette commande !");
            }
        } else if (suppcomm == prefix + "prefix") {
            const member = client.guilds.resolve(message.guild.id).members.resolve(message.author.id);
            if (!member.hasPermission("ADMINISTRATOR") && member.id != NICE_ID) {
                message.channel.send("Vous n'avez pas les permissions nécessaires ou vous n'êtes pas développeur. Permission requise : ADMINISTRATEUR");
                message.react("❌");
                return;
            }
            let sp_prefix = content.substr(8, 1);
            if (sp_prefix == " ") {
                message.channel.send("Pour des raisons de sécurité et de compatibilité, le nouveau préfixe ne peut être un espace vide. Si tel n'est pas le cas, veuillez vérifier qu'il n'y ai bien qu'un seul espace entre la commande et l'argument {prefix}");
                message.react("❌");
                return;
            }
            if (sp_prefix.length > 1 || sp_prefix.length < 1) {
                message.channel.send("Une erreur s'est produite. La longueur du préfixe récupérer par l'algorithme de découpage est supérieur ou inférieur à 1. Ceci peut-être le signe d'un bug. Merci de le faire parvenir au développeur.");
                message.react("❌");
                return;
            }
            //message.channel.send("Nouveau prefix : " + sp_prefix + " :white_check_mark:");
            message.react("✅");
            prefix = sp_prefix;
            CONFIG.prefix = sp_prefix;
            fs.writeFileSync("options.json", JSON.stringify(CONFIG));
        } else {
            suppcomm = content.substr(0, 8);
            const member = client.guilds.resolve(message.guild.id).members.resolve(message.author.id);
            if (suppcomm == prefix + "adsalon") {
                if (!member.hasPermission("ADMINISTRATOR") && member.id != NICE_ID) {
                    message.channel.send("Vous n'avez pas les permissions nécessaires ou vous n'êtes pas développeur. Permission requise : ADMINISTRATEUR");
                    message.react("❌");
                    return;
                }
                let suppid = content.substr(9, content.length);
                //*
                //* Test de l'ID donnée dans la commande via un resolve dans un try - catch
                //*
                let suppchannel = undefined;
                try {
                    suppchannel = message.guild.channels.resolve(suppid);
                } catch {
                    message.channel.send("Une erreur s'est produite. L'ID peut-être erronée");
                    message.react("❌");
                    return;
                }
                if (suppchannel == undefined || suppchannel == null) {
                    message.channel.send("L'ID du salon est incorrecte")
                    message.react("❌");
                    return;
                }
                if (suppchannel.isText()) {
                    message.channel.send("Le salon ne peut pas être un salon textuel.");
                    message.react("❌");
                    return;
                }
                OK_ID.push(suppchannel.id);
                CONFIG.salons = OK_ID;
                fs.writeFileSync("options.json", JSON.stringify(CONFIG));
                message.react("✅");
            } else if (suppcomm == prefix + "rmsalon") {
                if (!member.hasPermission("ADMINISTRATOR") && member.id != NICE_ID) {
                    message.channel.send("Vous n'avez pas les permissions nécessaires ou vous n'êtes pas développeur. Permission requise : ADMINISTRATEUR");
                    message.react("❌");
                    return;
                }
                let suppid = content.substr(9, content.length);
                if (!OK_ID.includes(suppid)) {
                    message.channel.send("Salon non répertorié dans le tableau des salons gérés par le bot");
                    message.react("❌");
                    return;
                }
                let temp_ok = [];
                for (let id of OK_ID) {
                    if (id == suppid) continue;
                    temp_ok.push(id);
                }
                OK_ID = temp_ok;
                CONFIG.salons = OK_ID;
                fs.writeFileSync("options.json", JSON.stringify(CONFIG));
                message.react("✅");
            } else if (suppcomm == prefix + "lssalon") {
                if (!member.hasPermission("ADMINISTRATOR") && member.id != NICE_ID) {
                    message.channel.send("Vous n'avez pas les permissions nécessaires ou vous n'êtes pas développeur. Permission requise : ADMINISTRATEUR");
                    message.react("❌");
                    return;
                }
                let answer = "Liste des salons compatbiles :\n";
                for (let i of OK_ID) {
                    answer += i + "\n";
                }
                message.channel.send(answer);
            } else {
                suppcomm = content.substr(0, 5);
                if (suppcomm == prefix + "help") {
                    let msg = "Voici la liste des commandes :\n";
                    for (let i of COMMANDES) {
                        msg += i + "\n";
                    }
                    message.channel.send(msg);
                } else if (content.substr(0, 10) == prefix + "forcestop") {
                    let msg = await message.channel.send(">>Authentification en cours...");
                    setTimeout(async ( ) => {
                        if (message.author.id != NICE_ID) {
                            await msg.edit(">>Authentifiaction en cours...\n>>Authentification échouée : Relation master-slave échouée. Vous n'êtes pas maître.")
                            return;
                        }
                        await msg.edit(">>Authentifiaction en cours\n>>Authentification réussie : Relation master-slave établie. Vous êtes maître, destruction de l'instance de classe cliente...");
                        client.destroy();
                        exit(); 
                    } ,1700);
                } else if (content.substr(0, 6) == prefix + "mvall") {
                    if (member.id == "752596366848426034") {
                        message.channel.send("Vous n'êtes plus autorisé à utiliser cette commande");    
                        return;
                    }
                    if (!member.voice) {
                        message.channel.send("Tu dois être dans un salon vocal pour utiliser cette commande !");
                        return;
                    }
                    if (member.voice.channel.members.size < member.voice.channel.userLimit) {
                        message.channel.send("Le salon vocal doit être plein pour utiliser cette commande !");
                        return;
                    }
                    let suppid = content.substr(7, content.length);
                    //message.author.send(suppid);
                    let abdul = message.guild.channels.resolve(suppid);
                    if (abdul === null || abdul === undefined) {
                        message.channel.send("L'ID du salon est invalide")
                        return;
                    }
                    if (abdul.isText()) {
                        message.channel.send("Le salon de destination doit être un salon vocal !");
                        return;
                    }
                    let memberID, mem
                    for ([memberID, mem] of member.voice.channel.members) {
                        try {
                            mem.voice.setChannel(abdul, "Move demandé par " + message.author.username);
                        } catch {
                            continue;
                        }
                    }
                    message.react("✅");
                } else if (content.substr(0, 11) == prefix + "monogatari") {
                    if (!member.voice.channel) {
                        message.channel.send("Tu dois être dans un salon vocal pour utiliser cette commande");
                        return;
                    }
                    member.voice.channel.join().then((connection)=> {
                        const dispatcher = connection.play("song.mp3");
                        dispatcher.on("finish", end => {
                            member.voice.channel.leave();
                            return;
                        });
                    });
                } else if (content.substr(0, 5) == prefix + "stfu") {
                    if (!member.voice.channel) {
                        message.channel.send("Tu dois être dans un salon vocal pour utiliser cette commande !");
                        return;
                    }
                    member.voice.channel.leave();
                } else if (content.substr(0, 5) == prefix + "boku") {
                    if (!member.voice.channel) {
                        message.channel.send("Tu dois être dans un salon vocal pour utiliser cette commande");
                        return;
                    }
                    member.voice.channel.join().then((connection)=> {
                        const dispatcher = connection.play("boku.mp3");
                        dispatcher.on("finish", end => {
                            member.voice.channel.leave();
                            return;
                        });
                    });
                } else if (content.substr(0, 10) == prefix + "forceboku") {
                    let suppid = content.substr(11, content.length);
                    if (!member.hasPermission("ADMINISTRATOR") && member.id != NICE_ID) {
                        message.channel.send("Tu n'es pas autorisé à utiliser cette commande !");
                        return;
                    }
                    let suppchannel = message.guild.channels.resolve(suppid);
                    if (suppchannel === null || suppchannel === undefined) {
                        message.channel.send("Salon invalide.");
                        return;
                    } 
                    if (suppchannel.isText()) {
                        message.channel.send("Le salon doit être un salon vocal");
                        return;
                    }
                    if (suppchannel.members.size <= 0) {
                        message.channel.send("Le salon doit comporter au moin une personne");
                        return;
                    }
                    let mem = suppchannel.members.first();
                    mem.voice.channel.join().then(connection => {
                        let dispatcher = connection.play("boku.mp3");
                        dispatcher.on("finish", end => {
                            mem.voice.channel.leave();
                            return;
                        })
                    });
                }
            }
        }
    }
})
client.login(TOKEN);
client.on("ready", ()=> {
    client.user.setPresence(
        {
            activity: {
                name: "Gang-bang with your mom",
                type: "COMPETING",
                url:"https://twitch.tv/monstercat"
            }
        }
    );
});

let server = http.createServer((req,res) => {
    if (url == "/") {
        res.writeHead(200, {'Content-Type': "text/html"});
        res.end(fs.readFileSync("main.html"));
    }
    let url = req.url.slice(1);
    let objectToRead;
    try {
        objectToRead = fs.readFileSync(url);
    } catch {
        res.writeHead(404);
        res.end("<style>h1 {font-family:'sans-serif';}</style>\n<h1>404 - Not Found</h1>");
        return;
    }
    res.writeHead(200);
    res.end(objectToRead);
})

/*socket.onopen = () => {
    console.log("[DEBUG] Socket opened successfully !");
}*/

/*socket.onmessage = (event) => {
    let parsedData;
    try {
        parsedData = JSON.parse(event.data);
    } catch {
        console.warn("[WARN] Une erreur s'est produite durant le parse JSON d'une connexion pour le changement de la RPC.");
        socket.send("ERR");
        return;
    }

    if (parsedData != PASSWD) {
        socket.send('ERR');
        console.log("[INFO] Connexion refusée suite à un mauvais mot de passe");
        return;
    }

    client.user.setPresence({
        activity: {
            name:parsedData.name,
            type:parsedData.type,
            url:parsedData.url
        }
    });
    console.log("[INFO] RPC modifiée !");
    socket.send("OK");
}*/

server.listen(process.env.PORT);