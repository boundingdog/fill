var fill = fill || {};
fill.classes = fill.classes || {};

(function($){

    //TODO AMD?
    var layoutManager = function(el, options){
        var defaults = { padding: 0 };

        this._config = $.extend({}, defaults, options);
        this._el = el;

        this._init();
    };

    /**
     * Performs miscellaneous initialization logic before kicking off the layout process
     * @private
     */
    layoutManager.prototype._init = function(){

        //Save off the original style attributes so we can revert things properly when
        //destroy is called
        this._origStyle = this._el.attr("style");

        this._el.css({ 'position' : 'relative' });

        this._cellCalculator = new fill.classes.CellSizeCalculator(this._el);

        this._buildLayout();

        //Calculate the sizes of rows and columns based on the current container dimensions and then
        //render the layout.
        this._cellCalculator.calculate(this._width, this._height);
        this._renderLayout();
    };

    /**
     * TODO comments
     * @private
     */
    layoutManager.prototype._buildLayout = function(){
        var components, comp, row, col, grid, colCnt;

        this._width = this._el.width();
        this._height = this._el.height();
        this._dimensions = { rows : { }, cols : { } };

        grid = {};
        colCnt = 0;
        components = $("> [data-fill]", this._el);
        for(var i=0; i<components.length; i++){

            comp = new fill.classes.FillComponent($(components[i]));
            row = comp.get("row");
            col = comp.get("col");
            if (null===row || null===col|| 0>row || 0>col) {
                console.warn("Fill component does not have a row and col defined. Component will be skipped");
                continue;
            }

            //TODO comments
            if (!grid[row]) {
                grid[row] = {};
            }

            if (grid[row][col]){
                console.warn("Duplicate cell defined for fill component ("+row + "," + col +"). Component will be skipped.");
                continue;
            }

            this._cellCalculator.addCell(row, col);
            grid[row][col] = comp;

            //Increment the grid's max column count if the # of columns in this row is greater than any existing row.
            if (colCnt < Object.keys(grid[row]).length)
                colCnt++;
        }

        //TODO sort row and cols to make sure they are in correct order
        //TODO normalize the row / cols in case the user doesn't specify them in incremental order
        //Convert the local grid variable from an Object to a multidimensional array
        this._grid = new Array(Object.keys(grid));
        for(var row in grid){

            this._grid[row] = new Array(colCnt);
            for(var col in grid[row]){
                this._grid[row][col] = grid[row][col];
            }
        }
    };

    /**
     * TODO Comments
     * @private
     */
    layoutManager.prototype._renderLayout = function(){
        var cell, x, y, cellWid, cellHt, args, padding;

        //Skip out of this function if there's nothing in the grid
        if (!this._grid || 0===this._grid.length)
            return(0);

        y = 0;
        for(var row=0; row<this._grid.length; row++){
            x = 0;
            for(var col=0; col<this._grid[row].length; col++) {

                //Grab a reference to the next cell. Not all spaces in the grid will be populated (because of
                //multi spanning cols/rows or just left empty). If this is a blank cell, skip this loop iteration.
                cell = this._grid[row][col];
                if (typeof cell === "undefined" || null===cell) {
                    x += this._cellCalculator.getColWidth(col);
                    continue;
                }

                cellWid = this._cellCalculator.getColWidth(col);
                for(var tmp = col+1; tmp<col+cell.get("colSpan"); tmp++) {
                    cellWid += this._cellCalculator.getColWidth(tmp);
                }
                cellHt = this._cellCalculator.getRowHeight(row);
                for(var tmp = row+1; tmp<row+cell.get("rowSpan"); tmp++) {
                    cellHt += this._cellCalculator.getRowHeight(tmp);
                }

                args = { top: y+"px",
                                left: x +"px",
                                right: this._width - (x + cellWid) + "px",
                                bottom: this._height - (y + cellHt) + "px" };
                if (0!==this._config.padding)
                {
                    //Add a uniform padding to all the components. We can't simply add a single padding to the component
                    //as a whole because that would result in the internal margins being 2x the size of the borders on
                    //the edges. So add a padding to the right and bottom side of every component. Also add a top
                    //padding if the component is in the first row and a left padding if in the first col
                    padding = (0==row ? this._config.padding : "0") + " " + this._config.padding + " "; //Top and Right padding
                    padding += this._config.padding + " " + (0==col ? this._config.padding : "0"); //Bottom and Left padding
                    args.padding = padding;
                }
                cell.el.css(args);

                x += this._cellCalculator.getColWidth(col);
            }
            y += this._cellCalculator.getRowHeight(row);
        }
    };

    layoutManager.prototype.refresh = function(){
        //TODO check for changes to HTML? padding?
        var newWid, newHt;

        newWid = this._el.width();
        newHt = this._el.height();

        if (newWid !== this._width || newHt !== this._height) {

            this._cellCalculator.calculate(newWid !== this._width ? newWid : -1,
                                            newHt !== this._height ? newHt : -1);

            this._width = newWid;
            this._height = newHt;
        }
        //Re-render
        this._renderLayout();
    };

    /**
     * Reverts the fill container and components to their original state (before the fill plugin was applied)
     */
    layoutManager.prototype.destroy = function(){
        var cell;

        //Call destroy on each component in the grid
        if (0<this._grid.length) {
            for (var i = 0; i < this._grid.length; i++) {
                for (var j = 0; j < this._grid[i].length; j++) {

                    cell = this._grid[i][j];
                    if (typeof cell === "undefined" || null===cell)
                        continue;

                    cell.destroy();
                }
            }
        }

        //Revert the container to its original style attributes
        if (this._origStyle)
            this._el.attr("style", this._origStyle);
        else
            this._el.removeAttr("style");
    };

    fill.classes.LayoutManager = layoutManager;

})(jQuery);