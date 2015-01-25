var fill = fill || {};
fill.classes = fill.classes || {};

(function($){

    var calculator = function(container){
        this._container = container;

        this._rows = { key: "row", sizes : {} };
        this._cols = { key: "col", sizes : {} };
    };

    calculator.prototype.addCell = function(row, col){
        if ("undefined" === typeof this._rows.sizes[row])
            this._rows.sizes[row] = { type: null };
        if ("undefined" === typeof(this._cols[col]))
            this._cols.sizes[col] = { type : null }
    };

    /**
     * Returns the height of the requested row
     * @param row
     * @returns {*}
     */
    calculator.prototype.getRowHeight = function(row){
        return(this._rows.sizes[row].size);
    };

    /**
     * Returns the width of the requested column
     * @param col
     * @returns {*}
     */
    calculator.prototype.getColWidth = function(col){
        return(this._cols.sizes[col].size);
    };

    /**
     * TODO comment
     */
    calculator.prototype.calculate = function(width, height){
        if (0<width)
            this._calculate(this._cols, width);
        if (0<height)
            this._calculate(this._rows, height);

        //alert(JSON.stringify(this._rows));
        //alert(JSON.stringify(this._cols));
    };

    /**
     * TODO COmment
     * @param map
     * @private
     */
    calculator.prototype._calculate = function(map, size){

        var itemCnt, remaining, userCells;

        itemCnt = userCells = Object.keys(map.sizes).length;
        remaining = size;
        for(var i=0; i<itemCnt; i++) {
            if ("computed" !== map.type) {
                map.sizes[i].size = this._detectUserSize(map.key, i);
                map.sizes[i].type = (0<map.sizes[i].size ? "user" : "computed");
            }

            if (0<map.sizes[i].size){
                remaining -= map.sizes[i].size;
                userCells--;
            }
        }
        //Fill in computed values
        for(var i=0; i<itemCnt; i++){
            if ("computed" === map.sizes[i].type)
                map.sizes[i].size = remaining / userCells;
        }

    };

    /**
     * Checks to see if the user has set a width/height for this col/row in a stylesheet
     * @param key "row" or "col" string
     * @param index Integer index of the row or column as defined in the HTML
     * @returns {number} Integer width or height of the cell. Returns 0 if not defined in stylesheet
     * @private
     */
    calculator.prototype._detectUserSize = function(key, index){
        var el, size = 0;

        //Add an invisible element to the parent container and check its width or height. If its not 0, then the user
        //has set a value for it in the CSS.
        //Note:
        // - The returned value will always be in pixels (Even if the user puts some other unit in the stylesheets).
        //   There's not really a good way to get the original units.
        // - The float is because the div is a block elem and will automatically fill the entire available width.
        //   Floating it prevents this.
        el = $("<div class='fill-" + key + "-"+index+"' style='float:left;visibility:hidden'></div>").appendTo(this._container);
        if ("row" === key)
            size = el.height();
        else if ("col" === key)
            size = el.width();
        el.remove();
        return(size);
    };

    fill.classes.CellSizeCalculator = calculator;
})(jQuery);