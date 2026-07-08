
class Player {
    constructor(index, name, piece, button, position) {
        this.index    = index;
        this.name     = name;
        this.piece    = piece;
        this.button   = button;
        this.position = position;
        this.scale    = 1.0;
        this.tileWidth  = 0;
        this.tileHeight = 0;
        this.boardSize  = 0;
    }

    getIndex()  { return this.index;  }
    getName()   { return this.name;   }
    getPiece()  { return this.piece;  }
    getButton() { return this.button; }
    getPosition(){ return this.position; }
    getScale()  { return this.scale;  }

    setIndex(i)    { this.index    = i; }
    setname(n)     { this.name     = n; }
    setPiece(p)    { this.piece    = p; }
    setButton(b)   { this.button   = b; }
    setPosition(p) { this.position = p; }

    /**
     * Called whenever the board is resized.
     * scale = boardWrapper.clientWidth / BOARD_SIZE (1920)
     */
    setScale(scale) {
        this.scale = scale;

        // Actual rendered dimensions of the full 16:9 image
        const B_width  = scale * BOARD_SIZE;          // = boardWrapper.clientWidth
        const B_height = B_width * (9 / 16);          // = boardWrapper.clientHeight

        // Tile dimensions in pixels
        const tile_width  = (B_width  * GRID_WIDTH_PCT)  / TILES_PER_ROW;
        const tile_height = (B_height * GRID_HEIGHT_PCT) / TILES_PER_ROW;

        this.tileWidth  = tile_width;
        this.tileHeight = tile_height;
        this.boardSize  = B_width;

        // Piece = 88% of smallest tile dimension, centered in tile
        const playerSize = Math.round(Math.min(tile_width, tile_height) * 0.88);
        this.piece.style.width  = `${playerSize}px`;
        this.piece.style.height = `${playerSize}px`;

        // Set individual bidak image
        if (typeof BIDAK_IMAGES !== 'undefined' && BIDAK_IMAGES[this.name]) {
            this.piece.style.backgroundImage = `url("${BIDAK_IMAGES[this.name]}")`;
        }
        this.piece.style.backgroundSize     = 'contain';
        this.piece.style.backgroundRepeat   = 'no-repeat';
        this.piece.style.backgroundPosition = 'center center';

        this.updatePosition();
    }

    /**
     * Position the piece absolutely inside #gameBoard based on this.position.
     * Coordinates use (left, bottom) — bottom=0 means at bottom of gameBoard.
     */
    updatePosition() {
        if (this.position > TOTAL_TILES) return;

        const B_width  = this.boardSize || (this.scale * BOARD_SIZE);
        const B_height = B_width * (9 / 16);

        const tile_width  = this.tileWidth  || ((B_width  * GRID_WIDTH_PCT)  / TILES_PER_ROW);
        const tile_height = this.tileHeight || ((B_height * GRID_HEIGHT_PCT) / TILES_PER_ROW);

        const left_offset   = B_width  * GRID_MARGIN_LEFT_PCT;
        const bottom_offset = B_height * GRID_MARGIN_BOTTOM_PCT;

        const playerSize = parseInt(this.piece.style.width || '0', 10)
                         || Math.round(Math.min(tile_width, tile_height) * 0.88);

        if (this.position === 0) {
            // Before entering: place inside tile 1 (Start square) with small per-player offset
            // Tile 1 = row 0, col 0 (bottom-left of grid)
            const tile1_x = left_offset;
            const tile1_y = bottom_offset;
            // Small 2x2 grid offset so multiple pieces don't fully overlap
            const offsets = [
                { x: 0,             y: 0 },
                { x: playerSize * 0.42, y: 0 },
                { x: 0,             y: playerSize * 0.42 },
                { x: playerSize * 0.42, y: playerSize * 0.42 },
                { x: playerSize * 0.21, y: playerSize * 0.21 },
            ];
            const off = offsets[this.index] || { x: 0, y: 0 };
            const px = tile1_x + off.x;
            const py = tile1_y + off.y;
            this.piece.style.left   = `${Math.round(px)}px`;
            this.piece.style.bottom = `${Math.round(py)}px`;
            return;
        }

        // Which tile?
        const rowIndex = Math.floor((this.position - 1) / TILES_PER_ROW);
        const colIndex = (this.position - 1) % TILES_PER_ROW;

        // Even rows go left→right, odd rows go right→left (snake pattern)
        const actualCol = (rowIndex % 2 === 0)
            ? colIndex
            : (TILES_PER_ROW - 1 - colIndex);

        // Tile's bottom-left corner (in board coords)
        const tile_x = left_offset   + actualCol * tile_width;
        const tile_y = bottom_offset + rowIndex  * tile_height;

        // Center the piece inside the tile
        const cx = tile_x + (tile_width  - playerSize) / 2;
        const cy = tile_y + (tile_height - playerSize) / 2;

        this.piece.style.left   = `${Math.round(cx)}px`;
        this.piece.style.bottom = `${Math.round(cy)}px`;
    }
}
