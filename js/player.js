
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

    setScale(scale) {
        this.scale = scale;
        
        // Calculate actual board width/height
        const B_size = scale * BOARD_SIZE;
        
        // Calculate grid tile dimensions
        const tile_width = (B_size * GRID_WIDTH_PCT) / TILES_PER_ROW;
        const tile_height = (B_size * GRID_HEIGHT_PCT) / TILES_PER_ROW;
        
        this.tileWidth = tile_width;
        this.tileHeight = tile_height;
        this.boardSize = B_size;

        // Set player size to 60% of tile width
        const playerSize = Math.round(tile_width * 0.60);
        this.piece.style.width = `${playerSize}px`;
        this.piece.style.height = `${playerSize}px`;

        // Calculate and apply background sprite sheet sizing and offsets dynamically
        const bgWidth = playerSize * 3.9;
        const bgHeight = playerSize * 2.4;
        this.piece.style.backgroundSize = `${bgWidth}px ${bgHeight}px`;

        let posX = 0;
        let posY = 0;
        if (this.name === "red") {
            posX = 0;
            posY = -1.4 * playerSize;
        } else if (this.name === "green") {
            posX = -1.4 * playerSize;
            posY = -1.4 * playerSize;
        } else if (this.name === "blue") {
            posX = -2.9 * playerSize;
            posY = 0;
        } else if (this.name === "yellow") {
            posX = -2.88 * playerSize;
            posY = -1.4 * playerSize;
        } else if (this.name === "computer") {
            posX = 0;
            posY = 0;
        }
        this.piece.style.backgroundPosition = `${posX}px ${posY}px`;

        console.log("UPDATED PLAYER SCALE", scale, "PLAYER SIZE", playerSize);
        this.updatePosition();
    }

    updatePosition() {
        if (this.position > TOTAL_TILES) return;

        // Fallback calculations if setScale hasn't run yet
        const B_size = this.boardSize || (this.scale * BOARD_SIZE);
        const tile_width = this.tileWidth || ((B_size * GRID_WIDTH_PCT) / TILES_PER_ROW);
        const tile_height = this.tileHeight || ((B_size * GRID_HEIGHT_PCT) / TILES_PER_ROW);
        const left_offset = B_size * GRID_MARGIN_LEFT_PCT;
        const bottom_offset = B_size * GRID_MARGIN_BOTTOM_PCT;

        // Check if the position indicator is 0
        if (this.position === 0) {
            // Set the vertical position of the player element - align with control buttons (scaled dynamically)
            this.piece.style.bottom = `${Math.round(-90 * this.scale)}px`;
            // Set the horizontal position based on player type - shifted slightly to be centered under the board
            this.piece.style.left = `${Math.round(B_size * 0.05 + this.index * tile_width * 0.55)}px`;
        } else {
            const rowIndex = Math.floor((this.position - 1) / TILES_PER_ROW);
            const colIndex = (this.position - 1) % TILES_PER_ROW;
            
            // Calculate base tile coordinates (accounting for alternate snaking directions)
            const tile_x = left_offset + (rowIndex % 2 === 0 ? colIndex : (TILES_PER_ROW - 1 - colIndex)) * tile_width;
            const tile_y = bottom_offset + rowIndex * tile_height;

            // Calculate centering offset
            const playerSize = Number.parseInt(this.piece.style.width || "0", 10) || Math.round(tile_width * 0.60);
            const center_x = tile_x + (tile_width - playerSize) / 2;
            const center_y = tile_y + (tile_height - playerSize) / 2;

            this.piece.style.left = `${Math.round(center_x)}px`;
            this.piece.style.bottom = `${Math.round(center_y)}px`;
        }
    }
    
}
