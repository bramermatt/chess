let isWhiteTurn = true; // White starts first

const pieces = {
    'R': '♜', 'N': '♞', 'B': '♝', 'Q': '♛', 'K': '♚', 'P': '♟', // Black pieces
    'r': '♖', 'n': '♘', 'b': '♗', 'q': '♕', 'k': '♔', 'p': '♙'  // White pieces
};

const boardLayout = [
    "RNBQKBNR",
    "PPPPPPPP",
    "        ",
    "        ",
    "        ",
    "        ",
    "pppppppp",
    "rnbqkbnr"
];

const board = document.getElementById("board");
const teachBoard = document.getElementById("teachBoard");
const toast = document.getElementById("toast");
const piecesColorBoard = document.getElementById("piecesColorBoard");
let selectedPiece = null;
let selectedSquare = null;
const moveHistory = [];
const capturedPieces = { white: [], black: [] };

// Create chessboard
for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
        let square = document.createElement("div");
        square.classList.add("square", (row + col) % 2 === 0 ? "white" : "black");
        square.dataset.row = row;
        square.dataset.col = col;

        let piece = boardLayout[row][col];
        if (piece !== " ") {
            square.textContent = pieces[piece];
        }

        square.addEventListener("click", selectPiece);
        board.appendChild(square);
    }
}

function selectPiece(event) {
    let square = event.target;

    if (!selectedPiece) {
        if (square.textContent !== "") {
            selectedPiece = square.textContent;
            selectedSquare = square;
            square.classList.add("active");
        }
    } else {
        movePiece(square);
    }
}

function movePiece(targetSquare) {
    if (targetSquare === selectedSquare) {
        selectedSquare.classList.remove("active");
        selectedPiece = null;
        selectedSquare = null;
        return;
    }

    let fromRow = parseInt(selectedSquare.dataset.row);
    let fromCol = parseInt(selectedSquare.dataset.col);
    let toRow = parseInt(targetSquare.dataset.row);
    let toCol = parseInt(targetSquare.dataset.col);

    let pieceSymbol = selectedPiece;
    let pieceChar = Object.keys(pieces).find(key => pieces[key] === pieceSymbol);
    if (!pieceChar) {
        showToast("Error: Piece not found in the dictionary.");
        return;
    }

    let isWhitePiece = pieceChar >= 'a' && pieceChar <= 'z';
    let isBlackPiece = pieceChar >= 'A' && pieceChar <= 'Z';

    if ((isWhiteTurn && !isWhitePiece) || (!isWhiteTurn && isWhitePiece)) {
        showToast("It's not your turn!");
        selectedSquare.classList.remove("active");
        selectedPiece = null;
        selectedSquare = null;
        return;
    }

    let capturedPiece = targetSquare.textContent;
    let isValid = isGoodMove(pieceChar, fromRow, fromCol, toRow, toCol, capturedPiece);

    if (isValid) {
        let moveEntry = logMove(pieceSymbol, fromRow, fromCol, toRow, toCol, isValid);
        let capturedElement = null;

        if (capturedPiece) {
            capturedElement = addCapturedPiece(capturedPiece, isWhiteTurn);
        }

        moveHistory.push({
            piece: pieceSymbol,
            fromRow,
            fromCol,
            toRow,
            toCol,
            capturedPiece,
            capturedElement,
            moveEntry
        });

        targetSquare.textContent = selectedPiece;
        selectedSquare.textContent = "";
        selectedSquare.classList.remove("active");

        selectedPiece = null;
        selectedSquare = null;
        isWhiteTurn = !isWhiteTurn;
    } else {
        showToast(getMoveExplanation(pieceChar, fromRow, fromCol, toRow, toCol));
    }
}

// ✅ **Function to Add Captured Pieces**
function addCapturedPiece(piece, isWhite) {
    let capturedPieceElement = document.createElement("span");
    capturedPieceElement.textContent = piece;
    capturedPieceElement.classList.add(isWhite ? "white-piece" : "black-piece");
    piecesColorBoard.appendChild(capturedPieceElement);

    if (isWhite) {
        capturedPieces.white.push(capturedPieceElement);
    } else {
        capturedPieces.black.push(capturedPieceElement);
    }

    return capturedPieceElement;
}

// ✅ **Function to Check Move Validity**
function isGoodMove(piece, fromRow, fromCol, toRow, toCol, targetPiece) {
    let rowDiff = Math.abs(toRow - fromRow);
    let colDiff = Math.abs(toCol - fromCol);

    switch (piece) {
        case 'R': case 'r': return rowDiff === 0 || colDiff === 0;
        case 'N': case 'n': return (rowDiff === 2 && colDiff === 1) || (rowDiff === 1 && colDiff === 2);
        case 'B': case 'b': return rowDiff === colDiff;
        case 'Q': case 'q': return rowDiff === colDiff || rowDiff === 0 || colDiff === 0;
        case 'K': case 'k': return rowDiff <= 1 && colDiff <= 1;
        case 'P': 
            return (fromRow + 1 === toRow && colDiff === 0 && !targetPiece) || // Move forward
                   (fromRow + 1 === toRow && colDiff === 1 && targetPiece);  // Capture diagonally
        case 'p': 
            return (fromRow - 1 === toRow && colDiff === 0 && !targetPiece) || // Move forward
                   (fromRow - 1 === toRow && colDiff === 1 && targetPiece);  // Capture diagonally
    }
    return false;
}


// ✅ **Move Log (TeachBoard)**
function logMove(piece, fromRow, fromCol, toRow, toCol, isValid) {
    let moveEntry = document.createElement("div");
    moveEntry.classList.add("move-entry");

    let moveType = isValid ? "✅" : "❌";
    moveEntry.innerHTML = `${moveType} ${piece} ${toChessNotation(fromRow, fromCol)} → ${toChessNotation(toRow, toCol)}`;

    teachBoard.appendChild(moveEntry);
    return moveEntry;
}

function toChessNotation(row, col) {
    const files = "ABCDEFGH";
    return `${files[col]}${8 - row}`;
}

// ✅ **Go Back / Undo Move**
function goBack() {
    if (moveHistory.length === 0) return;

    let lastMove = moveHistory.pop();
    let fromSquare = document.querySelector(`[data-row="${lastMove.fromRow}"][data-col="${lastMove.fromCol}"]`);
    let toSquare = document.querySelector(`[data-row="${lastMove.toRow}"][data-col="${lastMove.toCol}"]`);

    fromSquare.textContent = lastMove.piece;
    toSquare.textContent = lastMove.capturedPiece || "";

    if (lastMove.capturedPiece) {
        removeCapturedPiece(lastMove.capturedElement, !isWhiteTurn);
    }

    if (lastMove.moveEntry) {
        lastMove.moveEntry.style.textDecoration = "line-through";
        lastMove.moveEntry.style.color = "gray";
    }

    isWhiteTurn = !isWhiteTurn;
    showToast("Move undone.");
}

// ✅ **Remove Captured Piece**
function removeCapturedPiece(pieceElement, isWhite) {
    if (pieceElement) {
        piecesColorBoard.removeChild(pieceElement);
        if (isWhite) {
            capturedPieces.white.pop();
        } else {
            capturedPieces.black.pop();
        }
    }
}

// ✅ **Toast Message**
function showToast(message) {
    toast.innerHTML = `${message} <br><a href="https://www.chess.com/learn-how-to-play-chess" target="_blank" style="color: #00bfff;">Learn More</a>`;
    toast.classList.add("show");
    setTimeout(() => { toast.classList.remove("show"); }, 5000);
}

// Attach Go Back button event listener
document.getElementById("goBack").addEventListener("click", goBack);
