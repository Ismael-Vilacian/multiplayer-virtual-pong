export default function renderScreen(screen, game, requestAnimationFrame, currentPlayerId) {
    const context = screen.getContext('2d');
    context.fillStyle = 'white';
    
    context.clearRect(0, 0, 742, 500);

    for (const playerId in game.state.players) {
        const player = game.state.players[playerId];
        context.fillStyle = '#DDE6ED';
        context.fillRect(player.x, player.y, 5, 70);
    }

    if (game.state.ball) {
        const ball = game.state.ball;
        context.fillStyle = '#FFFFFF';
        context.fillRect(ball.x, ball.y, ball.width, ball.height);
    }

    requestAnimationFrame(() => {
        renderScreen(screen, game, requestAnimationFrame, currentPlayerId);
    });
}