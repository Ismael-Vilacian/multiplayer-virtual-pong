export default function createKeyboardController(document) {
    const state = {
        observers: [],
        playerId: null
    }

    function registerPlayerId(playerId) {
        state.playerId = playerId
    }

    function subscribe(observerFunction) {
        state.observers.push(observerFunction)
    }

    function notifyAll(command) {
        for (const observerFunction of state.observers) {
            observerFunction(command)
        }
    }

    let animationFrameId;
    let lastUpdateTime = 0;
    const updateInterval = 5;

    const keysPressed = new Set();

    document.addEventListener('keydown', (event) => {
        keysPressed.add(event.key);
        
        if (keysPressed.size === 1) {
            requestAnimationFrame(startMovementLoop);
        }
    });

    document.addEventListener('keyup', (event) => {
        keysPressed.delete(event.key);
        
        if (keysPressed.size === 0) {
            cancelAnimationFrame(animationFrameId);
            lastUpdateTime = 0;
        }
    });

    function startMovementLoop(timestamp) {
        if (!lastUpdateTime) lastUpdateTime = timestamp;
        const deltaTime = timestamp - lastUpdateTime;

        if (deltaTime >= updateInterval) { 
            processMovement();
            lastUpdateTime = timestamp; 
        }

        if (keysPressed.size > 0) {
            animationFrameId = requestAnimationFrame(startMovementLoop);
        }
    }

    function processMovement() {
        keysPressed.forEach((keyPressed) => {
            const command = {
                type: 'move-player',
                playerId: state.playerId,
                keyPressed
            };

            notifyAll(command);
        });
    }

    return {
        subscribe,
        registerPlayerId
    }
}