var fill = fill || {};
fill.classes = fill.classes || {};

(function($){

    var DATA_REGEX = /\b([\w|-]+)\s*:\s*([\w|"|'|\*]+)\s*;?/g;

    var region = function(el, options){
        this.el = el;
        this._init(options);
    };

    /**
     * Initializes the Region which is pretty much just merging the
     * supplied option set with the defaults
     * @param options
     * @private
     */
    region.prototype._init = function(options){
        var str, contentClass, defaults;

        //Save off the original style attributes so we can reset things properly if
        //destroy is called
        this._origStyle = this.el.attr("style");

        this.el.css( { "position" : "absolute" });

        defaults = { row : -1, col: -1,
                        rowSpan: 1, colSpan: 1,
                        contentClass : "",
                        top : false, right: false, bottom: false, left: false };
        this._properties = $.extend({}, defaults, options);


        str = this.el.data("fill");
        if (str) {
            while(null !== (match = DATA_REGEX.exec(str))){
                if (3===match.length){
                    this._properties[match[1]] = parseInt(match[2], 10);
                }
            }
        }
        //alert(JSON.stringify(this._properties));
        //If the caller supplied a content class to make styling things a little easier, apply it to the region
        //wrapper here
        contentClass = "";
        if (this._properties.contentClass && "" !== this._properties.contentClass.trim())
            contentClass = this._properties.contentClass;

        //Wrap the fill region element in a div. This will allow us to apply padding to the regions and still make
        //it easy for the user to stylize the original element. Borders, for example would be applied on the outside edges
        //of the padding (negating the purpose of the padding) if we don't do this wrapping.
        this.el.wrapInner("<div class='fill-region-wrapper " + contentClass + "'></div>").children().first().css( { "-webkit-box-sizing": "border-box",
                                                                                                    "-moz-box-sizing": "border-box",
                                                                                                    "box-sizing" : "border-box" });
    };

    /**
     * Property getter
     */
    region.prototype.get = function(name){

        if (typeof this._properties[name] !== 'undefined')
            return(this._properties[name]);
        return(null);
    };

    /**
     * Sets flags indicating if this is an edge region and which edges it lies on
     * @param top
     * @param right
     * @param bottom
     * @param left
     */
    region.prototype.setEdges = function(top, right, bottom, left){
        var removeClass;

        this._properties.top = top;
        this._properties.right = right;
        this._properties.bottom = bottom;
        this._properties.left = left;

        //Add edge classes to this top level element. This is a convenience to enable
        //users to style these regions a little easier (for example custom padding)
        this.el.addClass("fill"
                            + (top ? " fill-top" : "")
                            + (right ? " fill-right" : "")
                            + (bottom ? " fill-bottom" : "")
                            + (left ? " fill-left" : ""));

        //Remove the edge classes in case they were set previously
        removeClass = "";
        if (!top)
            removeClass += "fill-top ";
        if (!right)
            removeClass += "fill-right ";
        if (!bottom)
            removeClass += "fill-bottom ";
        if (!left)
            removeClass += "fill-left ";
        this.el.removeClass(removeClass);
    };

    /**
     * Sets the calculated width and height so the region can trigger a
     * resize event in case something has changed
     * @param width
     * @param height
     */
    region.prototype.setSize = function(width, height){
        var data;

        //Populate the event with the old dimensions before we store the new ones
        data = {
                    previous : { width: this._properties.width,
                                    height: this._properties.height },
                    current : {}
                };

        this._properties.width = width;
        this._properties.height = height;

        //Check to see if anything actually changed before firing off the resize event.
        // Also don't fire a resize event if this is the first time the width and height are
        //being set
        if (undefined !== data.previous.width && (data.previous.width !== width || data.previous.height !== height)) {

            data.current.width = width;
            data.current.height = height;

            this.el.trigger("fillresize", data);
        }
    };

    /**
     * Reverts the region to its original state (before the fill plugin was applied)
     */
    region.prototype.destroy = function(){

        //Remove the .fill-region-wrapper we added at init time.
        this.el.html($("> .fill-region-wrapper", this.el).html());
        //Remove the css we applied (as a style attribute) to position/size everything
        if (this._origStyle)
            this.el.attr("style", this._origStyle);
        else
            this.el.removeAttr("style");
        //Remove the convenience edge classes we may have added
        this.el.removeClass("fill fill-top fill-right fill-bottom fill-left");
    };

    fill.classes.Region = region;

})(jQuery);