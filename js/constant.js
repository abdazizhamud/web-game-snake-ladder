// ── Board image ─────────────────────────────────────────────────────────
const GAME_BOARD_BG_03 = "./img/PapanFull.png";
const BOARD_SIZE = 1920;           // nominal image width (px)
const TILES_PER_ROW = 6;
const TOTAL_TILES = TILES_PER_ROW * TILES_PER_ROW;  // 36

// ── Grid position constants ──────────────────────────────────────────────
//
//  Measured directly from PapanFull.png (1920×1080) via pixel scanning:
//
//    Grid left edge   → x = 625px  → 625/1920  = 0.3255
//    Grid right edge  → x = 1294px → grid_width = 669px → 669/1920 = 0.3484
//    Grid top (row 6) → y = 200px  (from image top)
//    Grid bottom (row 1) → y = 880px (from image top)
//    Grid height = 680px → 680/1080 = 0.6296
//    Bottom offset from image bottom = (1080-880)/1080 = 0.1852
//
//    tile_width  = 669/6 ≈ 111.5px  (at 1920px)
//    tile_height = 680/6 ≈ 113.3px  (at 1080px)
//
const GRID_MARGIN_LEFT_PCT = 0.3255;  // left edge of grid  / boardWrapper width
const GRID_MARGIN_BOTTOM_PCT = 0.1852;  // bottom edge of grid from bottom / boardWrapper height
const GRID_WIDTH_PCT = 0.3484;  // total grid width   / boardWrapper width
const GRID_HEIGHT_PCT = 0.6296;  // total grid height  / boardWrapper height

// ── Snake and Ladder positions for PapanFull board ──────────────────────
const SNAKES_AND_LADDERS_03 = {
    // Ladders (go UP)
    12: 23,
    17: 21,
    19: 32,
    // Snakes (go DOWN)
    18: 5,
    35: 28,
};

// ── Player piece image paths ─────────────────────────────────────────────
const BIDAK_IMAGES = {
    red: "./img/bidakA.png",
    green: "./img/bidakB.png",
    blue: "./img/bidakC.png",
    yellow: "./img/bidakD.png",
    computer: "./img/bidakA.png",
};

// ── Bomb squares ─────────────────────────────────────────────────────────
const BOMB_SQUARES = [33, 30, 26, 15];

// ── Legacy / unused ──────────────────────────────────────────────────────
const GAME_BOARD_BG_01 = "./img/bg.jpg";
const GAME_BOARD_BG_02 = "./img/Frame 26(2).png";
const TILE_SIZE = BOARD_SIZE / TILES_PER_ROW;
const SNAKES_AND_LADDERS_01 = {};
const SNAKES_AND_LADDERS_02 = {};
