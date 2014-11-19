/* global $ document describe beforeEach afterEach expect it Math*/
$(document).ready(function () {
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
    
    describe('jquery.flot.custom-canvas-legend.js', function () {

        var customCanvasLegend, plugin, pluginName = 'custom-canvas-legend';
        //get a reference to the plugin's private methods
        for (var i = 0; i < $.plot.plugins.length; i++) {
            plugin = $.plot.plugins[i];
            if (pluginName === plugin.name) {
                customCanvasLegend = plugin;
                break;
            }
        }
        var pluginMethods = customCanvasLegend._private_methods;
        describe('simple unit tests', function(){
           describe('calculateLegendOrigin', function(){
               var margin = 1,
                    plotOffset = {top: 2, left: 3},
                    borderWidth = 3,
                    legendWidth = 4,
                    legendHeight = 5,
                    plotHeight = 6,
                    plotWidth = 7,
                    origin,
                    position;
                    
                it('should calculate the correct ne origin', function(){
                    position = 'ne';
                    origin = pluginMethods.calculateLegendOrigin(position, margin, plotOffset, borderWidth, legendWidth, legendHeight, plotWidth, plotHeight);
                    expect(origin.y).toBe(plotOffset.top + borderWidth + margin);
                    expect(origin.x).toBe(plotOffset.left + borderWidth + plotWidth - margin - legendWidth);
                });
                it('should calculate the correct nw origin', function(){
                   position = 'nw';
                   origin = pluginMethods.calculateLegendOrigin(position, margin, plotOffset, borderWidth, legendWidth, legendHeight, plotWidth, plotHeight);
                   expect(origin.y).toBe(plotOffset.top + borderWidth + margin);
                   expect(origin.x).toBe(plotOffset.left + borderWidth + margin);
                });
                it('should calculate the correct sw origin', function(){
                   position = 'sw';
                   origin = pluginMethods.calculateLegendOrigin(position, margin, plotOffset, borderWidth, legendWidth, legendHeight, plotWidth, plotHeight);
                   expect(origin.y).toBe(plotOffset.top + borderWidth + plotHeight - margin - legendHeight);
                   expect(origin.x).toBe(plotOffset.left + borderWidth + margin);
                });
                it('should calculate the correct se origin', function(){
                   position = 'se';
                   origin = pluginMethods.calculateLegendOrigin(position, margin, plotOffset, borderWidth, legendWidth, legendHeight, plotWidth, plotHeight);
                   expect(origin.y).toBe(plotOffset.top + borderWidth + plotHeight - margin - legendHeight);
                   expect(origin.x).toBe(plotOffset.left + borderWidth + plotWidth - margin - legendWidth);
                });
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
                    'width': '100%'
                });

                legendContainer = $('<canvas/>');
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
                series = [{label: 'd1', data: d1}, {label: 'd2', data: d2}, {label: 'd3', data: d3}];
                options = {
                    legend: {
                        canvas: {
                            show: true,
                            entrySize : {
                                entryHeight: 40,
                                entryWidth: 100
                            },
                            position: 'se',
                            entryLayout: function(seriesIndex, previousEntryOriginX, previousEntryOriginY, previousEntryWidth, previousEntryHeight){
                                if(0 === seriesIndex){
                                    return {
                                        nextEntryOriginX: 0,
                                        nextEntryOriginY: 0
                                    };
                                }else{
                                    return {
                                        nextEntryOriginX: previousEntryOriginX,
                                        nextEntryOriginY: previousEntryOriginY + previousEntryHeight
                                    };
                                }
                            },
                            margin: 0
                        }
                    }
                };
            };
            

            describe('getLegendContainerAndContext', function () {
                beforeEach(setupDom);
                
                it('if "container" is falsy, should return plotContext as "context", and a div of class "legend" as "container"', function () {
                    var plot = $.plot(plotContainer, series, options);
                    var plotContext = plot.getCanvas().getContext('2d');
                    var placeholder = plot.getPlaceholder();
                    var containerAndContext = pluginMethods.getLegendContainerAndContext(undefined, placeholder, plotContext);
                    var newContainer = containerAndContext.container;
                    var newContext = containerAndContext.context;
                    expect(newContext).toBe(plotContext);
                    expect(newContainer.is('div')).toBe(true);
                    expect(newContainer.hasClass('legend')).toBe(true);
                });
            });
            describe('getFontOptions', function(){
               beforeEach(setupDom);
               it("should expose the same font options as the plot's css font options", function(){
                    var plotFontOptions = {
                        style: "italic",
                        size: 11,
                        variant: "small-caps",
                        weight: "bold",
                        family: "sans-serif"
                    };
                    var fontOptionsWithPrefix = {};
                    forEachProperty(plotFontOptions, function(key, value){
                       fontOptionsWithPrefix['font-'+key] = value; 
                    });
                    plotContainer.css(fontOptionsWithPrefix);
                    
                    var plot = $.plot(plotContainer, series, options);
                    var placeholder = plot.getPlaceholder();
                    var pluginFontOptions = pluginMethods.getFontOptions(placeholder);
                    forEachProperty(plotFontOptions, function (key, value) {
                        expect(pluginFontOptions[key]).toBe(value);
                    });
                });
            });
            describe('getLegendSize', function(){
                beforeEach(setupDom);
                it('should get the correct size given a fixed entry size', function(){ 
                    var plot = $.plot(plotContainer, series, options);
                    var legendCtx = plot.getCanvas().getContext('2d');
                    var fontOptions = pluginMethods.getFontOptions(plot.getPlaceholder());
                    var size = pluginMethods.getLegendSize(options.legend.canvas.entrySize, options.legend.canvas.entryLayout, series, legendCtx, options, fontOptions);
                    expect(size.width).toBe(options.legend.canvas.entrySize.entryWidth);
                    expect(size.height).toBe(options.legend.canvas.entrySize.entryHeight*series.length);
                });
                it('should get the correct size given a dynamic entry size function', function(){ 
                    var entryWidth = 200,
                        entryHeight = 50;
                        
                    options.legend.canvas.entrySize = function(legendCtx, thisSeries, options, nextEntryOriginX, nextEntryOriginY, fontOptions){
                        var label = thisSeries.label;
                        var textWidth = legendCtx.measureText(label).width;
                        
                        //width of 'M' considered good approximation for height of tallest letter
                        //http://stackoverflow.com/a/13318387
                        //someday this hack won't be necessary when browsers implement the
                        //TextMetrics spec: https://developer.mozilla.org/en-US/docs/Web/API/TextMetrics
                        
                        var textHeight = legendCtx.measureText('M').width;
                        return {
                            entryWidth: textWidth,
                            entryHeight: textHeight
                        };
                    };
                    var plot = $.plot(plotContainer, series, options);
                    var legendCtx = plot.getCanvas().getContext('2d');
                    var fontOptions = pluginMethods.getFontOptions(plot.getPlaceholder());
                    var size = pluginMethods.getLegendSize(options.legend.canvas.entrySize, options.legend.canvas.entryLayout, series, legendCtx, options, fontOptions);
                    expect(size.width).toBe(legendCtx.measureText('d3').width);
                    expect(size.height).toBe(legendCtx.measureText('M').width * series.length);
                });
            });
        });//tests that need dom
    });//root describe block
});//document ready