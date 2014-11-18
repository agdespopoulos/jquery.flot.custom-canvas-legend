/* global $ document, describe, beforeEach, afterEach, expect, it, Math*/
$(document).ready(function () {
    describe('jquery.flot.custom-canvas-legend.js', function () {
        var legendContainer, plotContainer, data, options;
        var customCanvasLegend, plugin, pluginName = 'custom-canvas-legend';
        for(var i = 0; i < $.plot.plugins.length; i++){
            plugin = $.plot.plugins[i];
            if(pluginName === plugin.name){
                customCanvasLegend = plugin;
                break;
            }
        }
        
        beforeEach(function () {
            plotContainer = $('<div></div>').css({
                'height' : '300px',
                'width':'100%'
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
                legend:{
                        canvas:{
                            
                        }
                }
            };
            $.plot(plotContainer, data, options);
        });

        describe('drawing legend on canvas', function(){
            it('should draw the legend on canvas', function(){
               expect(true).toBe(false); 
            });
        });

        afterEach(function () {
            plotContainer.remove();
            legendContainer.remove();
        });
    });
});