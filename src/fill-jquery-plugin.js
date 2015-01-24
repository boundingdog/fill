var fill = fill || {};
fill.classes = fill.classes || {};

(function($){

    var plugin = function(el, options){

        var defaults = { autoRefresh : true };
        this._init(el, $.extend({}, defaults, options));
    };

    /**
     * Performs initialization logic for the plugin
     * @private
     */
    plugin.prototype._init = function(el, config){
        var self = this;

        this._el = el;
        this._config = config;

        this._registerEventListeners();
        this._layoutManager = new fill.classes.LayoutManager(el, config);

        if (this._config.autoRefresh)
            this._resizeHandlerId = fill.classes.WindowResizeListener.addHandler(function(){ self._refresh(); });
    };

    /**
     * Adds any callback supplied in the options to the element as jquery event listeners
     * @private
     */
    plugin.prototype._registerEventListeners = function(){
        if (this._config.create)
            this._el.on("fillcreate.fill-internal", this._config.create);
        if (this._config.destroy)
            this._el.on("filldestroy.fill-internal", this._config.destroy);
    };

    /**
     * Refreshes the fill components layout. This may be called via a window resize event or be the caller.
     * @private
     */
    plugin.prototype._refresh = function(){
        //TODO just recalc component sizes
        //TODO just reapply properties
        this._layoutManager.refresh();
    };

    plugin.prototype.refresh = function(){
        this._refresh();
    };

    /**
     * Reverts all DOM elements to their original state before the fill plugin was applied
     */
    plugin.prototype.destroy = function(){
        //1. Remove the window resize handler (if it was applied)
        //2. Call destroy on the layout manager which will then call destroy on all the fill component DOM elements
        //3. Delete the layout manager, just because...
        //4. Clean up any event listeners we added
        if (this._resizeHandlerId)
            fill.classes.WindowResizeListener.removeHandler(this._resizeHandlerId);

        this._layoutManager.destroy();
        delete this._layoutManager;

        this._el.off("fillcreate.fill-internal");
        this._el.off("filldestroy.fill-internal");
    };

    fill.classes.FillPlugin = plugin;

})(jQuery);