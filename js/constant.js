const GAME_BOARD_BG_01 = "./img/bg.jpg";
const BOARD_SIZE = 1920;
const TILES_PER_ROW = 6;
const TOTAL_TILES = TILES_PER_ROW * TILES_PER_ROW;
const TILE_SIZE = BOARD_SIZE / TILES_PER_ROW;

// Active grid percentages (measured from PapanFull.png coordinates)
// PapanFull.png is 1920x1080 (16:9)
// Board grid area: left~462px, right~988px, top~145px, bottom~710px
const GRID_MARGIN_LEFT_PCT = 0.2406;   // 462/1920
const GRID_MARGIN_BOTTOM_PCT = 0.3426;  // (1080-710)/1080
const GRID_WIDTH_PCT = 0.2740;          // (988-462)/1920
const GRID_HEIGHT_PCT = 0.5231;         // (710-145)/1080

// New bidak (piece) image paths
const BIDAK_IMAGES = {
    red: "./img/bidakA.png",
    green: "./img/bidakB.png",
    blue: "./img/bidakC.png",
    yellow: "./img/bidakD.png",
    computer: "./img/bidakA.png"
};

// Bomb squares
const BOMB_SQUARES = [33, 30, 26, 15];
const SNAKES_AND_LADDERS_01 = {
    1: 38,
    4: 14,
    8: 30,
    21: 42,
    28: 76,
    32: 10,
    36: 6,
    48: 26,
    50: 67,
    62: 18,
    71: 92,
    80: 99,
    88: 24,
    95: 56,
    97: 78
};


const GAME_BOARD_BG_02 = "./img/Frame 26(2).png";
const SNAKES_AND_LADDERS_02 = {
    5: 58,
    14: 49,
    38: 20,
    51: 10,
    53: 72,
    64: 83,
    76: 54,
    91: 73,
    97: 61
};

const GAME_BOARD_BG_03 = "./img/PapanFull.png";

const SNAKES_AND_LADDERS_03 = {
    12:23,
    17:21,
    19:32,
    18:5,
    35:28,
}
