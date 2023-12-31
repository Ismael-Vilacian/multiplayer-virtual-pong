export default function buildGame() {
    const state = {
        players: {}
    }
    
    function addPlayer(command) {
        const playerId = command.playerId;
        const nickname = command.nickname;
        const positionX = Object.keys(state.players).length >= 1 ? 732 : 4;

        state.players[playerId] = {
            x: positionX,
            y: 200,
            nickname: nickname
        }
    }

    function setState(newState) {
        Object.assign(state, newState)
    }

    return {
        addPlayer,
        setState,
        state
    }
}