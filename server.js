import express from 'express';
import http from 'http';
import {
    Server
} from 'socket.io';
import gameBuilder from './public/gameBuilder.js';

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static('public'));

const rooms = {};

function generateRoomId() {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
}

function getRoomList() {
    const allRooms = {};
    for (const id in rooms) {
        allRooms[id] = {
            name: rooms[id].name,
            type: rooms[id].type,
            playerCount: Object.keys(rooms[id].game.state.players).length + rooms[id].game.state.queue.length
        };
    }
    return allRooms;
}

io.on('connection', (socket) => {
    socket.emit('roomList', getRoomList());

    socket.on('createRoom', (data) => {
        const roomId = generateRoomId();
        const game = gameBuilder();
        game.state.roomId = roomId;

        game.subscribe((command) => {
            io.to(roomId).emit(command.type, command);
        });

        rooms[roomId] = {
            name: data.name,
            type: data.type,
            password: data.password,
            game: game,
            sockets: {},
            gameLoopInterval: null
        };

        joinRoom(roomId, data.nickname, data.password);
    });

    socket.on('joinRoom', (data) => {
        joinRoom(data.roomId, data.nickname, data.password);
    });

    socket.on('checkRoomPassword', (roomId) => {
        const room = rooms[roomId];
        const isRequired = !!(room && room.type === 'private');
        socket.emit('roomPasswordRequired', isRequired);
    });


    function joinRoom(roomId, nickname, password) {
        const room = rooms[roomId];
        if (!room) {
            return socket.emit('error', 'Sala não encontrada.');
        }

        if (room.type === 'private' && room.password !== password) {
            return socket.emit('error', 'Senha incorreta.');
        }

        socket.join(roomId);
        room.sockets[socket.id] = socket;
        socket.data.roomId = roomId;

        const playersBeforeJoin = Object.keys(room.game.state.players).length;

        room.game.addPlayer({
            playerId: socket.id,
            nickname: nickname
        });

        socket.emit('joinSuccess', {
            roomId: roomId,
            gameState: room.game.state
        });

        if (playersBeforeJoin === 1 && Object.keys(room.game.state.players).length === 2) {
            room.game.startNextGame();
            startGameLoop(roomId);
        }

        io.emit('roomList', getRoomList());
    }

    socket.on('disconnect', () => {
        const roomId = socket.data.roomId;
        const disconnectedPlayerId = socket.id;
        if (!roomId || !rooms[roomId]) return;

        const room = rooms[roomId];
        const game = room.game;

        delete room.sockets[disconnectedPlayerId];
        const wasActive = !!game.state.players[disconnectedPlayerId];

        if (wasActive) {
            game.startNextGame(disconnectedPlayerId, true);
        } else {
            game.removePlayer({
                playerId: disconnectedPlayerId
            });
        }

        if (Object.keys(room.sockets).length === 0) {
            clearInterval(room.gameLoopInterval);
            delete rooms[roomId];
        }

        io.emit('roomList', getRoomList());
    });

    socket.on('move-player', (command) => {
        const {
            roomId
        } = command;
        if (rooms[roomId]) {
            const game = rooms[roomId].game;
            game.movePlayer(command);
            socket.to(roomId).emit('updateState', game.state);
        }
    });

    socket.on('send-chat-message', (data) => {
        const {
            text,
            roomId
        } = data;
        const room = rooms[roomId];
        if (!room) return;

        let senderNickname = 'Anônimo';
        const game = room.game;
        const player = game.state.players[socket.id] || game.state.queue.find(p => p.id === socket.id);
        if (player) {
            senderNickname = player.nickname;
        }

        io.to(roomId).emit('new-chat-message', {
            senderId: socket.id,
            senderNickname: senderNickname,
            text: text,
        });
    });

    function startGameLoop(roomId) {
        const room = rooms[roomId];
        if (!room || room.gameLoopInterval) return;

        const game = room.game;
        const gameLoop = () => {
            if (game.state.transition.active) { } else if (Object.keys(game.state.players).length === 2) {
                game.moveBall();
            }
        };
        room.gameLoopInterval = setInterval(gameLoop, 1000 / 60);

        const countdownLoop = () => {
            if (game.state.transition.active) {
                game.tickCountdown();
            }
        };
        setInterval(countdownLoop, 1000);
    }
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`> server running on port ${PORT}`);
});