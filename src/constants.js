// Game Constants for Willow's Escape

export const CANVAS_WIDTH = 1920;
export const CANVAS_HEIGHT = 1080;

// Player settings
export const PLAYER_SIZE = 40;
export const PLAYER_SPEED = 300; // pixels per second
export const PLAYER_JUMP_DURATION = 0.4; // seconds
export const PLAYER_BURROW_DURATION = 3; // seconds

// Map settings
export const MAP_WIDTH = 2000; // was 4000
export const MAP_HEIGHT = 1500; // was 3000
export const TILE_SIZE = 64;

// Item settings
export const TOTAL_ITEMS = 100;
export const ITEM_SIZE = 30;

export const ITEMS = {
    apple: { points: 1, color: '#ff4444', rarity: 30, symbol: '🍎' },
    carrot: { points: 2, color: '#ff8c00', rarity: 25, symbol: '🥕' },
    blueberries: { points: 3, color: '#4169e1', rarity: 20, symbol: '🫐' },
    lettuce: { points: 4, color: '#90ee90', rarity: 15, symbol: '🥬' },
    banana: { points: 5, color: '#ffe135', rarity: 10, symbol: '🍌' }
};

// Tile types
export const TILES = {
    GROUND: 0,
    SOLID: 1,
    JUMPABLE: 2,
    WATER: 3,
    BURROW: 4
};

// AI Settings
export const CHARLOTTE_SIZE = 50;
export const CHARLOTTE_BASE_SPEED = 180; // was 120
export const CHARLOTTE_MAX_SPEED = 450; // was 350
export const CHARLOTTE_VISION_ANGLE = 80; // was 60 - wider vision
export const CHARLOTTE_VISION_DISTANCE = 350; // was 300 - see further
export const CHARLOTTE_HEARING_RADIUS = 200; // was 150 - hear better

// Speed scaling
export const SPEED_INCREASE_INTERVAL = 8; // was 10 - faster scaling
export const SPEED_INCREMENT_SMALL = 10; // was 5
export const SPEED_INCREMENT_LARGE = 20; // was 15
export const ITEMS_PER_SPEED_BUMP = 10;

// Game states
export const GAME_STATE = {
    TITLE: 'title',
    PLAYING: 'playing',
    GAMEOVER: 'gamover',
    WIN: 'win'
};

// AI States
export const AI_STATE = {
    WANDER: 'wander',
    DETECT: 'detect',
    CHASE: 'chase',
    SEARCH: 'search'
};

// Colors
export const COLORS = {
    GROUND: '#7cb342',
    GROUND_DARK: '#689f38',
    SOLID_BARN: '#8b4513',
    SOLID_BARN_ROOF: '#a0522d',
    WATER: '#4fc3f7',
    WATER_DARK: '#0288d1',
    JUMPABLE_FENCE: '#deb887',
    JUMPABLE_HEDGE: '#228b22',
    JUMPABLE_HAY: '#daa520',
    PLAYER: '#ffffff',
    PLAYER_BURROW: '#d7ccc8',
    CHARLOTTE: '#ff5722',
    CHARLOTTE_VISION: 'rgba(255, 87, 34, 0.3)',
    CHARLOTTE_ALERT: 'rgba(255, 0, 0, 0.5)'
};