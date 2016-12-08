/*
 * This script enables arrow navigation between input elements that have the data-col and data-row attributes set.
 * Example:
 * <input type="text" data-col="0" data-row="0"/>
 * <input type="text" data-col="1" data-row="0"/>
 */
$.fn.selectRange = function (start, end) {
    return this.each(function () {
        if (end === undefined) {
            end = $(this).val().length;
        }
        if (this.setSelectionRange) {
            this.focus();
            this.setSelectionRange(start, end);
        } else if (this.createTextRange) {
            var range = this.createTextRange();
            range.collapse(true);
            range.moveEnd('character', end);
            range.moveStart('character', start);
            range.select();
        }
    });
};

$(function () {
    const LEFT = 37, UP = 38, RIGHT = 39, DOWN = 40;

    var getPos = function ($elem) {
        var col = $elem.data("col");
        var row = $elem.data("row");
        return { col: col, row: row };
    };

    var getMaxCol = function (row) {
        var $elem = $("input[data-col][data-row='" + row + "']");
        var col = 0;
        $elem.each(function (index) {
            var newCol = $(this).data("col");
            if (newCol > col) {
                col = newCol;
            }
        });
        return col;
    };

    var getMaxRow = function () {
        var $elem = $("input[data-row][data-col]");
        var row = 0;
        $elem.each(function (index) {
            var newRow = $(this).data("row");
            if (newRow > row) {
                row = newRow;
            }
        });
        return row;
    };

    var getElemByPos = function (pos) {
        return $("input[data-col='" + pos.col + "'][data-row='" + pos.row + "']");
    };

    var isEnabled = function (pos) {
        var $elem = getElemByPos(pos);
        return $elem.attr("disabled") == null;
    };

    var navigateTo = function (pos) {
        var $elem = getElemByPos(pos);
        if ($elem.length === 1) {
            $elem.selectRange(0);
            $elem.focus();
        }
    };

    var recurseGuard = function (depth, callback) {
        if (typeof depth === "number") {
            depth += 1;
        } else {
            depth = 1;
        }

        if (depth < 100) {
            callback(depth);
        }
    };

    var navigateLeft = function (pos, depth) {
        if (pos.col > 0) {
            pos.col -= 1;
        } else if (pos.row > 0) {
            pos.row -= 1;
            pos.col = getMaxCol(pos.row);
        } else {
            pos.row = getMaxRow();
            pos.col = getMaxCol(pos.row);
        }

        if (!isEnabled(pos)) {
            recurseGuard(depth, function (d) {
                navigateLeft(pos, d);
            });
            return;
        }

        navigateTo(pos);
    }

    var navigateRight = function (pos, depth) {
        var maxCol = getMaxCol(pos.row);        
        if (pos.col < maxCol) {
            pos.col += 1;
        } else {
            var maxRow = getMaxRow();
            pos.col = 0;
            if (pos.row < maxRow) {
                pos.row += 1;
            } else {
                pos.row = 0;
            }
        }

        if (!isEnabled(pos)) {
            recurseGuard(depth, function (d) {
                navigateRight(pos, d);
            });
            return;
        }

        navigateTo(pos);
    }

    var navigateUp = function (pos, depth) {
        if (pos.row > 0) {
            pos.row -= 1;
        } else {
            pos.row = getMaxRow();
            if (pos.col > 0) {
                pos.col -= 1;
            } else {
                pos.col = getMaxCol(pos.row);
            }
        }

        if (!isEnabled(pos)) {
            recurseGuard(depth, function (d) {
                navigateUp(pos, d);
            });
            return;
        }

        navigateTo(pos);
    };    

    var navigateDown = function (pos, depth) {
        var maxRow = getMaxRow();
        if (pos.row < maxRow) {
            pos.row += 1;
        } else {
            var maxCol = getMaxCol(0);
            pos.row = 0;
            if (pos.col < maxCol) {
                pos.col += 1;                
            } else {
                pos.col = 0;
            }
        }

        if (!isEnabled(pos)) {
            recurseGuard(depth, function (d) {
                navigateDown(pos, d);
            });
            return;
        }

        navigateTo(pos);
    }

    // connect key listener to all data-col/data-row elements
    $("input[data-col][data-row]").keydown(function (e) {
        switch (e.which) {
            case LEFT:
                var pos = getPos($(this));
                navigateLeft(pos);
                e.preventDefault();
                break;
            case UP:
                var pos = getPos($(this));
                navigateUp(pos);
                e.preventDefault();
                break;
            case RIGHT:
                var pos = getPos($(this));
                navigateRight(pos);
                e.preventDefault();
                break;
            case DOWN:
                var pos = getPos($(this));
                navigateDown(pos);
                e.preventDefault();
                break;
            default:
        }
    });
});