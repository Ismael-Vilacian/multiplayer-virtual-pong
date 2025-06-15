export default function buildGame() {
    const WINNING_SCORE = 7;

    const state = {
        players: {},
        queue: [],
        ball: {
            x: 371, y: 250, width: 5, height: 5,
            velocityX: 0, velocityY: 0 
        },
        score: { 1: 0, 2: 0 },
        transition: {
            active: false,
            countdown: 5,
            newPlayerNickname: ''
        }
    };

    const observers = [];

    function subscribe(observerFunction) {
        observers.push(observerFunction);
    }

    function notifyAll(command) {
        for (const observerFunction of observers) {
            observerFunction(command);
        }
    }
    
    function setState(newState) {
        Object.assign(state, newState);
    }
    
    function addPlayer(command) {
        const { playerId, nickname } = command;

        if (Object.keys(state.players).length < 2) {
            const order = Object.keys(state.players).length === 0 ? 1 : 2;
            const positionX = order === 1 ? 4 : 732;

            state.players[playerId] = {
                order: order,
                x: positionX, y: 200,
                nickname: nickname,
                id: playerId
            };
        } else {
            state.queue.push({ id: playerId, nickname: nickname });
        }

        notifyAll({
            type: 'update-players-and-queue',
            players: state.players,
            queue: state.queue
        });
    }

    function removePlayer(command) {
        const { playerId } = command;
        
        delete state.players[playerId];

        state.queue = state.queue.filter(p => p.id !== playerId);
        
        notifyAll({
            type: 'update-players-and-queue',
            players: state.players,
            queue: state.queue
        });
    }

    function startNextGame(loserId = null) {
        state.ball.velocityX = 0;
        state.ball.velocityY = 0;

        if (loserId && state.queue.length > 0) {
            const loser = Object.values(state.players).find(p => p.id === loserId);
            const nextPlayerInfo = state.queue.shift();

            delete state.players[loserId];
            
            state.queue.push({ id: loser.id, nickname: loser.nickname });

            state.players[nextPlayerInfo.id] = {
                ...loser,
                id: nextPlayerInfo.id,
                nickname: nextPlayerInfo.nickname
            };
            
            state.transition.newPlayerNickname = nextPlayerInfo.nickname;
        }

        state.score = { 1: 0, 2: 0 };
        state.transition.active = true;
        state.transition.countdown = 5;

        notifyAll({
            type: 'update-players-and-queue',
            players: state.players,
            queue: state.queue,
            score: state.score
        });
        
        notifyAll({
            type: 'update-game-transition',
            transition: state.transition
        });
    }
    
    function tickCountdown() {
        state.transition.countdown--;
        
        if (state.transition.countdown <= 0) {
            state.transition.active = false;
            resetBall();
        }
        
        notifyAll({
            type: 'update-game-transition',
            transition: state.transition
        });
    }

    function resetBall() {
        state.ball.x = 371;
        state.ball.y = 250;
        state.ball.velocityX = (Math.random() > 0.5 ? 1 : -1) * 5;
        state.ball.velocityY = (Math.random() > 0.5 ? 1 : -1) * 5;
    }
    
    function moveBall() {
        if (state.transition.active) return;
        
        const { ball, players, score } = state;

        ball.x += ball.velocityX;
        ball.y += ball.velocityY;

        if (ball.y + ball.height > 500 || ball.y < 0) {
            ball.velocityY = -ball.velocityY;
        }

        let player1, player2;
        Object.values(players).forEach(p => {
            if (p.order === 1) player1 = p;
            if (p.order === 2) player2 = p;
        });

        let scored = false;
        if (ball.x + ball.width < 0) {
            score[2]++;
            scored = true;
        } else if (ball.x > 742) {
            score[1]++;
            scored = true;
        }

        if (scored) {
            if (score[1] >= WINNING_SCORE) {
                startNextGame(player2.id);
            } else if (score[2] >= WINNING_SCORE) {
                startNextGame(player1.id);
            } else {
                resetBall();
                notifyAll({ type: 'update-score', score: state.score });
            }
        }

        for (const playerId in players) {
            const player = players[playerId];
            if (ball.x < player.x + 5 && ball.x + ball.width > player.x && ball.y < player.y + 70 && ball.y + ball.height > player.y) {
                ball.velocityX = -ball.velocityX * 1.05;
                if (Math.abs(ball.velocityX) > 15) ball.velocityX = Math.sign(ball.velocityX) * 15;
            }
        }
        
        notifyAll({ type: 'move-ball', ball: state.ball });
    }
    
    function movePlayer(command) {
        notifyAll(command);
        const moves = { ArrowUp(p) { if(p.y>0) p.y-=5; }, ArrowDown(p) { if(p.y<430) p.y+=5; } };
        const player = state.players[command.playerId];
        if (player && moves[command.keyPressed]) {
            moves[command.keyPressed](player);
        }
    }

    return {
        state,
        subscribe,
        setState,
        addPlayer,
        removePlayer,
        movePlayer,
        moveBall,
        tickCountdown,
        startNextGame
    };
}