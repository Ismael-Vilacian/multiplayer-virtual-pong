export default function buildGame() {
    const WINNING_SCORE = 7;

    const state = {
        players: {},
        queue: [],
        ball: {
            x: 371,
            y: 250,
            width: 5,
            height: 5,
            velocityX: 0,
            velocityY: 0
        },
        score: {
            1: 0,
            2: 0
        },
        transition: {
            active: false,
            countdown: 5,
            newPlayerNickname: ''
        },
        roomId: null
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
        const {
            playerId,
            nickname
        } = command;

        if (Object.keys(state.players).length < 2) {
            const order = Object.keys(state.players).length === 0 ? 1 : 2;
            const positionX = order === 1 ? 4 : 732;

            state.players[playerId] = {
                order: order,
                x: positionX,
                y: 200,
                nickname: nickname,
                id: playerId
            };
        } else {
            state.queue.push({
                id: playerId,
                nickname: nickname
            });
        }

        notifyAll({
            type: 'updateState',
            ...state
        });
    }

    function removePlayer(command) {
        const {
            playerId
        } = command;
        const wasActive = !!state.players[playerId];

        if (wasActive) {
            delete state.players[playerId];
        } else {
            state.queue = state.queue.filter(p => p.id !== playerId);
        }

        notifyAll({
            type: 'updateState',
            ...state
        });

        return wasActive;
    }

    function startNextGame(loserId = null, isDisconnect = false) {
        state.ball.velocityX = 0;
        state.ball.velocityY = 0;

        if (loserId) {
            const loser = state.players[loserId];
            if (loser) {
                if (!isDisconnect) {
                    state.queue.push({
                        id: loser.id,
                        nickname: loser.nickname
                    });
                }
                delete state.players[loserId];
            }

            if (state.queue.length > 0) {
                const nextPlayerInfo = state.queue.shift();
                const newPlayerOrder = loser ? loser.order : (Object.keys(state.players).length + 1);
                const positionX = newPlayerOrder === 1 ? 4 : 732;

                state.players[nextPlayerInfo.id] = {
                    order: newPlayerOrder,
                    x: positionX,
                    y: 200,
                    id: nextPlayerInfo.id,
                    nickname: nextPlayerInfo.nickname
                };
                state.transition.newPlayerNickname = nextPlayerInfo.nickname;
            }
        }

        if (Object.keys(state.players).length === 2) {
            state.score = {
                1: 0,
                2: 0
            };
            state.transition.active = true;
            state.transition.countdown = 5;
        }

        notifyAll({
            type: 'updateState',
            ...state
        });
        if (state.transition.active) {
            notifyAll({
                type: 'update-game-transition',
                transition: state.transition
            });
        }
    }

    function tickCountdown() {
        if (!state.transition.active) return;
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
        if (state.transition.active || Object.keys(state.players).length < 2) return;

        const {
            ball,
            players
        } = state;

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
            state.score[2]++;
            scored = true;
        } else if (ball.x > 742) {
            state.score[1]++;
            scored = true;
        }

        if (scored) {
            if (state.score[1] >= WINNING_SCORE) {
                startNextGame(player2.id);
            } else if (state.score[2] >= WINNING_SCORE) {
                startNextGame(player1.id);
            } else {
                resetBall();
                notifyAll({
                    type: 'updateState',
                    ...state
                });
            }
        }

        for (const playerId in players) {
            const player = players[playerId];
            if (ball.x < player.x + 5 && ball.x + ball.width > player.x && ball.y < player.y + 70 && ball.y + ball.height > player.y) {
                ball.velocityX = -ball.velocityX * 1.05;
                if (Math.abs(ball.velocityX) > 15) ball.velocityX = Math.sign(ball.velocityX) * 15;
            }
        }
        notifyAll({
            type: 'updateState',
            ...state
        });
    }

    function movePlayer(command) {
        const moves = {
            ArrowUp(p) {
                if (p.y > 0) p.y -= 5;
            },
            ArrowDown(p) {
                if (p.y < 430) p.y += 5;
            }
        };
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