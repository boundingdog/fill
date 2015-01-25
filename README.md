Fill
====

Fill is a lightweight JavaScript library used to create full-page cross-browser layouts with minimal HTML markup and CSS.

##### Layouts

Fill uses a row/column structure to define and position components (content sections) in the layout. To define a component, tag the DOM element with a ````data-fill```` attribute and set a 0-based row and column index.

The example below defines a 4 section layout where each section takes up 1/4 of the parent div:

````html
<div id="parent" class="fill-container">
    <div data-fill="row: 0; col: 0"><label>Upper left</label></div>
    <div data-fill="row: 0; col: 1"><label>Upper right</label></div>
    <div data-fill="row: 1; col: 0"><label>Lower left</label></div>
    <div data-fill="row: 1; col: 1"><label>Lower right</label></div>
</div>

<script>
    function initFill(){
       $("#foo-parent").fill();
    }
    initFill();
</script>
````
Sections may span mutliple rows and columns using the ````rowSpan```` and ````colSpan```` properties:
````html
<div id="foo-parent" class="fill-container">
    <div data-fill="row: 0; col: 0"><label>Upper left</label></div>
    <div data-fill="row: 0; col: 1"><label>Upper right</label></div>
    <div data-fill="row: 1; col: 0"><label>Lower left</label></div>
    <div data-fill="row: 1; col: 1"><label>Lower right</label></div>
    <div data-fill="row: 2; col: 1; colSpan: 2"><label>Bottom row</label></div>
    <div data-fill="row: 0; col: 2; rowSpan: 3"><label>Right column</label></div>
</div>
````

CSS may be used to set sections' widths and heights using absolute or percentage values or a combination of the two. To set the height of a row add a CSS rule prefixed with ````.fill-row```` followed by the row index. Setting the width of a column is done in a similiar manner as shown below.

````css
  .fill-row-1{
    height: 150px;
  }

  #foo-parent .fill-col-0 {
    width: 50%;
  }
````
Include the parent container in the CSS rule to set different sizes for the same row or column index. This is only required if you have multiple ````fill```` regions on the same page.

##### API
Fill is implemented a jQuery plugin. Use the standard jQuery approach to apply or remove Fill to an element:

````javascript
    //Applies the Fill plugin to the #foo-parent element
    $("#foo-parent").fill();
    ...
    //Removes Fill from the #foo-parent element and returns it to its original state
    $("#foo-parent").fill("destroy");
````

Padding may be added to the layout providing a uniform gap between all the defined components using the optional ````padding```` parameter:

````javascript
    //Applies the Fill plugin to the #foo-parent element
    $("#foo-parent").fill({ padding : "10px"});
````

Padding may also be defined in the CSS using the ````.fill-padding```` class. Padding set in JavaScript will always override values set in CSS

````css
.fill-padding{
    padding: 1em;
}
````

* _Currently the padding option may only be supplied when Fill is first applied to a layout._

Call the plugin's ````refresh```` function if the layout has changed (section added / removed / etc) after Fill has been initialized:

````javascript
    //Updates the layout based on the currently visible fill components
    $("#foo-parent").fill("refresh");
````
##### Events

Fill has three events developers may listen for to take action when significant changes occur in the plugin: ````create````,
````destroy````, and ````resize````. To register listeners to these events, developers may pass in callbacks when they first apply
 the plugin to the DOM element:

 ````javascript
     $("#fill-parent").fill({
                                  create: function(evt, ui){
                                      ....
                                  },
                                  resize: function(evt, ui){
                                      ....
                                  },
                                  destroy: function(evt, ui){
                                      ....
                                  }
                             });
 ````

 Developers may also listen to the events using the standard jQuery event handling approach:

  ````javascript
      $("#fill-parent").on("fillcreate", function(evt, ui) { ... });
      $("#fill-parent").on("fillresize", function(evt, ui) { ... });
      $("#fill-parent").on("filldestroy", function(evt, ui) { ... });
  ````

The supplied ````ui```` parameter in the ````create```` and ````destroy```` events will always be an empty object. The
  ````ui```` object in the ````resize```` event will contain the new and old dimensions of the region that is changing size.
  
##### RequireJS
Fill may be loaded via RequireJS using the shim feature. Add an entry for Fill in the requirejs.config shim section as shown below. This will set jQuery as a dependency for the Fill plguin.

````javascript
    requirejs.config({
        paths : {
                  'jquery' : 'dist/jquery.min',
                  'jquery.fill' : 'dist/fill.min'
                },
        shim : {
                  'jquery.fill' : ['jquery']
               }
    });
````
To use Fill, add 'fill' to the dependency array in your module's call to ```require()``` or ````define()````.

````javascript
    require(['jquery','jquery.fill'], function($){
        $("#foo-parent").fill();
    });
````

### Copyright & License

All materials copyright &copy; 2014-2105, boundingdog, LLC. Code released under [MIT license] (LICENSE).
