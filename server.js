import express from 'express';
import http from 'http';
import socketio from 'socket.io';
import gameBuilder from './public/gameBuilder.js';

const app = express();
const server = http.createServer(app);
const sockets = socketio(server)

app.use(express.static('public'));

const game = gameBuilder();

game.subscribe((command) => {
    sockets.emit(command.type, command)
})

sockets.on('connection', (socket) => {
    const playerId = socket.id

    socket.on('playerInfo', (data) => {
        const { nickname } = data;
        console.log(`> Player connected: ${playerId} - ${nickname}`);

        game.addPlayer({ playerId: playerId, nickname: nickname });

        if (Object.keys(game.state.players).length > 1) {
            sockets.emit('waiting-for-player', { remove: true });
        }
    });

    socket.emit('setup', game.state);

    socket.on('disconnect', () => {
        game.removePlayer({ playerId: playerId })
        console.log(`> Player disconnected: ${playerId}`)
    })

    socket.on('move-player', (command) => {
        command.playerId = playerId
        command.type = 'move-player'

        game.movePlayer(command)
    })
})

server.listen(3000, () => {
    console.log('> server running');
})