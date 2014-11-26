var fill = fill || {};

(function($){

    fill.version = "0.1.0";

    var plugin = function() {
            var el, plugin, args, action, options;


            //Grab any arguments passed into the fill function and convert to array. If the 1st argument is a string,
            //then the caller is requesting some action to be performed on an existance instance of fill (refresh,
            //destroy) etc. The second argument may be a JSON object of parameters to pass into the function. If the
            //first argument is not a string, then it must be a JSON object of parameters that will be passed into the
            //c'tor of our fill plugin class
            args = $.makeArray(arguments);
            if ("string" === typeof args[0]) {
                action = args[0];
                args = args.splice(0);
            }
            options = args[0];

            //Loop through the elements that matched the user's selector and create a Fill plugin for each one
            $.each(this, function () {

                el = $(this);
                plugin = el.data("fill-pi");
                if (!plugin && !action)
                {
                    plugin = new fill.classes.FillPlugin(el, options);
                    el.data('fill-pi', plugin);
                } else if (plugin && action){
                    plugin[action](options);
                    //Destroy is a special case
                    if ("destroy" === action)
                        el.removeData("fill-pi");
                }
            })

            return (this);
        }

    //Add the fill plug-in to jQuery
    if (!$.fn.fill)
        $.fn.fill = plugin;
    else
        console.warn("jQuery.fn.fill is already defined. Fill Layout Manager cannot be loaded.");

})(jQuery);