// Procedural Map Generator
import { MAP_WIDTH, MAP_HEIGHT, TILE_SIZE, TILES } from './constants.js';

export class Map {
    constructor() {
        this.width = MAP_WIDTH;
        this.height = MAP_HEIGHT;
        this.cols = Math.ceil(MAP_WIDTH / TILE_SIZE);
        this.rows = Math.ceil(MAP_HEIGHT / TILE_SIZE);
        
        this.tiles = [];
        this.navGrid = [];
        this.spawnX = 200;
        this.spawnY = 200;
        this.homeBurrow = null;
    }
    
    generate() {
        // Initialize with ground
        this.tiles = Array(this.rows).fill(null).map(() => Array(this.cols).fill(TILES.GROUND));
        
        // Generate procedural farm
        this.generateBarns();
        this.generatePonds();
        this.generateFences();
        this.placeSpawn();
        this.placeHomeBurrow();
        
        // Generate navigation grid for AI
        this.generateNavGrid();
    }
    
    generateBarns() {
        // Place several barns (solid obstacles)
        const numBarns = 8 + Math.floor(Math.random() * 5);
        
        for (let i = 0; i < numBarns; i++) {
            const barnWidth = 3 + Math.floor(Math.random() * 3);
            const barnHeight = 2 + Math.floor(Math.random() * 2);
            
            let x, y;
            let attempts = 0;
            
            // Find valid position
            do {
                x = Math.floor(Math.random() * (this.cols - barnWidth - 4)) + 2;
                y = Math.floor(Math.random() * (this.rows - barnHeight - 4)) + 2;
                attempts++;
            } while (this.isNearSpawn(x, y, 8) && attempts < 50);
            
            // Place barn
            for (let by = y; by < y + barnHeight; by++) {
                for (let bx = x; bx < x + barnWidth; bx++) {
                    this.tiles[by][bx] = TILES.SOLID;
                }
            }
        }
    }
    
    generatePonds() {
        // Place ponds (water - solid but different)
        const numPonds = 3 + Math.floor(Math.random() * 3);
        
        for (let i = 0; i < numPonds; i++) {
            const pondSize = 2 + Math.floor(Math.random() * 3);
            
            let x, y;
            let attempts = 0;
            
            do {
                x = Math.floor(Math.random() * (this.cols - pondSize - 2)) + 1;
                y = Math.floor(Math.random() * (this.rows - pondSize - 2)) + 1;
                attempts++;
            } while (this.isNearSpawn(x, y, 6) && attempts < 30);
            
            // Place pond
            for (let py = y; py < y + pondSize; py++) {
                for (let px = x; px < x + pondSize; px++) {
                    this.tiles[py][px] = TILES.WATER;
                }
            }
        }
    }
    
    generateFences() {
        // Place fences (jumpable obstacles)
        const numFences = 15 + Math.floor(Math.random() * 10);
        
        for (let i = 0; i < numFences; i++) {
            let x, y;
            let attempts = 0;
            
            do {
                x = Math.floor(Math.random() * (this.cols - 2)) + 1;
                y = Math.floor(Math.random() * (this.rows - 2)) + 1;
                attempts++;
            } while (this.isNearSpawn(x, y, 4) && attempts < 20);
            
            // Only place on ground tiles
            if (this.tiles[y][x] !== TILES.GROUND) continue;
            
            // Check that there are no SOLID tiles adjacent (diagonal + straight)
            let nearSolid = false;
            for (let dy = -1; dy <= 1; dy++) {
                for (let dx = -1; dx <= 1; dx++) {
                    if (dx === 0 && dy === 0) continue;
                    const nx = x + dx;
                    const ny = y + dy;
                    if (nx >= 0 && nx < this.cols && ny >= 0 && ny < this.rows) {
                        if (this.tiles[ny][nx] === TILES.SOLID) {
                            nearSolid = true;
                            break;
                        }
                    }
                }
                if (nearSolid) break;
            }
            
            // Don't place jumpable next to solid
            if (nearSolid) continue;
            
            this.tiles[y][x] = TILES.JUMPABLE;
        }
    }
    
    isNearSpawn(tileX, tileY, minDistance) {
        const spawnTileX = Math.floor(this.spawnX / TILE_SIZE);
        const spawnTileY = Math.floor(this.spawnY / TILE_SIZE);
        
        const dx = tileX - spawnTileX;
        const dy = tileY - spawnTileY;
        
        return Math.sqrt(dx * dx + dy * dy) < minDistance;
    }
    
    placeSpawn() {
        // Spawn in top-left area - but ensure it's clear
        this.spawnX = 150;
        this.spawnY = 150;
        
        // Clear area around spawn
        const spawnCol = Math.floor(this.spawnX / TILE_SIZE);
        const spawnRow = Math.floor(this.spawnY / TILE_SIZE);
        for (let y = spawnRow - 2; y <= spawnRow + 2; y++) {
            for (let x = spawnCol - 2; x <= spawnCol + 2; x++) {
                if (y >= 0 && y < this.rows && x >= 0 && x < this.cols) {
                    this.tiles[y][x] = TILES.GROUND;
                }
            }
        }
    }
    
    placeHomeBurrow() {
        // Place home burrow in bottom-right area
        this.homeBurrow = {
            x: this.width - 150,
            y: this.height - 150
        };
        
        // Clear area around home burrow
        const homeCol = Math.floor(this.homeBurrow.x / TILE_SIZE);
        const homeRow = Math.floor(this.homeBurrow.y / TILE_SIZE);
        for (let y = homeRow - 2; y <= homeRow + 2; y++) {
            for (let x = homeCol - 2; x <= homeCol + 2; x++) {
                if (y >= 0 && y < this.rows && x >= 0 && x < this.cols) {
                    this.tiles[y][x] = TILES.GROUND;
                }
            }
        }
    }
    
    generateNavGrid() {
        // Generate navigation grid for AI pathfinding
        this.navGrid = [];
        
        for (let y = 0; y < this.rows; y++) {
            this.navGrid[y] = [];
            for (let x = 0; x < this.cols; x++) {
                const tile = this.tiles[y][x];
                // Water is navigable (AI can path through but slowly)
                // Solid is not navigable
                this.navGrid[y][x] = (tile !== TILES.SOLID) ? 1 : 0;
            }
        }
    }
    
    getTile(col, row) {
        if (col < 0 || col >= this.cols || row < 0 || row >= this.rows) {
            return TILES.SOLID; // Out of bounds is solid
        }
        return this.tiles[row][col];
    }
    
    getTileAt(x, y) {
        const col = Math.floor(x / TILE_SIZE);
        const row = Math.floor(y / TILE_SIZE);
        return this.getTile(col, row);
    }
    
    isWalkable(x, y) {
        const tile = this.getTileAt(x, y);
        return tile !== TILES.SOLID && tile !== TILES.WATER;
    }
    
    isJumpable(x, y) {
        const tile = this.getTileAt(x, y);
        return tile === TILES.JUMPABLE;
    }
}