// Renderer - handles all canvas drawing
import { CANVAS_WIDTH, CANVAS_HEIGHT, TILE_SIZE, TILES, COLORS, PLAYER_SIZE, CHARLOTTE_SIZE } from './constants.js';

export class Renderer {
    constructor(ctx, camera) {
        this.ctx = ctx;
        this.camera = camera;
    }
    
    render(game) {
        // Clear canvas - use a dark border color outside map
        this.ctx.fillStyle = '#1a1a1a';
        this.ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        
        if (!game.map) return;
        
        // Calculate visible area
        const startCol = Math.floor(this.camera.x / TILE_SIZE);
        const endCol = Math.ceil((this.camera.x + CANVAS_WIDTH) / TILE_SIZE);
        const startRow = Math.floor(this.camera.y / TILE_SIZE);
        const endRow = Math.ceil((this.camera.y + CANVAS_HEIGHT) / TILE_SIZE);
        
        // Draw map tiles
        for (let row = startRow; row <= endRow; row++) {
            for (let col = startCol; col <= endCol; col++) {
                this.drawTile(game.map, col, row);
            }
        }
        
        // Draw items (only uncollected ones)
        if (game.itemSystem) {
            game.itemSystem.items.filter(i => !i.collected).forEach(item => {
                if (this.isOnScreen(item.x, item.y)) {
                    this.drawItem(item);
                }
            });
        }
        
        // Draw burrow if unlocked
        if (game.burrowUnlocked && game.map.homeBurrow) {
            this.drawBurrow(game.map.homeBurrow);
        }
        
        // Draw player
        if (game.player && this.isOnScreen(game.player.x, game.player.y)) {
            this.drawPlayer(game.player);
        }
        
        // Draw Charlotte
        if (game.charlotte && this.isOnScreen(game.charlotte.x, game.charlotte.y)) {
            this.drawCharlotte(game.charlotte, game.player);
        }
        
        // Draw particles
        if (game.player && game.player.particles) {
            game.player.particles.forEach(p => this.drawParticle(p));
        }
        
        // Detection flash
        if (game.charlotte && game.charlotte.state === 'chase') {
            this.ctx.fillStyle = 'rgba(255, 0, 0, 0.2)';
            this.ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        }
        
        // Draw mini-map
        this.drawMiniMap(game);
    }
    
    isOnScreen(x, y) {
        return x >= this.camera.x && x < this.camera.x + CANVAS_WIDTH &&
               y >= this.camera.y && y < this.camera.y + CANVAS_HEIGHT;
    }
    
    drawTile(map, col, row) {
        const x = col * TILE_SIZE;
        const y = row * TILE_SIZE;
        const tile = map.getTile(col, row);
        
        // Only draw tiles inside map bounds
        if (col < 0 || col >= map.cols || row < 0 || row >= map.rows) return;
        
        // Only draw visible tiles
        if (!this.isOnScreen(x + TILE_SIZE, y + TILE_SIZE)) return;
        
        switch (tile) {
            case TILES.GROUND:
                // Simple grass - less intense
                this.ctx.fillStyle = ((col + row) % 2 === 0) ? '#7cb342' : '#8bc34a';
                this.ctx.fillRect(x - this.camera.x, y - this.camera.y, TILE_SIZE, TILE_SIZE);
                break;
                
            case TILES.SOLID:
                // Draw barn - better looking
                // Main body
                this.ctx.fillStyle = '#8b4513';
                this.ctx.fillRect(x - this.camera.x + 4, y - this.camera.y + 15, TILE_SIZE - 8, TILE_SIZE - 20);
                // Roof
                this.ctx.fillStyle = '#a0522d';
                this.ctx.beginPath();
                this.ctx.moveTo(x - this.camera.x - 4, y - this.camera.y + 15);
                this.ctx.lineTo(x - this.camera.x + TILE_SIZE / 2, y - this.camera.y);
                this.ctx.lineTo(x - this.camera.x + TILE_SIZE + 4, y - this.camera.y + 15);
                this.ctx.fill();
                // Door
                this.ctx.fillStyle = '#5d3a1a';
                this.ctx.fillRect(x - this.camera.x + 20, y - this.camera.y + 35, 24, 30);
                break;
                
            case TILES.JUMPABLE:
                // Draw fence - better looking
                this.ctx.fillStyle = '#deb887';
                // Horizontal rails
                this.ctx.fillRect(x - this.camera.x + 2, y - this.camera.y + 20, TILE_SIZE - 4, 8);
                this.ctx.fillRect(x - this.camera.x + 2, y - this.camera.y + 40, TILE_SIZE - 4, 8);
                // Posts
                this.ctx.fillStyle = '#8b7355';
                this.ctx.fillRect(x - this.camera.x + 4, y - this.camera.y + 10, 8, TILE_SIZE - 15);
                this.ctx.fillRect(x - this.camera.x + TILE_SIZE - 12, y - this.camera.y + 10, 8, TILE_SIZE - 15);
                this.ctx.fillRect(x - this.camera.x + TILE_SIZE / 2 - 4, y - this.camera.y + 10, 8, TILE_SIZE - 15);
                break;
                
            case TILES.WATER:
                // Draw pond - better looking
                this.ctx.fillStyle = '#4fc3f7';
                this.ctx.beginPath();
                this.ctx.ellipse(
                    x - this.camera.x + TILE_SIZE / 2,
                    y - this.camera.y + TILE_SIZE / 2,
                    TILE_SIZE / 2 - 2,
                    TILE_SIZE / 2 - 4,
                    0, 0, Math.PI * 2
                );
                this.ctx.fill();
                // Water ripple
                this.ctx.strokeStyle = '#81d4fa';
                this.ctx.lineWidth = 2;
                this.ctx.beginPath();
                this.ctx.ellipse(
                    x - this.camera.x + TILE_SIZE / 2 + 5,
                    y - this.camera.y + TILE_SIZE / 2 - 5,
                    10, 6, 0.3, 0, Math.PI * 2
                );
                this.ctx.stroke();
                break;
        }
    }
    
    drawPlayer(player) {
        const screenX = player.x - this.camera.x;
        const screenY = player.y - this.camera.y;
        
        if (player.isBurrowed) {
            // Burrowed appearance - just a mound
            this.ctx.fillStyle = COLORS.PLAYER_BURROW;
            this.ctx.beginPath();
            this.ctx.ellipse(screenX, screenY + 10, PLAYER_SIZE / 2, PLAYER_SIZE / 3, 0, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.font = '20px Arial';
            this.ctx.fillStyle = '#fff';
            this.ctx.textAlign = 'center';
            this.ctx.fillText('🐰', screenX, screenY);
            return;
        }
        
        // Glow effect to make player stand out
        this.ctx.shadowColor = '#ffffff';
        this.ctx.shadowBlur = 15;
        
        // Draw rabbit emoji
        this.ctx.font = '44px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText('🐰', screenX, screenY);
        
        // Reset shadow
        this.ctx.shadowBlur = 0;
        
        // Jump shadow
        if (player.isJumping) {
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
            this.ctx.beginPath();
            this.ctx.ellipse(screenX, screenY + 25, PLAYER_SIZE / 2, 8, 0, 0, Math.PI * 2);
            this.ctx.fill();
        }
    }
    
    drawCharlotte(charLotte, player) {
        const screenX = charLotte.x - this.camera.x;
        const screenY = charLotte.y - this.camera.y;
        
        // Draw vision cone if player is nearby
        if (charLotte.state === 'chase' || charLotte.state === 'detect') {
            this.ctx.fillStyle = COLORS.CHARLOTTE_VISION;
            this.ctx.beginPath();
            this.ctx.moveTo(screenX, screenY);
            this.ctx.arc(screenX, screenY, 200, 
                charLotte.angle - Math.PI / 6, 
                charLotte.angle + Math.PI / 6);
            this.ctx.closePath();
            this.ctx.fill();
        }
        
        // Glow effect to make Charlotte stand out
        this.ctx.shadowColor = '#ff0000';
        this.ctx.shadowBlur = 10;
        
        // Draw farmer emoji
        this.ctx.font = charLotte.state === 'chase' ? '54px Arial' : '48px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText('👩‍🌾', screenX, screenY);
        
        // Reset shadow
        this.ctx.shadowBlur = 0;
    }
    
    drawItem(item) {
        const screenX = item.x - this.camera.x;
        const screenY = item.y - this.camera.y;
        
        // Bounce animation
        const bounce = Math.sin(Date.now() / 200 + item.x) * 3;
        
        // Draw glow behind item
        this.ctx.shadowColor = '#ffffff';
        this.ctx.shadowBlur = 20;
        
        // Use emoji for clear item identification
        this.ctx.font = '32px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        
        const emojiMap = {
            apple: '🍎',
            carrot: '🥕',
            blueberries: '🫐',
            lettuce: '🥬',
            banana: '🍌'
        };
        
        const emoji = emojiMap[item.type] || '⭐';
        this.ctx.fillText(emoji, screenX, screenY + bounce);
        
        // Reset shadow
        this.ctx.shadowBlur = 0;
    }
    
    drawBurrow(burrow) {
        const screenX = burrow.x - this.camera.x;
        const screenY = burrow.y - this.camera.y;
        
        // Burrow entrance - dark hole
        this.ctx.fillStyle = '#3e2723';
        this.ctx.beginPath();
        this.ctx.ellipse(screenX, screenY, 30, 20, 0, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Glow effect to show it's active
        this.ctx.strokeStyle = '#76ff03';
        this.ctx.lineWidth = 3;
        this.ctx.beginPath();
        this.ctx.ellipse(screenX, screenY, 35, 25, 0, 0, Math.PI * 2);
        this.ctx.stroke();
        
        // Label
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = 'bold 14px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('HOME', screenX, screenY + 40);
    }
    
    drawParticle(particle) {
        const screenX = particle.x - this.camera.x;
        const screenY = particle.y - this.camera.y;
        
        this.ctx.fillStyle = particle.color;
        this.ctx.globalAlpha = particle.life;
        this.ctx.beginPath();
        this.ctx.arc(screenX, screenY, particle.size, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.globalAlpha = 1;
    }
    
    drawMiniMap(game) {
        const mapWidth = 200;
        const mapHeight = 150;
        const scaleX = mapWidth / game.map.width;
        const scaleY = mapHeight / game.map.height;
        
        // Background
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        this.ctx.fillRect(CANVAS_WIDTH - mapWidth - 20, 20, mapWidth, mapHeight);
        
        // Map outline
        this.ctx.strokeStyle = '#ffffff';
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(CANVAS_WIDTH - mapWidth - 20, 20, mapWidth, mapHeight);
        
        // Player dot
        const playerX = CANVAS_WIDTH - mapWidth - 20 + game.player.x * scaleX;
        const playerY = 20 + game.player.y * scaleY;
        this.ctx.fillStyle = '#ffffff';
        this.ctx.beginPath();
        this.ctx.arc(playerX, playerY, 4, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Charlotte dot
        const charX = CANVAS_WIDTH - mapWidth - 20 + game.charlotte.x * scaleX;
        const charY = 20 + game.charlotte.y * scaleY;
        this.ctx.fillStyle = '#ff5722';
        this.ctx.beginPath();
        this.ctx.arc(charX, charY, 4, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Items as small dots
        this.ctx.fillStyle = '#ffd700';
        game.itemSystem.items.forEach(item => {
            const itemX = CANVAS_WIDTH - mapWidth - 20 + item.x * scaleX;
            const itemY = 20 + item.y * scaleY;
            this.ctx.fillRect(itemX - 1, itemY - 1, 2, 2);
        });
    }
}