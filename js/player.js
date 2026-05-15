
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
        this.piece.style.width = `${Math.round(scale * TILE_SIZE)}px`;
        this.piece.style.height = `${Math.round(scale * TILE_SIZE)}px`;
        console.log("UPDATED", scale);
        this.updatePosition();
    }

    updatePosition() {
        let scaleSize = this.scale * TILE_SIZE;
        if (this.position > TOTAL_TILES) return;

        // Check if the position indicator is 0
        if (this.position === 0) {
            // Set the vertical position of the player element - align with control buttons
            this.piece.style.bottom = `${Math.round(-90)}px`;
            // Set the horizontal position based on player type - closer together, shifted left
            this.piece.style.left = `${Math.round(this.index * scaleSize * 0.5)}px`;
        } else {
            const rowIndex = Math.floor((this.position - 1) / TILES_PER_ROW);
            const colIndex = (this.position - 1) % TILES_PER_ROW;
            this.piece.style.bottom = `${Math.round(rowIndex * scaleSize)}px`;

            if (rowIndex % 2 === 0) {
                this.piece.style.left = `${Math.round(colIndex * scaleSize)}px`;
            } else {
                this.piece.style.left = `${Math.round((TILES_PER_ROW - 1 - colIndex) * scaleSize)}px`;
            }

        }
    }
    
}
