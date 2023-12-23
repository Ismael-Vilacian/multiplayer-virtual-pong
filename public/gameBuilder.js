export default function buildGame() {
    
    function init() {
        const home = document.querySelector('.home');
        home.setAttribute('style', 'display: none');
    
        const game = document.querySelector('.game');
        game.setAttribute('style', 'display: block');
    }

    function renderGame() {
        const home = document.querySelector('.home');
        home.setAttribute('style', 'display: none');
    
        const game = document.querySelector('.game');
        game.setAttribute('style', 'display: block');
    }

    return {
        init, 
        renderGame
    }
}