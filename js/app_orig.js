'use strict';

var chessGame = function () {

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
                id = rowIds[row] + colIds[col];
                // id = colIds[col] + rowIds[row];
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

        setPiece('1A', 'white_rook');
        setPiece('1B', 'white_knight');
        setPiece('1C', 'white_bishop');
        setPiece('1D', 'white_queen');
        setPiece('1E', 'white_king');
        setPiece('1F', 'white_bishop');
        setPiece('1G', 'white_knight');
        setPiece('1H', 'white_rook');
        for (col = 0; col < 8; col++) {
            setPiece('2' + colIds[col], 'white_pawn');
        }

        setPiece('8A', 'black_rook');
        setPiece('8B', 'black_knight');
        setPiece('8C', 'black_bishop');
        setPiece('8D', 'black_queen');
        setPiece('8E', 'black_king');
        setPiece('8F', 'black_bishop');
        setPiece('8G', 'black_knight');
        setPiece('8H', 'black_rook');
        for (col = 0; col < 8; col++) {
            setPiece('7' + colIds[col], 'black_pawn');
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


