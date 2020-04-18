const { Client, ChannelManager } = require('discord.js');
const fs = require('fs');
const _ = require('lodash');
const token = require('./auth.json').token;
const bot = new Client();

/** @type {ChannelManager} */
let channels;

const taunts = fs.readdirSync('./taunts/');

let playing = false;

/** @type {VoiceConnection} */
let activeVoiceConnection;

bot.on('ready', () => {
    console.info('Online');

    channels = bot.channels;
});

bot.on('message', async msg => {
    const message = msg.content;

    if (message.startsWith(':stga: join')) {
        const targetChannel = message.replace(':stga: join ', '');

        const channel = channels.cache.filter(x => x.name === targetChannel).first();

        if (channel && channel.joinable) {
            console.info(`Joining ${targetChannel} (${channel.id})`);
            activeVoiceConnection = await channel.join();
        }
    }

    if (message.startsWith(':stga: leave')) {
        const activeConnexion = bot.voice.connections.first();

        if (activeVoiceConnection) {
            activeVoiceConnection = null;
            activeConnexion.channel.leave();
            console.info(`Left ${activeConnexion.channel.name}`);
        }
    }

    if(message.match(/[1-9]{1,2}/g)) {
        if (activeVoiceConnection) {
            playSound(msg.content, msg);
        }
    }
});

/**
 * @param {String} soundNumber
 * @param {Message} message
 */
function playSound(soundNumber, message) {
    if (soundNumber < 10) soundNumber = soundNumber.padStart(2, '0');
    const selectedSound = _.find(taunts, x => x.startsWith(soundNumber));

    if (!playing && selectedSound) {
        playing = true;
        
        const player = activeVoiceConnection.play(`./taunts/${selectedSound}`);

        player.on('start', () => {
            playing = true;
            console.log(`playing sound ${selectedSound}`);
        });
        player.on('finish', () => {
            playing = false;
            console.log(`played ${selectedSound}`);
        });
        player.on('error', () => {
            playing = false;
            console.log(`error while playing ${selectedSound}`);
        })
    }
}

bot.login(token);