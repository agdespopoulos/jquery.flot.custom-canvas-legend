/* global $ document describe beforeEach afterEach expect it Math CanvasRenderingContext2D*/
$(document).ready(function () {
    "use strict";
    /**
     * @param {Array} array any array
     * @param {String} propertyName property name
     * @returns {Array}  of the values in the 'propertyName' property of each object in 'array'
     */
    function pluck(array, propertyName){
        var values = [];
        $.each(array, function(index, value){
            values.push(value[propertyName]);
        });
        return values;
    }
    
    /**
     * Provide a shim for pre-ECMAScript 5 browsers that do not have Object.keys and Array.forEach
     * Do not enumerate properties inherited in the prototype
     * @param {Object} object
     * @param {function} callback accepting two arguments - {String} property name, and {Any} propertyValue
     * @returns {undefined}
     */
    function forEachProperty(object, callback){
        var key, value;
        for (key in object) {
            if (Object.prototype.hasOwnProperty.call(object, key)) {
                value = object[key];
                callback.call(object, key, value);
            }
        }
    }
    
    describe('jquery.flot.canvasLegend.js', function () {

        var customCanvasLegend, plugin, pluginName = 'canvasLegend';
        //get a reference to the plugin's private methods
        $.each($.plot.plugins, function(index,plugin){
            if (pluginName === plugin.name) {
                customCanvasLegend = plugin;
                return false;//break
            }
        });
        var pluginMethods = customCanvasLegend._private_methods;
        describe('simple unit tests', function(){
           describe('calculateLegendOrigin', function(){
               var getMargins = function(margin){
                    var marginX, marginY;
                    margin = margin || 0;
                    if (null == margin[0]) {
                        marginX = marginY = margin;
                    }
                    else {
                        marginX = margin[0];
                        marginY = margin[1];
                    }
                    return {
                        x: marginX,
                        y: marginY
                    };
               };
               var plausibleMargins = [undefined, null, 0, 1, [0,1],[2,3]];
               /**
                * Helper function to DRY testing
                * @param {Function} toRun - called with three args - margin, marginX, marginY
                *   Only pass 'margin' to calculateLegendOrign; don't pass marginX or marginY.
                * @returns {undefined}
                */
               var runWithPlausibleMargins = function(toRun){
                   var plausibleMargin;
                   $.each(plausibleMargins, function(index, plausibleMargin){
                       var margins = getMargins(plausibleMargin);
                       toRun(plausibleMargin, margins.x, margins.y);
                   });
               };
               var plotOffset = {top: 2, left: 3},
                    borderWidth = 3,
                    legendWidth = 4,
                    legendHeight = 5,
                    plotHeight = 6,
                    plotWidth = 7,
                    origin,
                    position;
                    
                it('should calculate the correct ne origin', runWithPlausibleMargins(function(margin, marginX, marginY){
                    position = 'ne';
                    origin = pluginMethods.calculateLegendOrigin(position, margin, plotOffset, borderWidth, legendWidth, legendHeight, plotWidth, plotHeight);
                    expect(origin.y).toBe(plotOffset.top + borderWidth + marginY);
                    expect(origin.x).toBe(plotOffset.left + borderWidth + plotWidth - marginX - legendWidth);
                }));
                it('should calculate the correct nw origin', runWithPlausibleMargins(function(margin, marginX, marginY){
                   position = 'nw';
                   origin = pluginMethods.calculateLegendOrigin(position, margin, plotOffset, borderWidth, legendWidth, legendHeight, plotWidth, plotHeight);
                   expect(origin.y).toBe(plotOffset.top + borderWidth + marginY);
                   expect(origin.x).toBe(plotOffset.left + borderWidth + marginX);
                }));
                it('should calculate the correct sw origin', runWithPlausibleMargins(function(margin, marginX, marginY){
                   position = 'sw';
                   origin = pluginMethods.calculateLegendOrigin(position, margin, plotOffset, borderWidth, legendWidth, legendHeight, plotWidth, plotHeight);
                   expect(origin.y).toBe(plotOffset.top + borderWidth + plotHeight - marginY - legendHeight);
                   expect(origin.x).toBe(plotOffset.left + borderWidth + marginX);
                }));
                it('should calculate the correct se origin', runWithPlausibleMargins(function(margin, marginX, marginY){
                   position = 'se';
                   origin = pluginMethods.calculateLegendOrigin(position, margin, plotOffset, borderWidth, legendWidth, legendHeight, plotWidth, plotHeight);
                   expect(origin.y).toBe(plotOffset.top + borderWidth + plotHeight - marginY - legendHeight);
                   expect(origin.x).toBe(plotOffset.left + borderWidth + plotWidth - marginX - legendWidth);
                }));
           });
           describe('getSortedSeries', function(){
                var series;
                beforeEach(function(){
                    series = [{label: 'a'}, {label: 'c'}, {label: 'b'}];
                });
                var labelsAsString = function(series){
                    return pluck(series, 'label').join('');
                };
                
                it('should sort ascending when sorted=true', function(){
                    var sorted = pluginMethods.getSortedSeries(true, series);
                    expect(labelsAsString(sorted)).toBe('abc');
                });
                it('should sort ascending when sorted=ascending', function(){
                    var sorted = pluginMethods.getSortedSeries('ascending', series);
                    expect(labelsAsString(sorted)).toBe('abc');
                });
                it('should sort descending when sorted=descending', function(){
                    var sorted = pluginMethods.getSortedSeries('descending', series);
                    expect(labelsAsString(sorted)).toBe('cba');
                });
                it('should not sort when sorted=false', function(){
                    var sorted = pluginMethods.getSortedSeries(false, series);
                    expect(labelsAsString(sorted)).toBe('acb');
                });
                it('should not sort when sorted=null', function(){
                    var sorted = pluginMethods.getSortedSeries(null, series);
                    expect(labelsAsString(sorted)).toBe('acb');
                });
                it('should not sort when sorted=undefined', function(){
                    var sorted = pluginMethods.getSortedSeries(undefined, series);
                    expect(labelsAsString(sorted)).toBe('acb');
                });
                it('should reverse the original order when sorted=reverse', function(){
                    var sorted = pluginMethods.getSortedSeries('reverse', series);
                    expect(labelsAsString(sorted)).toBe('bca');
                });
                it('should support custom sorting', function(){
                    
                    var orderMap = {
                        'b': 0,
                        'a': 1,
                        'c': 2
                    };
                    
                    var sorted = pluginMethods.getSortedSeries(function(a, b){
                        var aIndex = orderMap[a.label];
                        var bIndex = orderMap[b.label];
                        return aIndex - bIndex;
                    }, series);
                    
                    expect(labelsAsString(sorted)).toBe('bac');
                });
           });
        });
        describe('tests that need the dom', function () {
            var legendContainer, plotContainer, series, options;
            var setupDom = function () {
                plotContainer = $('<div></div>').css({
                    'height': '300px',
                    'width': '500px'
                });

                legendContainer = $('<canvas/>').css({
                    'display': 'none'
                }).attr({
                    'height': '300',
                    'width': '500'
                });
                $('body').append('<h2>' + this.description + '</h2>');
                $('body').append(plotContainer);
                $('body').append(legendContainer);
                var d1 = [];
                for (var i = 0; i < 14; i += 0.5) {
                    d1.push([i, Math.sin(i)]);
                }

                var d2 = [[0, 3], [4, 8], [8, 5], [9, 13]];

                // A null signifies separate line segments

                var d3 = [[0, 12], [7, 12], null, [7, 2.5], [12, 2.5]];
                series = [{label: 'd1', data: d1}, {label: 'dTwo', data: d2}, {label: 'd the third', data: d3}];
                options = {
                    legend: {
                        show: false
                    },
                    canvasLegend: {
                        show: true,
                        entrySize : {
                            height: 40,
                            width: 100
                        },
                        position: 'se',
                        layout: function(seriesIndex, previousEntryOriginX, previousEntryOriginY, previousEntryWidth, previousEntryHeight){
                            return {
                                nextEntryOriginX: previousEntryOriginX,
                                nextEntryOriginY: previousEntryOriginY + previousEntryHeight
                            };
                        },
                        entryRender: function(legendCtx, thisSeries, options, nextEntryOriginX, nextEntryOriginY, fontOptions){
                            legendCtx.font = fontOptions.style + " " + fontOptions.variant + " " + fontOptions.weight + " " + fontOptions.size + "px '" + fontOptions.family + "'";
                            legendCtx.fillStyle = thisSeries.color;
                            var charHeight = legendCtx.measureText('M').width;
                            legendCtx.fillRect(nextEntryOriginX, nextEntryOriginY, charHeight, legendCtx.measureText(thisSeries.label).width);
                            legendCtx.fillStyle = "#000";
                            legendCtx.fillText(thisSeries.label, nextEntryOriginX, nextEntryOriginY + charHeight);
                        },
                        margin: 0
                    }
                };
            };
            

            describe('getLegendContainerAndContext', function () {
                beforeEach(setupDom);
                
                it('if "container" is falsy, should return plotContext as "context", and the plot\'s canvas wrapped in jQuery as "container"', function () {
                    var plot = $.plot(plotContainer, series, options);
                    var plotCanvas = plot.getCanvas();
                    var plotContext = plotCanvas.getContext('2d');
                    var containerAndContext = pluginMethods.getLegendContainerAndContext(undefined, plotContext);
                    var newContainer = containerAndContext.container;
                    var newContext = containerAndContext.context;
                    expect(newContext).toBe(plotContext);
                    expect(newContainer[0]).toBe(plotCanvas);
                });
                it('if "container" is a jQuery-wrapped canvas, it should return the canvas\' 2d context as "context" and the same jquery-wrapped canvas as "container"', function(){
                    legendContainer.css('display', '');
                    options.canvasLegend.container = legendContainer;
                    var legendContext = legendContainer[0].getContext('2d');
                    var plot = $.plot(plotContainer, series, options);
                    var plotContext = plot.getCanvas().getContext('2d');
                    var containerAndContext = pluginMethods.getLegendContainerAndContext(legendContainer, plotContext);
                    var newContainer = containerAndContext.container;
                    var newContext = containerAndContext.context;
                    expect(newContext).not.toBe(plotContext);
                    expect(newContext).toBe(legendContext);
                    expect(newContainer.is('div')).toBe(false);
                    expect(newContainer.is('canvas')).toBe(true);
                    expect(newContainer).toBe(legendContainer);
                    expect(newContainer.hasClass('legend')).toBe(false);
                });
                it('if "container" is a non-canvas jQuery-wrapped element, it should create a canvas inside of "container", it should return the new canvas\' 2d context as "context" and the newly-created canvas as "container"', function(){
                    legendContainer = $('<div></div>');
                    legendContainer.insertAfter(plotContainer);
                    options.canvasLegend.container = legendContainer;
                    var plot = $.plot(plotContainer, series, options);
                    var plotContext = plot.getCanvas().getContext('2d');
                    var containerAndContext = pluginMethods.getLegendContainerAndContext(legendContainer, plotContext);
                    var newContainer = containerAndContext.container;
                    var newContext = containerAndContext.context;
                    expect(newContext).not.toBe(plotContext);
                    expect(newContext instanceof CanvasRenderingContext2D).toBe(true);
                    expect(newContainer.is('div')).toBe(false);
                    expect(newContainer.is('canvas')).toBe(true);
                    //the newContainer's parent should be the original 'container' parameter
                    expect(newContainer.parent()[0]).toBe(legendContainer[0]);
                });
            });
            describe('getFontOptions', function(){
                beforeEach(setupDom);
                var plotFontOptions = {
                    style: "italic",
                    size: 23,
                    variant: "small-caps",
                    weight: "bold",
                    family: "sans-serif"
                };
                var fontOptionsWithPrefix = {};
                forEachProperty(plotFontOptions, function (key, value) {
                    fontOptionsWithPrefix['font-' + key] = value;
                });
                it("should return the same font options as the plot's css font options if the user does not define any font options", function(){
                    plotContainer.css(fontOptionsWithPrefix);
                    var plot = $.plot(plotContainer, series, options);
                    var placeholder = plot.getPlaceholder();
                    var pluginFontOptions = pluginMethods.getFontOptions(placeholder);
                    forEachProperty(plotFontOptions, function (key, value) {
                        expect(pluginFontOptions[key]).toBe(value);
                    });
                });
                it("should return the user's font options if the user specifies every possible font option", function(){
                   plotContainer.css(fontOptionsWithPrefix);
                   var legendFontOptions = {
                        style: "normal",
                        size: 42,
                        variant: "normal",
                        weight: "normal",
                        family: '"Times New Roman"'
                   };
                   options.canvasLegend.font = legendFontOptions;
                   
                   var plot = $.plot(plotContainer, series, options);
                   var placeholder = plot.getPlaceholder();
                   var returnedFontOptions = pluginMethods.getFontOptions(placeholder, legendFontOptions);
                   forEachProperty(returnedFontOptions, function(key, value){
                      expect(legendFontOptions[key]).toBe(value);
                   });
                });
                it("should return a mixture of the user's font options and the plot's options if the user does not specify all possible font options", function(){
                   plotContainer.css(fontOptionsWithPrefix);
                   var legendFontOptions = {
                        style: "normal",
                        size: 42,
                        weight: "normal"
                   };
                   options.canvasLegend.font = legendFontOptions;
                   
                   var plot = $.plot(plotContainer, series, options);
                   var placeholder = plot.getPlaceholder();
                   var returnedFontOptions = pluginMethods.getFontOptions(placeholder, legendFontOptions);
                   forEachProperty(returnedFontOptions, function(key, value){
                      if('undefined' === typeof legendFontOptions[key]){
                          expect(plotFontOptions[key]).toBe(value);
                      }
                      else{
                          expect(legendFontOptions[key]).toBe(value);
                      }
                   });
                });
                
            });
            describe('getLegendSize', function(){
                beforeEach(setupDom);
                it('should get the correct size given a fixed entry size', function(){ 
                    var plot = $.plot(plotContainer, series, options);
                    var legendCtx = plot.getCanvas().getContext('2d');
                    var fontOptions = pluginMethods.getFontOptions(plot.getPlaceholder());
                    var size = pluginMethods.getLegendSize(options.canvasLegend.entrySize, options.canvasLegend.layout, series, legendCtx, options, fontOptions);
                    expect(size.width).toBe(options.canvasLegend.entrySize.width);
                    expect(size.height).toBe(options.canvasLegend.entrySize.height*series.length);
                });
                it('should get the correct size given a dynamic entry size function', function(){ 
                        
                    options.canvasLegend.entrySize = function(legendCtx, thisSeries, options, nextEntryOriginX, nextEntryOriginY, fontOptions){
                        var label = thisSeries.label;
                        var textWidth = legendCtx.measureText(label).width;
                        
                        //width of 'M' considered good approximation for height of tallest letter
                        //http://stackoverflow.com/a/13318387
                        //someday this hack won't be necessary when browsers implement the
                        //TextMetrics spec: https://developer.mozilla.org/en-US/docs/Web/API/TextMetrics
                        
                        var textHeight = legendCtx.measureText('M').width;
                        return {
                            width: textWidth,
                            height: textHeight
                        };
                    };
                    var plot = $.plot(plotContainer, series, options);
                    var legendCtx = plot.getCanvas().getContext('2d');
                    var fontOptions = pluginMethods.getFontOptions(plot.getPlaceholder());
                    var size = pluginMethods.getLegendSize(options.canvasLegend.entrySize, options.canvasLegend.layout, series, legendCtx, options, fontOptions);
                    var longestLabel = '';
                    $.each(series, function(index, oneSeries){
                       longestLabel = oneSeries.label.length > longestLabel.length ? oneSeries.label : longestLabel;                       
                    });
                    expect(size.width).toBe(legendCtx.measureText(longestLabel).width);
                    expect(size.height).toBe(legendCtx.measureText('M').width * series.length);
                });
            });
        });//tests that need dom
    });//root describe block
});//document ready