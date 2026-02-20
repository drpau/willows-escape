// Item System - weighted random item spawning
import { TOTAL_ITEMS, ITEM_SIZE, ITEMS, TILES, PLAYER_SIZE } from './constants.js';

export class ItemSystem {
    constructor(map, totalItems = TOTAL_ITEMS) {
        this.map = map;
        this.totalItems = totalItems;
        this.items = [];
        
        this.generateItems();
    }
    
    generateItems() {
        // Build weighted pool
        const pool = [];
        
        for (const [type, data] of Object.entries(ITEMS)) {
            for (let i = 0; i < data.rarity; i++) {
                pool.push(type);
            }
        }
        
        // Place items
        while (this.items.length < this.totalItems) {
            // Random position - keep within map bounds with padding
            const padding = 100;
            const x = padding + Math.random() * (this.map.width - padding * 2);
            const y = padding + Math.random() * (this.map.height - padding * 2);
            
            // Check if position is valid - ONLY on ground tiles (not solid, not jumpable)
            const tile = this.map.getTileAt(x, y);
            if (tile !== TILES.GROUND) continue; // Only spawn on clear ground
            
            // Not too close to spawn
            const spawnDist = Math.sqrt(
                Math.pow(x - this.map.spawnX, 2) + 
                Math.pow(y - this.map.spawnY, 2)
            );
            if (spawnDist < 150) continue;
            
            // Not too close to other items
            let tooClose = false;
            for (const item of this.items) {
                const dist = Math.sqrt(
                    Math.pow(x - item.x, 2) + 
                    Math.pow(y - item.y, 2)
                );
                if (dist < 60) {
                    tooClose = true;
                    break;
                }
            }
            if (tooClose) continue;
            
            // Select random type from pool
            const type = pool[Math.floor(Math.random() * pool.length)];
            const itemData = ITEMS[type];
            
            this.items.push({
                x,
                y,
                type,
                points: itemData.points,
                color: itemData.color,
                collected: false,
                bounceOffset: 0
            });
        }
    }
    
    update(player, onCollect) {
        // Check collisions with player
        for (const item of this.items) {
            if (item.collected) continue;
            
            const dx = player.x - item.x;
            const dy = player.y - item.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            
            if (dist < PLAYER_SIZE / 2 + ITEM_SIZE / 2) {
                item.collected = true;
                onCollect(item, item.points);
            }
        }
    }
    
    getRemainingCount() {
        return this.items.filter(i => !i.collected).length;
    }
    
    getCollectedCount() {
        return this.items.filter(i => i.collected).length;
    }
}