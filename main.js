// --- Error Display for Mobile ---
// This code adds an error overlay to the screen to help debug on mobile.
// It will catch errors and display them in a textarea for easy copy-pasting.

// Queue for errors that might occur before the DOM is ready.
const errorQueue = [];
let showErrorInUI = (message) => {
    errorQueue.push(message);
    // Also log to console as a fallback
    console.log("Early error (DOM not ready):\n" + message);
};

// When the DOM is loaded, create the UI and process any queued errors.
window.addEventListener('DOMContentLoaded', () => {
    // Create a container for the error display
    const errorContainer = document.createElement('div');
    Object.assign(errorContainer.style, {
        position: 'fixed',
        top: '0',
        left: '0',
        width: '100vw',
        height: '100vh',
        backgroundColor: 'rgba(0,0,0,0.85)',
        color: '#ffcccc',
        zIndex: '9999',
        display: 'none',
        fontFamily: 'monospace',
        fontSize: '14px',
        padding: '10px',
        boxSizing: 'border-box'
    });

    // Create a textarea to hold the error text
    const errorTextarea = document.createElement('textarea');
    Object.assign(errorTextarea.style, {
        width: '100%',
        height: 'calc(100% - 60px)',
        padding: '10px',
        backgroundColor: '#111',
        color: '#ffcccc',
        border: '1px solid #f55',
        borderRadius: '5px',
        whiteSpace: 'pre',
        overflowWrap: 'normal',
        overflow: 'auto',
        fontSize: '12px',
        fontFamily: 'monospace',
        boxSizing: 'border-box'
    });
    errorTextarea.setAttribute('readonly', true);

    // Create a close button
    const closeButton = document.createElement('button');
    closeButton.textContent = 'Close Errors & Reload';
    Object.assign(closeButton.style, {
        display: 'block',
        marginTop: '10px',
        padding: '10px',
        width: '100%',
        backgroundColor: '#552222',
        color: 'white',
        border: 'none',
        borderRadius: '5px',
        cursor: 'pointer',
        fontSize: '16px',
        boxSizing: 'border-box'
    });
    closeButton.onclick = () => window.location.reload();

    errorContainer.appendChild(errorTextarea);
    errorContainer.appendChild(closeButton);
    document.body.appendChild(errorContainer);

    // The real function to show errors, now that the UI is ready.
    showErrorInUI = function(message) {
        errorContainer.style.display = 'block';
        errorTextarea.value += message + '\n\n-----------------\n\n';
        
        // Try to pause the game
        if (window.game && window.game.scene) {
            try {
                window.game.scene.getScenes(true).forEach(scene => scene.scene.pause());
            } catch(e) { /* ignore if it fails */ }
        }
    };
    
    // If there were any errors queued up, display them now.
    if (errorQueue.length > 0) {
        showErrorInUI(errorQueue.join('\n\n-----------------\n\n'));
        errorQueue.length = 0; // Clear queue
    }
});


window.onerror = function(message, source, lineno, colno, error) {
    let errorMessage = `[FATAL: window.onerror]\n\nMessage: ${message}\nSource: ${source}\nLine: ${lineno}, Col: ${colno}`;
    if (error && error.stack) {
        errorMessage += `\n\nStack:\n${error.stack}`;
    }
    showErrorInUI(errorMessage);
    return true; // Prevents default browser error handler
};

window.addEventListener('unhandledrejection', function(event) {
    let reason = event.reason;
    let errorMessage = '[FATAL: Unhandled Promise Rejection]\n\n';
    if (reason && reason.stack) {
        errorMessage += `Stack:\n${reason.stack}`;
    } else {
        try {
            errorMessage += `Reason: ${JSON.stringify(reason, null, 2)}`;
        } catch (e) {
            errorMessage += `Reason: ${reason}`;
        }
    }
    showErrorInUI(errorMessage);
});

if (window.console && console.error) {
    const oldError = console.error;
    console.error = function(...args) {
        let message = args.map(arg => {
            if (arg instanceof Error) {
                return arg.stack;
            }
            if (typeof arg === 'object' && arg !== null) {
                try {
                    return JSON.stringify(arg, null, 2);
                } catch(e) { /* continue */ }
            }
            return String(arg);
        }).join(' ');
        showErrorInUI(`[CONSOLE.ERROR]\n\n${message}`);
        oldError.apply(console, args);
    };
}
// --- End Error Display ---

import './style.css';
import Phaser from 'phaser';

// Import scenes
import PreloadScene from './src/scenes/PreloadScene.js';
import GameScene from './src/scenes/GameScene.js';
import UIScene from './src/scenes/UIScene.js';
import GameOverScene from './src/scenes/GameOverScene.js';

// Game configuration
const config = {
    type: Phaser.AUTO,
    width: 640,
    height: 960,
    parent: 'app',
    backgroundColor: '#1a1a1a',
    scene: [
        PreloadScene,
        GameScene,
        UIScene,
        GameOverScene
    ],
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    }
};

// Create a new game instance and store it on the window for debugging
window.game = new Phaser.Game(config);