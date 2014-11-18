/* global $ document, describe, beforeEach, afterEach, expect, it, Math*/
$(document).ready(function () {
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
        });
        describe('drawing tests', function () {
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