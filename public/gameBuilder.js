export default function buildGame() {
    const state = {
        order: 1,
        players: {}
    }

    function addPlayer(command) {
        
        if (Object.keys(state.players).length == 1) {
            const order = Object.values(state.players)[0].order;
            state.order = order == 1 ? 2 : 1;
        }
        else { 
            state.order = 1; 
        }

        const playerId = command.playerId;
        const nickname = command.nickname;
        const positionX = state.order == 2 ? 732 : 4;

        state.players[playerId] = {
            x: positionX,
            y: 200,
            nickname: nickname,
            order: state.order
        }

        notifyAll({
            type: 'add-player',
            playerId: playerId,
            nickname: nickname,
            playerX: positionX,
            playerY: 200
        });
    }

    function removePlayer(command) {

        const playerId = command.playerId;
        delete state.players[playerId];

        notifyAll({
            type: 'remove-player',
            playerId: playerId
        })
    }

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

    return {
        addPlayer,
        setState,
        removePlayer,
        subscribe,
        notifyAll,
        state,
    }
}