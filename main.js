// --- Error Display for Mobile ---
// This code adds an error overlay to the screen to help debug on mobile.
const errorContainer = document.createElement('div');
Object.assign(errorContainer.style, {
    position: 'fixed',
    top: '10px',
    left: '10px',
    background: 'rgba(40,0,0,0.9)',
    color: '#ffcccc',
    padding: '10px',
    border: '1px solid #f55',
    borderRadius: '5px',
    zIndex: '9999',
    display: 'none',
    maxWidth: 'calc(100vw - 40px)',
    maxHeight: 'calc(100vh - 40px)',
    overflow: 'auto',
    whiteSpace: 'pre-wrap',
    wordWrap: 'break-word',
    fontSize: '12px',
    fontFamily: 'monospace'
});
document.body.appendChild(errorContainer);

function showError(message) {
    errorContainer.style.display = 'block';
    const textNode = document.createTextNode(message + '\n-----------------\n');
    errorContainer.appendChild(textNode);
}

window.onerror = function(message, source, lineno, colno, error) {
    let errorMessage = `[Window Error]\nMessage: ${message}\nSource: ${source}\nLine: ${lineno}, Col: ${colno}`;
    if (error &amp;&amp; error.stack) {
        errorMessage += `\nStack: ${error.stack}`;
    }
    showError(errorMessage);
    return true; // Prevents default browser error handler
};

window.addEventListener('unhandledrejection', function(event) {
    let reason = event.reason;
    let errorMessage = '[Unhandled Promise Rejection]\n';
    if (reason &amp;&amp; reason.stack) {
        errorMessage += `Stack: ${reason.stack}`;
    } else {
        try {
            errorMessage += `Reason: ${JSON.stringify(reason)}`;
        } catch (e) {
            errorMessage += `Reason: ${reason}`;
        }
    }
    showError(errorMessage);
});

if (window.console &amp;&amp; console.error) {
    const oldError = console.error;
    console.error = function(...args) {
        // Phaser sometimes logs errors to console.error, this will catch them.
        let message = args.map(arg => {
            if (arg instanceof Error) {
                return arg.stack;
            }
            if (typeof arg === 'object' &amp;&amp; arg !== null) {
                try {
                    return JSON.stringify(arg, null, 2);
                } catch(e) { /* continue */ }
            }
            return String(arg);
        }).join(' ');
        showError(`[Console Error]\n${message}`);
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

// Create a new game instance
const game = new Phaser.Game(config);