// Camera - follows the player
export class Camera {
    constructor(width, height, mapWidth, mapHeight) {
        this.width = width;
        this.height = height;
        this.mapWidth = mapWidth;
        this.mapHeight = mapHeight;
        
        this.x = 0;
        this.y = 0;
        
        // Smooth camera settings
        this.smoothing = 0.1;
    }
    
    follow(target, dt) {
        if (!target) return;
        
        // Target position (center camera on target)
        const targetX = target.x - this.width / 2;
        const targetY = target.y - this.height / 2;
        
        // Smooth interpolation
        this.x += (targetX - this.x) * this.smoothing;
        this.y += (targetY - this.y) * this.smoothing;
        
        // Clamp to map bounds
        this.x = Math.max(0, Math.min(this.x, this.mapWidth - this.width));
        this.y = Math.max(0, Math.min(this.y, this.mapHeight - this.height));
    }
    
    // Instantly snap to position (for game start)
    snapTo(x, y) {
        this.x = Math.max(0, Math.min(x, this.mapWidth - this.width));
        this.y = Math.max(0, Math.min(y, this.mapHeight - this.height));
    }
}