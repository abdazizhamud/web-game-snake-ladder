
class Player {
    constructor(index, name, piece, button, position) {
        this.index = index;
        this.name = name;
        this.piece = piece;
        this.button = button;
        this.position = position;
        this.scale = 1.0;
    }

    getIndex() {
        return this.index;
    }

    getName() {
        return this.name;
    }

    getPiece() {
        return this.piece;
    }

    getButton() {
        return this.button;
    }

    getPosition() {
        return this.position;
    }

    setIndex(index) {
        this.index = index;
    }

    setname(name) {
        this.name = name;
    }

    setPiece(piece) {
        this.piece = piece;
    }

    setButton(button) {
        this.button = button;
    }

    setPosition(position) {
        this.position = position;
    }

    getScale() {
        return this.scale;
    }

    setScale(scale, boardW = null, boardH = null) {
        this.scale = scale;
        
        const B_width = boardW || (scale * BOARD_SIZE);
        const B_height = boardH || (B_width * 0.5625); // 1080/1920
        
        // Calculate grid tile dimensions
        const tile_width = (B_width * GRID_WIDTH_PCT) / TILES_PER_ROW;
        const tile_height = (B_height * GRID_HEIGHT_PCT) / TILES_PER_ROW;
        
        this.tileWidth = tile_width;
        this.tileHeight = tile_height;
        this.boardSize = B_width;
        this.boardHeight = B_height;

        // Set player size to 80% of smallest tile dimension (a bit smaller than tile)
        const playerSize = Math.round(Math.min(tile_width, tile_height) * 0.80);
        this.piece.style.width = `${playerSize}px`;
        this.piece.style.height = `${playerSize}px`;

        // Set the individual bidak image (no sprite sheet anymore)
        if (typeof BIDAK_IMAGES !== 'undefined' && BIDAK_IMAGES[this.name]) {
            this.piece.style.backgroundImage = `url("${BIDAK_IMAGES[this.name]}")`;
        }
        this.piece.style.backgroundSize = 'contain';
        this.piece.style.backgroundRepeat = 'no-repeat';
        this.piece.style.backgroundPosition = 'center center';

        console.log("UPDATED PLAYER SCALE", scale, "PLAYER SIZE", playerSize, "tile:", tile_width, tile_height);
        this.updatePosition();
    }

    updatePosition() {
        if (this.position > TOTAL_TILES) return;

        // Fallback calculations if setScale hasn't run yet
        const B_width = this.boardSize || (this.scale * BOARD_SIZE);
        const B_height = this.boardHeight || (B_width * 0.5625); // 16:9 aspect ratio (1080/1920)

        const tile_width = this.tileWidth || ((B_width * GRID_WIDTH_PCT) / TILES_PER_ROW);
        const tile_height = this.tileHeight || ((B_height * GRID_HEIGHT_PCT) / TILES_PER_ROW);
        const left_offset = B_width * GRID_MARGIN_LEFT_PCT;
        const bottom_offset = B_height * GRID_MARGIN_BOTTOM_PCT;

        // Check if the position indicator is 0 (haven't entered board yet) — hide the piece
        if (this.position === 0) {
            // Move far off-screen so it's invisible (no pre-board floating piece)
            this.piece.style.left   = `-9999px`;
            this.piece.style.bottom = `-9999px`;
        } else {
            const rowIndex = Math.floor((this.position - 1) / TILES_PER_ROW);
            const colIndex = (this.position - 1) % TILES_PER_ROW;
            
            // Calculate base tile coordinates (accounting for alternate snaking directions)
            const tile_x = left_offset + (rowIndex % 2 === 0 ? colIndex : (TILES_PER_ROW - 1 - colIndex)) * tile_width;
            const tile_y = bottom_offset + rowIndex * tile_height;

            // Calculate centering offset
            const playerSize = Number.parseInt(this.piece.style.width || "0", 10) || Math.round(Math.min(tile_width, tile_height) * 0.80);
            const center_x = tile_x + (tile_width - playerSize) / 2;
            const center_y = tile_y + (tile_height - playerSize) / 2;

            this.piece.style.left   = `${Math.round(center_x)}px`;
            this.piece.style.bottom = `${Math.round(center_y)}px`;
        }
    }
    
}
