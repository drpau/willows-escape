// Charlotte AI - the farmer chasing Willow
import { 
    CHARLOTTE_SIZE, CHARLOTTE_BASE_SPEED, CHARLOTTE_MAX_SPEED,
    CHARLOTTE_VISION_ANGLE, CHARLOTTE_VISION_DISTANCE, CHARLOTTE_HEARING_RADIUS,
    SPEED_INCREASE_INTERVAL, SPEED_INCREMENT_SMALL, ITEMS_PER_SPEED_BUMP,
    AI_STATE, TILE_SIZE, TILES, PLAYER_SIZE
} from './constants.js';

export class CharlotteAI {
    constructor(map, player) {
        this.map = map;
        this.player = player;
        
        // Position - spawn in middle of map, NOT near edges
        this.x = map.width / 2;
        this.y = map.height / 2;
        
        // Movement
        this.vx = 0;
        this.vy = 0;
        this.speed = CHARLOTTE_BASE_SPEED;
        this.angle = 0;
        
        // State
        this.state = AI_STATE.WANDER;
        this.stateTimer = 0;
        
        // Pathfinding
        this.path = [];
        this.pathIndex = 0;
        this.lastPathTime = 0;
        
        // Detection
        this.lastKnownPosition = null;
        this.searchTimer = 0;
        
        // Speed scaling
        this.gameTime = 0;
    }
    
    update(dt, map, player) {
        this.gameTime += dt;
        this.player = player;
        
        if (!this.player) return;
        
        // Speed scaling
        this.updateSpeed();
        
        // State machine
        switch (this.state) {
            case AI_STATE.WANDER:
                this.updateWander(dt);
                break;
            case AI_STATE.DETECT:
                this.updateDetect(dt);
                break;
            case AI_STATE.CHASE:
                this.updateChase(dt);
                break;
            case AI_STATE.SEARCH:
                this.updateSearch(dt);
                break;
        }
        
        // Apply movement
        let newX = this.x + this.vx * dt;
        let newY = this.y + this.vy * dt;
        
        // Simple collision check
        if (!this.checkCollision(newX, this.y)) {
            this.x = newX;
        }
        if (!this.checkCollision(this.x, newY)) {
            this.y = newY;
        }
    }
    
    updateSpeed() {
        // Small increase every 10 seconds
        const timeIncrements = Math.floor(this.gameTime / SPEED_INCREASE_INTERVAL);
        this.speed = CHARLOTTE_BASE_SPEED + (timeIncrements * SPEED_INCREMENT_SMALL);
        
        // Clamp to max
        this.speed = Math.min(this.speed, CHARLOTTE_MAX_SPEED);
    }
    
    increaseSpeedForItems(itemsCollected) {
        // Additional speed bump every 10 items
        const itemIncrements = Math.floor(itemsCollected / ITEMS_PER_SPEED_BUMP);
        this.speed += itemIncrements * SPEED_INCREMENT_SMALL;
        this.speed = Math.min(this.speed, CHARLOTTE_MAX_SPEED);
    }
    
    updateWander(dt) {
        // Check for player detection
        if (this.canSeePlayer()) {
            this.state = AI_STATE.DETECT;
            this.stateTimer = 2; // Brief detect state before chase
            return;
        }
        
        if (this.canHearPlayer()) {
            this.state = AI_STATE.DETECT;
            this.stateTimer = 1;
            return;
        }
        
        // Always move toward player (slower when not detecting)
        // This makes her a constant threat
        const dx = this.player.x - this.x;
        const dy = this.player.y - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        if (dist > 0) {
            // Move toward player at 60% speed when wandering
            // but not in straight line - add some unpredictability
            const wanderAngle = Math.atan2(dy, dx) + (Math.random() - 0.5) * 0.5;
            this.angle = wanderAngle;
            this.vx = Math.cos(wanderAngle) * this.speed * 0.6;
            this.vy = Math.sin(wanderAngle) * this.speed * 0.6;
        }
        
        // Keep in bounds
        this.keepInBounds();
    }
    
    updateDetect(dt) {
        this.stateTimer -= dt;
        
        if (this.canSeePlayer()) {
            this.state = AI_STATE.CHASE;
            this.lastKnownPosition = { x: this.player.x, y: this.player.y };
            return;
        }
        
        if (this.stateTimer <= 0) {
            if (this.canHearPlayer() || this.lastKnownPosition) {
                this.state = AI_STATE.SEARCH;
                this.searchTimer = 5;
            } else {
                this.state = AI_STATE.WANDER;
            }
        }
    }
    
    updateChase(dt) {
        if (!this.canSeePlayer()) {
            // Lost sight, remember last position
            if (!this.lastKnownPosition) {
                this.lastKnownPosition = { x: this.player.x, y: this.player.y };
            }
            this.state = AI_STATE.SEARCH;
            this.searchTimer = 5;
            return;
        }
        
        // Update last known
        this.lastKnownPosition = { x: this.player.x, y: this.player.y };
        
        // Move towards player
        const dx = this.player.x - this.x;
        const dy = this.player.y - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        if (dist > 0) {
            this.angle = Math.atan2(dy, dx);
            this.vx = (dx / dist) * this.speed;
            this.vy = (dy / dist) * this.speed;
        }
    }
    
    updateSearch(dt) {
        this.searchTimer -= dt;
        
        // Can see player again?
        if (this.canSeePlayer()) {
            this.state = AI_STATE.CHASE;
            this.lastKnownPosition = { x: this.player.x, y: this.player.y };
            return;
        }
        
        // Go to last known position
        if (this.lastKnownPosition) {
            const dx = this.lastKnownPosition.x - this.x;
            const dy = this.lastKnownPosition.y - this.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            
            if (dist > 10) {
                this.angle = Math.atan2(dy, dx);
                this.vx = (dx / dist) * this.speed * 0.7;
                this.vy = (dy / dist) * this.speed * 0.7;
            } else {
                // Reached last known position
                this.lastKnownPosition = null;
            }
        } else {
            // Wander while searching
            if (Math.random() < 0.05) {
                this.angle += (Math.random() - 0.5);
            }
            this.vx = Math.cos(this.angle) * this.speed * 0.3;
            this.vy = Math.sin(this.angle) * this.speed * 0.3;
        }
        
        if (this.searchTimer <= 0) {
            this.state = AI_STATE.WANDER;
        }
    }
    
    canSeePlayer() {
        if (this.player.isBurrowed) return false;
        
        const dx = this.player.x - this.x;
        const dy = this.player.y - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        // Check distance
        if (dist > CHARLOTTE_VISION_DISTANCE) return false;
        
        // Check angle
        const angleToPlayer = Math.atan2(dy, dx);
        let angleDiff = angleToPlayer - this.angle;
        
        // Normalize angle
        while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
        while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;
        
        if (Math.abs(angleDiff) > CHARLOTTE_VISION_ANGLE * Math.PI / 180) return false;
        
        // Line of sight check (simplified)
        // In a full implementation, would do ray casting
        return true;
    }
    
    canHearPlayer() {
        if (this.player.isBurrowed) return false;
        if (this.player.vx === 0 && this.player.vy === 0) return false;
        
        const dx = this.player.x - this.x;
        const dy = this.player.y - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        return dist < CHARLOTTE_HEARING_RADIUS;
    }
    
    canCatch(player) {
        if (!player) return false;
        if (player.isBurrowed) return false;
        
        const dx = player.x - this.x;
        const dy = player.y - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        return dist < (CHARLOTTE_SIZE / 2 + PLAYER_SIZE / 2);
    }
    
    checkCollision(x, y) {
        const halfSize = CHARLOTTE_SIZE / 2;
        const corners = [
            { x: x - halfSize, y: y - halfSize },
            { x: x + halfSize, y: y - halfSize },
            { x: x - halfSize, y: y + halfSize },
            { x: x + halfSize, y: y + halfSize }
        ];
        
        for (const corner of corners) {
            const tile = this.map.getTileAt(corner.x, corner.y);
            if (tile === TILES.SOLID || tile === TILES.WATER) {
                return true;
            }
        }
        
        return false;
    }
    
    keepInBounds() {
        const halfSize = CHARLOTTE_SIZE;
        if (this.x < halfSize) { this.x = halfSize; this.angle = 0; }
        if (this.x > this.map.width - halfSize) { this.x = this.map.width - halfSize; this.angle = Math.PI; }
        if (this.y < halfSize) { this.y = halfSize; this.angle = Math.PI / 2; }
        if (this.y > this.map.height - halfSize) { this.y = this.map.height - halfSize; this.angle = -Math.PI / 2; }
    }
}