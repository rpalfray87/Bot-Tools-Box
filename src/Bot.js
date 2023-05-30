import { channel } from 'diagnostics_channel';
import fs from 'fs';

export default class Bot {
    constructor(id, channels) {
        this.id = id;
        this.channels = channels;
        this.fileDirectory = "./Ressources/";
        this.extensionFile = ".txt";
        this.ressourcesId = this.getRessourcesId();
        this.channelsList = this.listChannelsFromParentId(this.ressourcesId);
    }
    getId() {
        return this.id;
    }

    // recover ressources channel id
    getRessourcesId() {
        let rid = "";
        this.channels.forEach(channel => {
            if(channel.name === "Ressources") {
                rid = channel.id;
                return
            }
        });
        return rid;
    }

    listChannelsFromParentId(id){
        const channelsList = [];
        this.channels.forEach(channel => {
            if(channel.parentId == id) {
                //console.log("Name : " + channel.name + " id : " + channel.id);
                channelsList.push({name : channel.name, id : channel.id});
                //recoverTxtFileFromChannelName(channel.name)
            }
        });
        return channelsList;
    }

    // check if file already exist, if not create it
    checkFiles() {
        this.channelsList.forEach(channel => {
            if(!fs.existsSync(this.fileDirectory + channel.name + this.extensionFile)) {
                console.log("Create file : " + channel.name + this.extensionFile)
                this.createFile(channel.name + this.extensionFile)
            }
        });
    }

    // recover discord message from channel id
    async recoverMessageFromChannelId(channelId) {
        const channel = this.channels.get(channelId);
        let message = null;
        await channel.messages.fetch().then(messages => {
            messages.forEach(msg => {
                if(msg.author.id === this.id) {
                    message = msg
                }
            });
        });
        return message
    }

    // start the bot
    async start() {
        console.log("Bot started");
        //Check if file already exist for all channels, if not create it
        await this.checkFiles()
        this.channelsList.forEach(channel => {
            fs.watchFile(this.fileDirectory + channel.name + this.extensionFile, (curr, prev) => {
                console.log("Content updated from : " + channel.name + this.extensionFile);
                this.recoverMessageFromChannelId(channel.id).then(msg => {
                    const contentTxtFile = this.recoverContentFileFromChannelName(channel.name)
                    if (msg != null) {
                        this.editMessageInChannelId(channel.id, msg.id, contentTxtFile);
                    } else {
                        this.writeMessageInChannelId(channel.id, contentTxtFile)
                    }
                });
            });
        })
    }

    // recover content from file for a specific channel
    recoverContentFileFromChannelName(channelName) {
        const file = this.fileDirectory + channelName + this.extensionFile
        if(fs.existsSync(file)) {
            const content = fs.readFileSync(file, 'utf-8');
            return content;
        }
    }

    // create a new file
    createFile(fileName) {
        fs.writeFile(this.fileDirectory + fileName, 'utf-8', (err) => {
            if (err) throw err;
            console.log('The file has been saved!');
        });
    }

    // write a new message in channel
    writeMessageInChannelId(id, message) {
        const channel = this.channels.get(id);
        channel.send(message);
    }

    // edit a message in channel if message already exist
    editMessageInChannelId(id, messageId, messageContent) {
        const channel = this.channels.get(id);
        channel.messages.fetch(messageId).then(message => {
            message.edit(messageContent);
        });
    }
}