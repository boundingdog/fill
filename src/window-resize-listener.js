var fill = fill || {};
fill.classes = fill.classes || {};

(function($){

    var listener = function(){
        this._callbacks = {};
    };

    /**
     * Adds a new resize handler to the listener.
     * @param callback
     */
    listener.prototype.addHandler = function(callback){
        var id, self = this;

        id = new Date().getTime();
        this._callbacks[id] = callback;
        //Hook up to the window resize event if this is the first handler applied.
        if (1===Object.keys(this._callbacks).length){
            $(window).on("resize.fill", function() { self._fireResizeEvent(); } );
        }
        return(id);
    };

    /**
     * Removes a resize handler from the listener.
     * @param callback
     */
    listener.prototype.removeHandler = function(id){
        delete this._callbacks[id];
        if (0===Object.keys(this._callbacks).length){
            $(window).off("resize.fill");
        }
    };

    listener.prototype._fireResizeEvent = function(){
        for(var id in this._callbacks){
            this._callbacks[id]();
        }
    };

    fill.classes.WindowResizeListener = new listener();

})(jQuery);