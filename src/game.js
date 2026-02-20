// Main Game Controller
import { GAME_STATE, CANVAS_WIDTH, CANVAS_HEIGHT } from './constants.js';
import { Player } from './player.js';
import { Map } from './map.js';
import { Camera } from './camera.js';
import { Renderer } from './renderer.js';
import { ItemSystem } from './items.js';
import { CharlotteAI } from './charlotte.js';
import { UIManager } from './ui.js';
import { AudioManager } from './audio.js';

export class Game {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.state = GAME_STATE.TITLE;
        
        this.lastTime = 0;
        this.accumulator = 0;
        this.fixedTimeStep = 1 / 60;
        
        // Game systems
        this.map = null;
        this.player = null;
        this.camera = null;
        this.renderer = null;
        this.itemSystem = null;
        this.charlotte = null;
        this.ui = null;
        this.audio = null;
        
        // Game data
        this.score = 0;
        this.itemsCollected = 0;
        this.totalItems = 100;
        this.gameTime = 0;
        this.burrowUnlocked = false;
        
        // Input
        this.keys = {};
        
        this.setupInput();
    }
    
    setupInput() {
        window.addEventListener('keydown', (e) => {
            this.keys[e.code] = true;
            if (['Space', 'KeyW', 'KeyA', 'KeyS', 'KeyD', 'KeyB'].includes(e.code)) {
                e.preventDefault();
            }
        });
        
        window.addEventListener('keyup', (e) => {
            this.keys[e.code] = false;
        });
    }
    
    init() {
        // Initialize all game systems
        this.map = new Map();
        this.map.generate();
        
        this.player = new Player(this.map);
        this.camera = new Camera(CANVAS_WIDTH, CANVAS_HEIGHT, this.map.width, this.map.height);
        this.renderer = new Renderer(this.ctx, this.camera);
        this.itemSystem = new ItemSystem(this.map, this.totalItems);
        this.charlotte = new CharlotteAI(this.map, this.player);
        this.ui = new UIManager(this);
        this.audio = new AudioManager();
        
        // Reset game state
        this.score = 0;
        this.itemsCollected = 0;
        this.gameTime = 0;
        this.burrowUnlocked = false;
    }
    
    start() {
        this.init();
        this.state = GAME_STATE.PLAYING;
        this.lastTime = performance.now();
        this.gameLoop(this.lastTime);
    }
    
    gameLoop(currentTime) {
        if (this.state !== GAME_STATE.PLAYING) {
            // Still render for menu backgrounds if renderer exists
            if (this.renderer && this.state !== GAME_STATE.TITLE) {
                this.renderer.render(this);
            }
            requestAnimationFrame((t) => this.gameLoop(t));
            return;
        }
        
        const deltaTime = (currentTime - this.lastTime) / 1000;
        this.lastTime = currentTime;
        
        // Cap delta time to prevent spiral of death
        const cappedDelta = Math.min(deltaTime, 0.1);
        
        this.update(cappedDelta);
        this.renderer.render(this);
        
        requestAnimationFrame((t) => this.gameLoop(t));
    }
    
    update(dt) {
        this.gameTime += dt;
        
        // Update camera to follow player
        this.camera.follow(this.player, dt);
        
        // Update player
        this.player.update(dt, this.keys, this.map, this);
        
        // Update Charlotte AI
        this.charlotte.update(dt, this.map, this.player);
        
        // Check item collection
        this.itemSystem.update(this.player, (item, points) => {
            this.score += points;
            this.itemsCollected++;
            
            // Check win condition
            if (this.itemsCollected >= this.totalItems) {
                this.burrowUnlocked = true;
            }
        });
        
        // Check collision with Charlotte
        if (this.charlotte.canCatch(this.player) && !this.player.isBurrowed) {
            this.gameOver();
        }
        
        // Update UI
        this.ui.updateHUD(this);
    }
    
    gameOver() {
        this.state = GAME_STATE.GAMEOVER;
        this.ui.showGameOver(this.score);
        this.ui.saveScore(this.score);
    }
    
    win() {
        this.state = GAME_STATE.WIN;
        this.ui.showWin(this.score);
        this.ui.saveScore(this.score);
    }
    
    restart() {
        this.start();
    }
}