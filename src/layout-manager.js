var fill = fill || {};
fill.classes = fill.classes || {};

(function($){

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

        //Convert the supplied padding value to pixels (if not already)
        this._config.pixelPadding = this._getPaddingInPixels(this._config.padding);

        //Save off the original style attributes so we can revert things properly when
        //destroy is called
        this._origStyle = this._el.attr("style");

        this._el.css({ 'position' : 'relative' });

        this._cellCalculator = new fill.classes.CellSizeCalculator(this._el);

        this._buildLayout();

        //Calculate the sizes of rows and columns based on the current container dimensions and then
        //render the layout.
        this._cellCalculator.calculate(this._width,
                                        this._height,
                                        this._config.pixelPadding);
        this._renderLayout();

        //Fire off an event letting anyone listening that the layout has been applied
        this._el.trigger("fillcreate", { });
    };

    /**
     * TODO comments
     * @private
     */
    layoutManager.prototype._buildLayout = function(){
        var regions, region, row, col, span, grid, rows, colCnt, tmp;

        this._width = this._el.width();
        this._height = this._el.height();
        this._dimensions = { rows : { }, cols : { } };

        grid = {};
        colCnt = 0;
        regions = $("> [data-fill]", this._el);
        for(var i=0; i<regions.length; i++){

            region = new fill.classes.Region($(regions[i]), { contentClass : this._config.contentClass} );
            row = region.get("row");
            col = region.get("col");
            if (null===row || null===col|| 0>row || 0>col) {
                console.warn("Fill region does not have a row and col defined. Region will be skipped");
                continue;
            }

            //TODO comments
            if (!grid[row]) {
                grid[row] = {};
            }

            if (grid[row][col]){
                console.warn("Duplicate region defined for fill region ("+row + "," + col +"). Region will be skipped.");
                continue;
            }

            this._cellCalculator.addCell(row, col);
            grid[row][col] = region;

            //Increment the grid's max column count if the # of columns in this row is greater than any existing row.
            if (colCnt < Object.keys(grid[row]).length)
                colCnt++;
        }

        //TODO sort row and cols to make sure they are in correct order
        //TODO normalize the row / cols in case the user doesn't specify them in incremental order
        //Convert the local grid variable from an Object to a multidimensional array
        rows = Object.keys(grid);
        this._grid = new Array(rows);
        for(var row in grid){
            this._grid[row] = new Array(colCnt);
            for(var col in grid[row]){
                region = grid[row][col];
                this._grid[row][col] = region;

                //Mark off the cells in the grid where this region will expand to
                span = region.get("colSpan");
                if (!isNaN(span) && 1<span){
                    for(var i=col+1; i<col+span; i++){
                        this._grid[row][i] = true;
                    }
                }
            }
        }
        //Iterate the grid again and calculate col/row spans for wildcards and assign edges to the regions
        for(var row=0; row<this._grid.length; row++) {

            for(var col=0; col<this._grid[row].length; col++) {
                region = this._grid[row][col];
                if (region && region.type && "Region" === region.type) {

                    if ("*"===region.get("colSpan"))
                    {
                        span = 1;
                        for(var i=col+1; i<this._grid[row].length; i++) {
                            tmp = this._grid[row][i];
                            if (undefined !== tmp)
                                break;
                            span++;
                            this._grid[row][i] = true;
                        }
                        region.setComputed("colSpan", span);
                    }
                    if ("*"===region.get("rowSpan"))
                    {
                        span = 1;
                        for(var i=row+1; i<this._grid.length; i++) {
                            tmp = this._grid[i][col];
                            if (undefined !== tmp)
                                break;
                            span++;
                            this._grid[i][col] = true;
                        }
                        region.setComputed("rowSpan", span);
                    }
                    //Tag this region as right/left/top/bottom
                    region.setEdges(0 == row, //Top
                        (col - 1 + region.get("colSpan")) == (colCnt - 1), //Right
                        (row - 1 + region.get("rowSpan")) == (rows.length - 1), //Bottom
                        0 == col); //Left
                }
            }
        }

        //Have the cell calculator preprocess the defined cells to determine which have widths/heights assigned in
        //the CSS
        this._cellCalculator.preProcessCells();
    };

    /**
     * TODO Comments
     * @private
     */
    layoutManager.prototype._renderLayout = function(){
        var region, x, y, regionWid, regionHt, args, padding, halfPadding, cellSizes;

        //Skip out of this function if there's nothing in the grid
        if (!this._grid || 0===this._grid.length)
            return(0);

        padding = this._config.pixelPadding;
        halfPadding = padding/2;
        //Have the cell calculator recalc all the cell sizes based off the current height and
        //width and padding
        cellSizes = this._cellCalculator.calculate(this._width, this._height, padding);

        y = padding;
        for(var row=0; row<this._grid.length; row++){
            x = padding;
            for(var col=0; col<this._grid[row].length; col++) {

                //Grab a reference to the next region. Not all spaces in the grid will be populated (because of
                //multi spanning cols/rows or just left empty). If this is a blank region, skip this loop iteration.
                region = this._grid[row][col];
                if (undefined === region || !region.type) {
                    x += cellSizes.cols[col] + padding;
                    continue;
                }

                regionWid = cellSizes.cols[col];
                for(var tmp = col+1; tmp<col+region.get("colSpan"); tmp++) {
                    regionWid += cellSizes.cols[tmp] + padding;
                }
                regionHt = cellSizes.rows[row];
                for(var tmp = row+1; tmp<row+region.get("rowSpan"); tmp++) {
                    regionHt += cellSizes.rows[tmp] + padding;
                }

                args = { top: y+"px",
                    left: x +"px",
                    width : regionWid + "px",
                    height: regionHt +"px" };

                //If this region is a right or bottom edge, remove the width/height and set the
                //right / bottom properties. This mimimizes the effect of an incorrectly reported
                //container size as referenced in issue #2.
                if (region.get("right"))
                {
                    delete args.width;
                    args.right = this._width - (x + regionWid) + "px";
                }
                if (region.get("bottom")){
                    delete args.height;
                    args.bottom = this._height - (y + regionHt) + "px";
                }
                //alert(JSON.stringify(args));
                region.el.css(args);
                region.fireResizeEvent();

                x += cellSizes.cols[col] + padding;
            }
            y += cellSizes.rows[row] + padding;
        }
    };

    /**
     * Returns the configured padding in pixels (as an integer)
     * @private
     */
    layoutManager.prototype._getPaddingInPixels = function(padding){
        var tempEl, pixel = padding;

        //First check the supplied padding value. This will have been supplied in the JS options
        //when the plugin was applied to the element. If a padding was not supplied in the options
        //then check to see if a padding was defined in the CSS via the fill-padding class
        if("string" === typeof(padding)){
            //If the value was already supplied as pixels, just parse the string and return the value
            //as an integer
            if (padding.indexOf("px") === (padding.length-2)){
                pixel = parseInt(padding.substr(0, padding.length-2), 10);
            } else {
                //If its not supplied in pixels, we'll have to add a temporary element to the container
                //and set the size to see the pixel value when applied to the DOM
                tempEl = $("<div style='position:absolute;visible:visible;width:"+padding+"'></div>").appendTo(this._el);
                pixel = tempEl.width();
                tempEl.remove();
            }
        } else {
            tempEl = $("<div style='position:absolute;visible:visible;' class='fill-padding'></div>").appendTo(this._el);
            if (tempEl.outerWidth() === tempEl.outerHeight()) {
                pixel = Math.floor(tempEl.outerWidth() / 2);
            } else {
                console.warn("Fill layout manager does not support different vertical and horizontal paddings.");
                pixel = 0;
            }
            tempEl.remove();
        }
        return(pixel);
    };

    layoutManager.prototype.refresh = function(){
        //TODO check for changes to HTML? padding?
        var newWid, newHt;

        newWid = this._el.width();
        newHt = this._el.height();

        if (newWid !== this._width || newHt !== this._height) {
            this._width = newWid;
            this._height = newHt;
            this._renderLayout();
        }
    };

    /**
     * Reverts the fill container and components to their original state (before the fill plugin was applied)
     */
    layoutManager.prototype.destroy = function(){
        var region;

        //Call destroy on each component in the grid
        if (0<this._grid.length) {
            for (var i = 0; i < this._grid.length; i++) {
                for (var j = 0; j < this._grid[i].length; j++) {

                    region = this._grid[i][j];
                    if (typeof region === "undefined" || null===region)
                        continue;

                    region.destroy();
                }
            }
        }

        //Revert the container to its original style attributes
        if (this._origStyle)
            this._el.attr("style", this._origStyle);
        else
            this._el.removeAttr("style");

        //Fire off an event letting anyone listening that the layout has been removed
        this._el.trigger("filldestroy", { });
    };

    fill.classes.LayoutManager = layoutManager;

})(jQuery);