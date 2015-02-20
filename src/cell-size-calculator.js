var fill = fill || {};
fill.classes = fill.classes || {};

(function($){

    var calculator = function(container){
        this._container = container;

        this._rows = { key: "row", sizes : {} };
        this._cols = { key: "col", sizes : {} };
        this._rowCnt = 0;
        this._colCnt = 0;
    };

    calculator.prototype.addCell = function(row, col){
        if ("undefined" === typeof this._rows.sizes[row])
            this._rows.sizes[row] = { type: null };
        if ("undefined" === typeof(this._cols[col]))
            this._cols.sizes[col] = { type : null }

        this._rowCnt = Math.max(this._rowCnt, row+1);
        this._colCnt = Math.max(this._colCnt, col+1);
    };

    /**
     * Pre-process the cells to determine if they have been assigned widths/heights somewhere in the
     * application's CSS
     */
    calculator.prototype.preProcessCells = function(){
        var wrapper;

        wrapper = $("<div style='visibility:visible;float:left'><div style='display:inline-block' class='fill-test-cell'></div></div>").appendTo(this._container);
        for(var col in this._cols.sizes) {
            wrapper.width(this._container.innerWidth());
            this._cols.sizes[col] = this._detectUserSize("col", col, wrapper);
        }
        for(var row in this._rows.sizes) {
            wrapper.height(this._container.innerHeight());
            this._rows.sizes[row] = this._detectUserSize("row", row, wrapper);
        }

        wrapper.remove();
    };

    /**
     * TODO comment
     */
    calculator.prototype.calculate = function(width, height, padding){
        var cell, fillCells, size, remaining, sizeMap = { cols: {}, rows: {} };

        remaining = width - (this._colCnt+1)*padding;
        fillCells = [];
        //Iterate the list of columns and populate the size with the width of each cell. For fixed values, simply
        //copy the value over. Calc percents based on the width minus any padding. Keep track of any "fill" columns
        //so we can go back afterwards and divy up the remaining container width
        for(var col in this._cols.sizes){
            cell = this._cols.sizes[col];
            if ("fixed" === cell.type) {
                sizeMap.cols[col] = cell.size;
                remaining -= sizeMap.cols[col];
            }
            else if ("percent" === cell.type) {
                sizeMap.cols[col] = Math.floor(cell.size * width);
                remaining -= sizeMap.cols[col];
            }
            else {
                fillCells.push(col);
            }
        }

        for(var i=0; i<fillCells.length; i++){
            sizeMap.cols[fillCells[i]] = Math.floor(remaining / fillCells.length);
        }
        //TODO make sure sums up to total width

        //Repeat the process for rows
        remaining = height - (this._rowCnt+1) * padding;
        fillCells = [];
        //Iterate the list of columns and populate the size with the width of each cell. For fixed values, simply
        //copy the value over. Calc percents based on the width minus any padding. Keep track of any "fill" columns
        //so we can go back afterwards and divy up the remaining container width
        for(var row in this._rows.sizes){
            cell = this._rows.sizes[row];
            if ("fixed" === cell.type) {
                sizeMap.rows[row] = cell.size;
                remaining -= sizeMap.rows[row];
            }
            else if ("percent" === cell.type) {
                sizeMap.rows[row] = Math.floor(cell.size * height);
                remaining -= sizeMap.rows[row];
            }
            else {
                fillCells.push(row);
            }
        }

        for(var i=0; i<fillCells.length; i++){
            sizeMap.rows[fillCells[i]] = Math.floor(remaining / fillCells.length);
        }
        //TODO make sure sums up to total width
        //alert(JSON.stringify(sizeMap));
        this._calculated = sizeMap;
        return(sizeMap);
    };


    /**
     * Checks to see if the user has set a width/height for this col/row in a stylesheet
     * @param dimension "width" or "height" string
     * @param index Integer index of the row or column as defined in the HTML
     * @param el Invisible DOM element which can be used to test for CSS dimensions
     * @returns {number} Integer width or height of the cell. Returns 0 if not defined in stylesheet
     * @private
     */
    calculator.prototype._detectUserSize = function(dimension, index, wrapper){
        var testCell, cls, size, obj;

        cls = "fill-" + dimension + "-" +index;
        //Add an invisible element to the parent container and check its width or height. If its not 0, then the user
        //has set a value for it in the CSS.
        //Note:
        // - The returned value will always be in pixels (Even if the user puts some other unit in the stylesheets).
        //   There's not really a good way to get the original units.
        // - The float is because the div is a block elem and will automatically fill the entire available width.
        //   Floating it prevents this.
        testCell = $(".fill-test-cell", wrapper);
        testCell.addClass(cls);

        obj = { type : "fill", size:0 };
        size = ("col" === dimension ? testCell.width() : testCell.height());
        if (0!==size) {
            obj.size = size;
            //Resize the wrapper and check to see if our size has changed. If so, this dimension is supplied
            //as a percentage. Otherwise its a fixed value.
            wrapper.width(100).height(100);
            size = ("col" === dimension ? testCell.width() : testCell.height());
            if (obj.size !== size){

                obj.type = "percent";
                obj.size = size / 100.0;
            }
            else {
                obj.type = "fixed";
            }
        }

        //Clean up the local changes we made to the wrapper and test cell
        testCell.removeClass(cls);

        return(obj);
    };

    fill.classes.CellSizeCalculator = calculator;
})(jQuery);