import express from 'express';
import http from 'http';
import socketio from 'socket.io';
import gameBuilder from './public/gameBuilder.js';

const app = express();
const server = http.createServer(app);
const sockets = socketio(server);

app.use(express.static('public'));

const game = gameBuilder();

game.subscribe((command) => {
    sockets.emit(command.type, command);
});

let gameLoopInterval = null;

function stopGameLoop() {
    clearInterval(gameLoopInterval);
    gameLoopInterval = null;
}

function startGameLoop() {
    if (gameLoopInterval) return;

    console.log('> Starting game loop...');
    gameLoopInterval = setInterval(() => {
        if (game.state.transition.active) {
            // Se estiver em transição, não faz nada (o countdown é gerenciado separadamente)
        } else if (Object.keys(game.state.players).length === 2) {
            game.moveBall();
        } else {
            // Jogo pausado se não houver jogadores suficientes
        }
    }, 1000 / 60);

    setInterval(() => {
        if (game.state.transition.active) {
            game.tickCountdown();
        }
    }, 1000);
}

sockets.on('connection', (socket) => {
    const playerId = socket.id;

    socket.on('playerInfo', (data) => {
        console.log(`> Player connected: ${socket.id} - ${data.nickname}`);

        const playersBeforeJoin = Object.keys(game.state.players).length;

        game.addPlayer({ playerId: socket.id, nickname: data.nickname });
        socket.emit('setup', game.state);

        if (playersBeforeJoin === 1 && Object.keys(game.state.players).length === 2) {
            console.log('> Second player joined. Starting the first game countdown...');
            game.startNextGame();
        }

        startGameLoop();
    });

    socket.on('disconnect', () => {
        console.log(`> Player disconnected: ${playerId}`);
        const wasActivePlayer = !!game.state.players[playerId];

        game.removePlayer({ playerId: playerId });

        if (wasActivePlayer && Object.keys(game.state.players).length < 2 && game.state.queue.length > 0) {
            const nextInQueue = game.state.queue.shift();
            game.addPlayer({ playerId: nextInQueue.id, nickname: nextInQueue.nickname });

            if (Object.keys(game.state.players).length === 2) {
                game.startNextGame();
            }
        } else if (Object.keys(game.state.players).length < 2) {
            game.state.transition.active = false;
            game.state.ball.velocityX = 0;
            game.state.ball.velocityY = 0;
            sockets.emit('update-game-transition', game.state.transition);
        }
    });

    socket.on('move-player', (command) => {
        command.playerId = playerId;
        command.type = 'move-player';
        game.movePlayer(command);
    });

    socket.on('send-chat-message', (messageText) => {
        let senderNickname = 'Anônimo';
        const player = game.state.players[socket.id] || game.state.queue.find(p => p.id === socket.id);
        if (player) {
            senderNickname = player.nickname;
        }

        sockets.emit('new-chat-message', {
            senderId: socket.id,
            senderNickname: senderNickname,
            text: messageText,
        });
    });
});

server.listen(3000, () => {
    console.log('> server running on port 3000');
});