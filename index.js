import fs from 'fs';
import { Client, Events, GatewayIntentBits } from 'discord.js';
import * as dotenv from 'dotenv'
import Bot from './src/Bot.js';

dotenv.config()

const fileDirectory = "./Ressources/";
const token = process.env.BOT_TOKEN;
const client = new Client({ intents: [GatewayIntentBits.Guilds] }); // Create a new client instance

/*
const fileName = "message.txt";

const content = fs.readFileSync(fileName, 'utf-8');

//onUpdate file function    
fs.watchFile(fileName, (curr, prev) => {
    console.log("content updated");
});

console.log(content);
*/


// When the client is ready, run this code (only once)
// We use 'c' for the event parameter to keep it separate from the already defined 'client'
client.once(Events.ClientReady, c => {
	console.log(`Ready! Logged in as ${c.user.id}`);
    const bot = new Bot(c.user.id);
    const ressourcesId = getRessourcesId();
    listChannelsFromParentId(ressourcesId);

    /*(async () => {
        let msg = await recoverMessageFromChannelId("1112046183750307881");
        console.log(msg)
        editMessageInChannelId("1112046183750307881", msg.id, "Hello je suis le bot et je peux me modifier <3");
    })()*/
    
    //writeMessageInChannelId("1112046183750307881", "Hello je suis le bot et je parle <3");
});




// recover ressources channel id
function getRessourcesId() {
    const channels = client.channels.cache;
    let rid = "";
    channels.forEach(channel => {
        if(channel.name === "Ressources") {
            rid = channel.id;
            return
        }
    });
    return rid;
}

// list channels from parent id
function listChannelsFromParentId(id){
    const channels = client.channels.cache;
    channels.forEach(channel => {
        if(channel.parentId == id) {
            console.log("Name : " + channel.name + " id : " + channel.id);
            recoverTxtFileFromChannelName(channel.name)
        }
    });
}

function recoverTxtFileFromChannelName(channelName) {
    if(fs.existsSync(fileDirectory + channelName+".txt")) {
        const content = fs.readFileSync(fileDirectory + channelName+".txt", 'utf-8');
        console.log(content)
    } else {
        createFile(channelName+".txt")
    }
}

function createFile(fileName) {
    fs.writeFile("./Ressources/" + fileName, 'utf-8', (err) => {
        if (err) throw err;
        console.log('The file has been saved!');
    });
}

async function recoverMessageFromChannelId(id) {
    const channel = client.channels.cache.get(id);
    let message = null;
    await channel.messages.fetch().then(messages => {
        messages.forEach(msg => {
            if(msg.author.id === client.user.id) {
                console.log("Content : " + msg.content)
                message = msg
            }
        });
    });
    return message
}

function writeMessageInChannelId(id, message) {
    const channel = client.channels.cache.get(id);
    channel.send(message);
}

function editMessageInChannelId(id, messageId, messageContent) {
    const channel = client.channels.cache.get(id);
    channel.messages.fetch(messageId).then(message => {
        message.edit(messageContent);
    });
}

// Log in to Discord with your client's token
client.login(token);