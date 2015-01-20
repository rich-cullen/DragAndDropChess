'use strict';

var chessGame = function () {

    // TODO: board array will be used to calculate valid moves, storing piece ids etc
    var board = [
            [0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0]
        ],

    // in algebraic chess notation the board is A1 bottom left to H8 top right
    colIds = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'],
    rowIds = ['8', '7', '6', '5', '4', '3', '2', '1'],

    clearMoveSourceInfo = function () {
        sessionStorage.removeItem('sourceId');
        sessionStorage.removeItem('sourcePiece'); 
    },

    // TODO: This needs to be fleshed out to implement real chess rules
    // At the moment it just confirms the piece isn't landing in the same spot or on a same colour piece
    isValidMove = function (event, $targetSquare) {
        var data = event.dataTransfer.getData('text').split('~'),
            sourceId = data[0],
            piece = data[1],
            originalPiece = $targetSquare.attr('data-piece');

        return event.target.id !== sourceId && (!originalPiece || piece.substr(0, 5) !== originalPiece.substr(0, 5));
    },

    // event handlers
    onDragStart = function (event) {
        var piece = $(this).attr('data-piece'),
            dragImage = $('<img>').attr('src', 'img/' + piece + '.png')[0];

        event.originalEvent.dataTransfer.setData('text', event.target.id + '~' + piece);
        event.originalEvent.dataTransfer.setDragImage(dragImage, 45, 45);

        // required for access in onDragEnter as dataTransfer object cannot be read outside the drop event - see https://developers.whatwg.org/dnd.html#concept-dnd-p
        // Session Storage just an alternative to local variable, which would work fine for my purposes
        sessionStorage.setItem('sourceId', event.target.id);
        sessionStorage.setItem('sourcePiece', piece); 

        $(this).fadeTo(500, 0.5);
    },

    onDragEnd = function (event) {
        $(this).fadeTo(500, 1);
        clearMoveSourceInfo();
    },

    onDragEnter = function (event) {
        // TODO: if (isValidMove()) {
        var sourceId = sessionStorage.getItem('sourceId'),
            piece = sessionStorage.getItem('sourcePiece'),
            originalPiece = $(this).attr('data-piece');

        if (event.target.id !== sourceId && (!originalPiece || piece.substr(0, 5) !== originalPiece.substr(0, 5))) { // ensure different square and empty or contains opposing piece
            $(this).addClass('validMove');
        }
        else if (event.target.id !== sourceId) {
            $(this).addClass('invalidMove');
        }
    },

    onDragOver = function (event) {
        // TODO: if (isValidMove()) {
        event.preventDefault();
    },

    onDragLeave = function (event) {
        $(this).removeClass('validMove invalidMove');
    },

    onDrop = function (event) {
        var data = event.originalEvent.dataTransfer.getData('text').split('~'),
            sourceId = data[0],
            piece = data[1],
            originalPiece = $(this).attr('data-piece');

        if (isValidMove(event.originalEvent, $(this))) {
            $('#' + sourceId).removeClass(piece).attr('data-piece', '');
            $(this).removeClass(originalPiece).addClass(piece).attr('data-piece', piece); // TODO: sort this;
            toastr.info('Player moved ' + piece + ' from ' + sourceId + ' to ' + event.target.id);
        }

        // return squares to original state
        $(this).removeClass('validMove invalidMove');

        clearMoveSourceInfo();
    },

    // utility functions
    buildBoard = function () {
        var row, col, cssClass, id, html = '';

        for (row = 0; row < 8; row++) {
            html += '<div class="row">';

            for (col = 0; col < 8; col++) {
                cssClass = (row + col) % 2 === 0 ? 'white' : 'black'
                // id = rowIds[row] + colIds[col];
                id = colIds[col] + rowIds[row];
                html += '<div id="' + id + '" class="square ' + cssClass + '" draggable="true" data-piece=""></div>';
            }

            html += '</div>';
        }

        $('#board').append(html);
    },

    setPiece = function (id, piece) {
        $('#' + id).attr('data-piece', piece).addClass(piece);
    },

    addPieces = function () {
        var col;

        setPiece('A1', 'white_rook');
        setPiece('B1', 'white_knight');
        setPiece('C1', 'white_bishop');
        setPiece('D1', 'white_queen');
        setPiece('E1', 'white_king');
        setPiece('F1', 'white_bishop');
        setPiece('G1', 'white_knight');
        setPiece('H1', 'white_rook');
        for (col = 0; col < 8; col++) {
            setPiece(colIds[col] + '2', 'white_pawn');
        }

        setPiece('A8', 'black_rook');
        setPiece('B8', 'black_knight');
        setPiece('C8', 'black_bishop');
        setPiece('D8', 'black_queen');
        setPiece('E8', 'black_king');
        setPiece('F8', 'black_bishop');
        setPiece('G8', 'black_knight');
        setPiece('H8', 'black_rook');
        for (col = 0; col < 8; col++) {
            setPiece(colIds[col] + '7', 'black_pawn');
        }        
    },

    initialiseBoard = function () {
        buildBoard();
        addPieces();
        $('#board').on({
            dragstart: onDragStart,
            dragend: onDragEnd,
            dragenter: onDragEnter,
            dragover: onDragOver,
            dragleave: onDragLeave,
            drop: onDrop
        }, '.square');
    };

    // return object
    return {
        initialiseBoard: initialiseBoard
    }
}

$(document).ready(function () {
    var chess = chessGame();
    chess.initialiseBoard();
});


