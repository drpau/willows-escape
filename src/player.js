// Player Controller
import { PLAYER_SIZE, PLAYER_SPEED, PLAYER_JUMP_DURATION, PLAYER_BURROW_DURATION, TILES } from './constants.js';

export class Player {
    constructor(map) {
        this.map = map;
        
        // Position (center of player)
        this.x = map.spawnX;
        this.y = map.spawnY;
        
        // Movement
        this.vx = 0;
        this.vy = 0;
        this.speed = PLAYER_SPEED;
        
        // State
        this.isJumping = false;
        this.jumpTimer = 0;
        this.jumpDuration = PLAYER_JUMP_DURATION;
        
        this.isBurrowed = false;
        this.burrowTimer = 0;
        this.burrowDuration = PLAYER_BURROW_DURATION;
        
        // Direction (for rendering)
        this.facingRight = true;
        
        // Particles
        this.particles = [];
        
        // Animation
        this.animTimer = 0;
    }
    
    update(dt, keys, map, game) {
        // Handle burrow timer
        if (this.isBurrowed) {
            this.burrowTimer -= dt;
            if (this.burrowTimer <= 0) {
                this.exitBurrow();
            }
            return; // Can't move while burrowed
        }
        
        // Handle jump
        if (this.isJumping) {
            this.jumpTimer -= dt;
            if (this.jumpTimer <= 0) {
                this.isJumping = false;
            }
        }
        
        // Input handling
        this.vx = 0;
        this.vy = 0;
        
        if (keys['KeyW'] || keys['ArrowUp']) {
            this.vy = -this.speed;
        }
        if (keys['KeyS'] || keys['ArrowDown']) {
            this.vy = this.speed;
        }
        if (keys['KeyA'] || keys['ArrowLeft']) {
            this.vx = -this.speed;
            this.facingRight = false;
        }
        if (keys['KeyD'] || keys['ArrowRight']) {
            this.vx = this.speed;
            this.facingRight = true;
        }
        
        // Jump (only works if NOT on jumpable tile - must be on ground)
        if ((keys['Space'] || keys['KeyK']) && !this.isJumping) {
            // Can only jump if on ground (not on jumpable tile)
            const currentTile = map.getTileAt(this.x, this.y);
            if (currentTile !== TILES.JUMPABLE) {
                this.startJump();
            }
        }
        
        // Burrow
        if ((keys['KeyB'] || keys['KeyL']) && !this.isJumping) {
            this.tryBurrow(map);
        }
        
        // Normalize diagonal movement
        if (this.vx !== 0 && this.vy !== 0) {
            const factor = 1 / Math.sqrt(2);
            this.vx *= factor;
            this.vy *= factor;
        }
        
        // Apply velocity
        let newX = this.x + this.vx * dt;
        let newY = this.y + this.vy * dt;
        
        // Collision detection - check ALL tile types including jumpable when NOT jumping
        if (!this.isJumping) {
            // Check X movement - solid and jumpable block movement when not jumping
            if (!this.checkCollision(newX, this.y, map, true)) {
                this.x = newX;
            }
            
            // Check Y movement
            if (!this.checkCollision(this.x, newY, map, true)) {
                this.y = newY;
            }
        } else {
            // Can jump OVER jumpable but NOT solid or water
            this.x = newX;
            this.y = newY;
        }
        
        // Create movement particles
        if ((this.vx !== 0 || this.vy !== 0) && Math.random() < 0.1) {
            this.createDustParticle();
        }
        
        // Update particles
        this.updateParticles(dt);
        
        // Check if over home burrow (win condition)
        if (game.burrowUnlocked && map.homeBurrow) {
            const dx = this.x - map.homeBurrow.x;
            const dy = this.y - map.homeBurrow.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 40) {
                game.win();
            }
        }
    }
    
    checkCollision(x, y, map, includeJumpable) {
        // Check the four corners of the player
        const halfSize = PLAYER_SIZE / 2 - 5;
        const corners = [
            { x: x - halfSize, y: y - halfSize },
            { x: x + halfSize, y: y - halfSize },
            { x: x - halfSize, y: y + halfSize },
            { x: x + halfSize, y: y + halfSize }
        ];
        
        for (const corner of corners) {
            const tile = map.getTileAt(corner.x, corner.y);
            if (tile === TILES.SOLID || tile === TILES.WATER) {
                return true;
            }
            // Jumpable tiles block movement when not jumping
            if (includeJumpable && tile === TILES.JUMPABLE) {
                return true;
            }
        }
        
        return false;
    }
    
    startJump() {
        this.isJumping = true;
        this.jumpTimer = this.jumpDuration;
        
        // Jump particles
        for (let i = 0; i < 5; i++) {
            this.createDustParticle();
        }
    }
    
    tryBurrow(map) {
        // Can only burrow on ground (not on solid or water)
        const currentTile = map.getTileAt(this.x, this.y);
        if (currentTile === TILES.GROUND) {
            this.isBurrowed = true;
            this.burrowTimer = this.burrowDuration;
            this.vx = 0;
            this.vy = 0;
        }
    }
    
    exitBurrow() {
        this.isBurrowed = false;
        this.burrowTimer = 0;
    }
    
    createDustParticle() {
        this.particles.push({
            x: this.x + (Math.random() - 0.5) * 20,
            y: this.y + PLAYER_SIZE / 2,
            vx: (Math.random() - 0.5) * 50,
            vy: -Math.random() * 30,
            size: Math.random() * 4 + 2,
            color: '#d7ccc8',
            life: 1
        });
    }
    
    updateParticles(dt) {
        this.particles = this.particles.filter(p => {
            p.x += p.vx * dt;
            p.y += p.vy * dt;
            p.vy += 100 * dt; // gravity
            p.life -= dt * 2;
            p.size *= 0.98;
            return p.life > 0;
        });
    }
}