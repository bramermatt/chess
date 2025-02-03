const pieces = {
    'R': '♜', 'N': '♞', 'B': '♝', 'Q': '♛', 'K': '♚', 'P': '♟',
    'r': '♖', 'n': '♘', 'b': '♗', 'q': '♕', 'k': '♔', 'p': '♙'
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
let selectedPiece = null;
let selectedSquare = null;

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

    let fromRow = selectedSquare.dataset.row;
    let fromCol = selectedSquare.dataset.col;
    let toRow = targetSquare.dataset.row;
    let toCol = targetSquare.dataset.col;

    targetSquare.textContent = selectedPiece;
    selectedSquare.textContent = "";
    selectedSquare.classList.remove("active");

    logMove(selectedPiece, fromRow, fromCol, toRow, toCol);

    selectedPiece = null;
    selectedSquare = null;
}

function logMove(piece, fromRow, fromCol, toRow, toCol) {
    let moveEntry = document.createElement("div");
    moveEntry.classList.add("move-entry");

    let isValid = isGoodMove(piece, fromRow, fromCol, toRow, toCol);
    let moveType = isValid ? "✅" : "❌";

    moveEntry.innerHTML = `${moveType} ${piece} (${fromRow},${fromCol}) → (${toRow},${toCol})`;

    if (!isValid) {
        let infoIcon = document.createElement("span");
        infoIcon.textContent = " [info]";
        infoIcon.classList.add("info-icon");
        infoIcon.addEventListener("click", function() {
            showToast(getMoveExplanation(piece, fromRow, fromCol, toRow, toCol));
        });
        moveEntry.appendChild(infoIcon);
    }

    teachBoard.appendChild(moveEntry);
}

function showToast(message) {
    toast.innerHTML = `${message} <br><a href="https://www.chess.com/learn-how-to-play-chess" target="_blank" style="color: #00bfff;">Learn More</a>`;
    toast.classList.add("show");
    setTimeout(() => { toast.classList.remove("show"); }, 5000);
}

function getMoveExplanation(piece, fromRow, fromCol, toRow, toCol) {
    let rowDiff = Math.abs(toRow - fromRow);
    let colDiff = Math.abs(toCol - fromCol);

    switch (piece) {
        case '♜': case '♖': return rowDiff !== 0 && colDiff !== 0 ? "Rooks move in straight lines only!" : "";
        case '♞': case '♘': return !(rowDiff === 2 && colDiff === 1) && !(rowDiff === 1 && colDiff === 2) ? "Knights move in an L-shape." : "";
        case '♝': case '♗': return rowDiff !== colDiff ? "Bishops move diagonally only!" : "";
        case '♛': case '♕': return rowDiff !== colDiff && rowDiff !== 0 && colDiff !== 0 ? "Queens move like a rook or bishop." : "";
        case '♚': case '♔': return rowDiff > 1 || colDiff > 1 ? "Kings move one square in any direction." : "";
        case '♟': return fromRow >= toRow || rowDiff > 1 || colDiff > 0 ? "Pawns move forward one square." : "";
        case '♙': return fromRow <= toRow || rowDiff > 1 || colDiff > 0 ? "Pawns move forward one square." : "";
        default: return "Invalid move.";
    }
}

function isGoodMove(piece, fromRow, fromCol, toRow, toCol) {
    return getMoveExplanation(piece, fromRow, fromCol, toRow, toCol) === "";
}