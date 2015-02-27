var fill = fill || {};
fill.classes = fill.classes || {};

(function($){

    var calculator = function(container){
        this._container = container;

        this._cells = [];
        this._rowCnt = 0;
        this._colCnt = 0;
    };

    /**
     * Sets the all the row and column indexes to be factored in the size calculations for the layout. This function is
     * expecting an array of [row index, col index]. It will check to see if a size (width and/or height) was set in
     * the CSS for any of these indicies and what type of size it is (fixed or percent).
     */
    calculator.prototype.createCells = function(cells){
        var wrapper, map, size, self = this;


        wrapper = $("<div style='visibility:visible;float:left'><div style='display:inline-block' class='fill-test-cell'></div></div>").appendTo(this._container);
        map = {rows:[], cols:[]};
        //Check to see if a cell size (width and/or height) has been set for the cell. Then save it off in a 2D array for later use
        $.each(cells, function(index, cell){

            size = self._detectAppliedSizes(cell[0], cell[1], wrapper);
            map.rows[cell[0]] = size.row;
            map.cols[cell[1]] = size.col;

            //Keep track of the max # of rows and columns we have
            self._colCnt = Math.max(self._colCnt, cell[1]);
            self._rowCnt = Math.max(self._rowCnt, cell[0]);

            //Reset our wrapper element
            wrapper.width(self._container.innerWidth()).height(self._container.innerHeight());
        });
        wrapper.remove();
        this._cells = map;
    };

    /**
     * Checks to see if the user has set a width/height for this col/row in a stylesheet
     * @param row Integer index of the row as defined in the HTML
     * @param col Integer index of the column as defined in the HTML
     * @param wrapper Invisible DOM element which can be used to test for CSS dimensions
     * @private
     */
    calculator.prototype._detectAppliedSizes = function(row, col, wrapper){
        var testCell, cls, percentSize, width, height, obj; //tODO remove obj

        obj = { row : {}, col: {}};

        cls = "fill-row-"+row+" fill-col-"+col;

        //Grab a reference to the test cell in the wrapper class and check its width or height. If its not 0, then the user
        //has set a value for it in the CSS.
        testCell = $(".fill-test-cell", wrapper);
        testCell.addClass(cls);

        width = { type: "fill", size: testCell.width() };
        if (width.size) {
            wrapper.width(100);

            percentSize = testCell.width();
            if (percentSize !== width.size){
                width.type = "percent";
                width.size = percentSize/100.0;
            } else {
                width.type = "fixed";
            }
        }
        height = { type: "fill", size: testCell.height() };
        if (height.size) {
            wrapper.height(100);

            percentSize = testCell.height();
            if (percentSize !== height.size){
                height.type = "percent";
                height.size = percentSize/100.0;
            } else {
                height.type = "fixed";
            }
        }

        //Clean up the local changes we made to the wrapper and test cell
        testCell.removeClass(cls);

        return({ row: height, col: width });
    };

    /**
     * TODO comment
     */
    calculator.prototype.calculate = function(width, height, padding){
        var fillCells, remaining, cellSizes;

        remaining = width - (this._colCnt+1)*padding;
        fillCells = [];

        cellSizes = { };
        cellSizes.cols = this._calculateCellSizes(this._cells.cols, width, padding);
        cellSizes.rows = this._calculateCellSizes(this._cells.rows, height, padding);

        return(cellSizes);
    };

    /**
     * Iterates the list of cells (assumes its an array of row cells or an array of column cells) and returns a mapping
     * of cell index to pixel size
     * @param cells
     * @param containerSize width or height of the parent container
     * @param padding
     * @returns {{}}
     * @private
     */
    calculator.prototype._calculateCellSizes = function(cells, containerSize, padding){
        var remaining, fillCells, sizeMap;

        remaining = containerSize - (cells.length+1)*padding;
        fillCells = [];
        //Iterate the list of cells and populate the size with the width of each cell. For fixed values, simply
        //copy the value over. Calc percents based on the width minus any padding. Keep track of any "fill" columns
        //so we can go back afterwards and divy up the remaining container width
        sizeMap = {};
        for(var index in cells){
            cell = cells[index];
            if ("fixed" === cell.type) {
                sizeMap[index] = cell.size;
                remaining -= sizeMap[index];
            }
            else if ("percent" === cell.type) {
                sizeMap[index] = Math.floor(cell.size * containerSize);
                remaining -= sizeMap[index];
            }
            else {
                fillCells.push(index);
            }
        }

        for(var i=0; i<fillCells.length; i++){
            sizeMap[fillCells[i]] = Math.floor(remaining / fillCells.length);
        }
        //TODO make sure sums up to total width
        return(sizeMap);
    };


    fill.classes.CellSizeCalculator = calculator;
})(jQuery);