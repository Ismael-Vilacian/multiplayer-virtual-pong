import express from 'express';
import http from 'http';
import socketio from 'socket.io';
import gameBuilder from './public/gameBuilder.js';

const app = express();
const server = http.createServer(app);
const sockets = socketio(server)

app.use(express.static('public'));

const game = gameBuilder();

sockets.on('connection', (socket) => {
    const playerId = socket.id

    socket.on('playerInfo', (data) => {
        const { nickname } = data;
        console.log(`> Player connected: ${playerId} - ${nickname}`);

        game.addPlayer({ playerId: playerId, nickname: nickname });

        socket.emit('setup', game.state);
    });
})

server.listen(3000, () => {
    console.log('> server running');
})