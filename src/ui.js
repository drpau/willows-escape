// UI Manager - handles all UI interactions
import { GAME_STATE } from './constants.js';

export class UIManager {
    constructor(game) {
        this.game = game;
        
        // DOM elements
        this.screens = {
            title: document.getElementById('title-screen'),
            instructions: document.getElementById('instructions-screen'),
            gameover: document.getElementById('gameover-screen'),
            win: document.getElementById('win-screen'),
            leaderboard: document.getElementById('leaderboard-screen')
        };
        
        this.hud = {
            score: document.getElementById('score'),
            items: document.getElementById('items'),
            timer: document.getElementById('timer'),
            alert: document.getElementById('alert-indicator')
        };
        
        this.setupButtons();
    }
    
    setupButtons() {
        // Title screen buttons
        document.getElementById('btn-play').addEventListener('click', () => {
            this.hideAll();
            this.game.start();
        });
        
        document.getElementById('btn-instructions').addEventListener('click', () => {
            this.showScreen('instructions');
        });
        
        document.getElementById('btn-leaderboard').addEventListener('click', () => {
            this.showLeaderboard();
            this.showScreen('leaderboard');
        });
        
        // Instructions back button
        document.getElementById('btn-back').addEventListener('click', () => {
            this.showScreen('title');
        });
        
        // Restart buttons
        document.getElementById('btn-restart').addEventListener('click', () => {
            this.hideAll();
            this.game.restart();
        });
        
        document.getElementById('btn-play-again').addEventListener('click', () => {
            this.hideAll();
            this.game.restart();
        });
        
        // Leaderboard back
        document.getElementById('btn-leaderboard-back').addEventListener('click', () => {
            this.showScreen('title');
        });
    }
    
    showScreen(name) {
        this.hideAll();
        if (this.screens[name]) {
            this.screens[name].classList.add('active');
        }
    }
    
    hideAll() {
        Object.values(this.screens).forEach(screen => {
            screen.classList.remove('active');
        });
    }
    
    updateHUD(game) {
        if (!game) return;
        
        // Update score
        this.hud.score.textContent = game.score;
        
        // Update items
        this.hud.items.textContent = `${game.itemsCollected}`;
        
        // Update timer
        const minutes = Math.floor(game.gameTime / 60);
        const seconds = Math.floor(game.gameTime % 60);
        this.hud.timer.textContent = 
            `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        
        // Alert indicator
        if (game.charlotte && 
            (game.charlotte.state === 'chase' || game.charlotte.state === 'detect')) {
            this.hud.alert.classList.add('active');
        } else {
            this.hud.alert.classList.remove('active');
        }
    }
    
    showGameOver(score) {
        document.getElementById('final-score').textContent = score;
        this.showScreen('gameover');
    }
    
    showWin(score) {
        document.getElementById('win-score').textContent = score;
        this.showScreen('win');
    }
    
    showLeaderboard() {
        const scores = this.getScores();
        const list = document.getElementById('leaderboard-list');
        list.innerHTML = '';
        
        if (scores.length === 0) {
            list.innerHTML = '<li>No scores yet!</li>';
            return;
        }
        
        scores.slice(0, 10).forEach((entry, index) => {
            const li = document.createElement('li');
            li.textContent = `${entry.score} - ${entry.date}`;
            list.appendChild(li);
        });
    }
    
    saveScore(score) {
        const scores = this.getScores();
        const date = new Date().toLocaleDateString();
        scores.push({ score, date });
        
        // Sort by score descending
        scores.sort((a, b) => b.score - a.score);
        
        // Keep top 10
        const top10 = scores.slice(0, 10);
        
        localStorage.setItem('willowsEscape_scores', JSON.stringify(top10));
    }
    
    getScores() {
        try {
            const stored = localStorage.getItem('willowsEscape_scores');
            return stored ? JSON.parse(stored) : [];
        } catch {
            return [];
        }
    }
}