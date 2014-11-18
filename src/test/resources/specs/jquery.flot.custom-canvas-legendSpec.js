/* global $ document, describe, beforeEach, afterEach, expect, it, Math*/
$(document).ready(function () {
    /**
     * @param {Array} array any array
     * @param {String} propertyName property name
     * @returns {Array}  of the values in the 'propertyName' property of each object in 'array'
     */
    function pluck(array, propertyName){
        var values = [];
        for(var i = 0; i < array.length; i++){
            values.push(array[i][propertyName]);
        }
        return values;
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
        describe('tests that need canvas', function () {
            var legendContainer, plotContainer, data, options;
            beforeEach(function () {
                plotContainer = $('<div></div>').css({
                    'height': '300px',
                    'width': '100%'
                });

                legendContainer = $('<canvas/>');
                $('body').append(plotContainer);
                $('body').append(legendContainer);
                var d1 = [];
                for (var i = 0; i < 14; i += 0.5) {
                    d1.push([i, Math.sin(i)]);
                }

                var d2 = [[0, 3], [4, 8], [8, 5], [9, 13]];

                // A null signifies separate line segments

                var d3 = [[0, 12], [7, 12], null, [7, 2.5], [12, 2.5]];
                data = [d1, d2, d3];
                options = {
                    legend: {
                        canvas: {
                        }
                    }
                };
                $.plot(plotContainer, data, options);
            });

            describe('drawing legend on canvas', function () {
                it('should draw the legend on canvas', function () {
//                    expect(true).toBe(false);
                });
            });

            afterEach(function () {
                plotContainer.remove();
                legendContainer.remove();
            });
        });


    });
});