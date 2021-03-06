/* global $ document describe beforeEach afterEach expect it Math*/
$(document).ready(function () {
    "use strict";

    describe('jquery.flot.canvasLegend.layouts.js', function () {
        
        var customCanvasLegend, plugin, pluginName = 'canvasLegend';
        //get a reference to the plugin's private methods
        $.each($.plot.plugins, function(index,plugin){
            if (pluginName === plugin.name) {
                customCanvasLegend = plugin;
                return false;//break
            }
        });
        /**
         * 
         * @param {Number} n - number of additional series to add
         * @param {Array} series
         * @returns {Array} series with 'n' more series added onto it
         */
        var addNMoreSeries = function(numAdditionalSeries, series){
            var mySeries = [].concat(series);
            
            for(var i = 0; i < numAdditionalSeries; i++){
                mySeries.push({label: 'additional_' + i, data: [[0+i, 1], [1+i, 3], [2+i, 5], [3+i, 7],[3+i, 11]]});
            };
            return mySeries;
        };
        var pluginMethods = customCanvasLegend._private_methods;


        var legendContainer, plotContainer, series, options;
        var setupDom = function () {
            plotContainer = $('<div></div>').css({
                'height': '300px',
                'width': '500px',
                'display': 'inline-block'
            });

            legendContainer = $('<canvas/>').css({
                'display': 'inline'
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
            series = [{label: 'd1', data: d1}, {label: 'd2', data: d2}, {label: 'd3', data: d3}];
            options = {
                legend: {
                    show: false
                },
                canvasLegend: {
                        show: true,
                        entrySize: {
                            height: 50,
                            width: 50
                        },
                        container: legendContainer,
                        entryRender: function (legendCtx, thisSeries, options, nextEntryOriginX, nextEntryOriginY, fontOptions, maxEntryWidth, maxEntryHeight) {
                            legendCtx.font = fontOptions.style + " " + fontOptions.variant + " " + fontOptions.weight + " " + fontOptions.size + "px '" + fontOptions.family + "'";
                            legendCtx.fillStyle = thisSeries.color;
                            var charHeight = legendCtx.measureText('M').width;
                            legendCtx.fillRect(nextEntryOriginX, nextEntryOriginY, maxEntryWidth, maxEntryHeight);
                            legendCtx.fillStyle = "#000";
                            legendCtx.fillText(thisSeries.label, nextEntryOriginX, nextEntryOriginY + charHeight);
                        },
                        margin: 0
                }
            };
        };
        beforeEach(setupDom);
        it('should lay out horizontally', function(){
            var horizontal = $.plot.canvasLegend.layouts.horizontal;
            var previousEntryOriginX = 0,
                previousEntryOriginY = 0,
                previousEntryWidth = 10,
                previousEntryHeight = 20;
            var nextEntryOrigin = horizontal(0,previousEntryOriginX, previousEntryOriginY, previousEntryWidth, previousEntryHeight);
            expect(nextEntryOrigin.nextEntryOriginX).toBe(previousEntryOriginX + previousEntryWidth);
            expect(nextEntryOrigin.nextEntryOriginY).toBe(previousEntryOriginY);
            //plot it for show
            options.canvasLegend.layout = horizontal;
            var plot = $.plot(plotContainer, series, options);
        });
        it('should lay out vertically', function(){
            var vertical = $.plot.canvasLegend.layouts.vertical;
            var previousEntryOriginX = 0,
                previousEntryOriginY = 0,
                previousEntryWidth = 42,
                previousEntryHeight = 92;
            var nextEntryOrigin = vertical(0,previousEntryOriginX, previousEntryOriginY, previousEntryWidth, previousEntryHeight);
            expect(nextEntryOrigin.nextEntryOriginX).toBe(previousEntryOriginX);
            expect(nextEntryOrigin.nextEntryOriginY).toBe(previousEntryOriginY + previousEntryHeight);
            //plot it for show
            options.canvasLegend.layout = vertical;
            var plot = $.plot(plotContainer, series, options);
        });
        var justTextSize = function (legendCtx, thisSeries, options, fontOptions) {
            legendCtx.font = fontOptions.style + " " + fontOptions.variant + " " + fontOptions.weight + " " + fontOptions.size + "px '" + fontOptions.family + "'";
            var label = thisSeries.label;
            var labelHeight = legendCtx.measureText('M').width;
            var labelWidth = legendCtx.measureText(label).width;

            return {
                width: labelWidth,
                height: labelHeight
            };
        };
        it('should lay out in a 2-column table', function(){
            var mySeries = addNMoreSeries(5, series);
            
            var twoColumnedTable = $.plot.canvasLegend.layouts.tableWithNColumns(2);
            var previousEntryOriginX = 0,
                previousEntryOriginY = 0,
                previousEntryWidth = 42,
                previousEntryHeight = 92,
                maxEntryHeight = 31,
                maxEntryWidth = 27;
            var nextEntryOrigin =  twoColumnedTable(0,previousEntryOriginX, previousEntryOriginY, previousEntryWidth, previousEntryHeight, maxEntryWidth, maxEntryHeight);
            expect(nextEntryOrigin.nextEntryOriginX).toBe(previousEntryOriginX);
            expect(nextEntryOrigin.nextEntryOriginY).toBe(previousEntryOriginY);
            
            nextEntryOrigin =  twoColumnedTable(1,previousEntryOriginX, previousEntryOriginY, previousEntryWidth, previousEntryHeight, maxEntryWidth, maxEntryHeight);
            expect(nextEntryOrigin.nextEntryOriginX).toBe(previousEntryOriginX + maxEntryWidth);
            expect(nextEntryOrigin.nextEntryOriginY).toBe(previousEntryOriginY);
            nextEntryOrigin =  twoColumnedTable(2,previousEntryOriginX, previousEntryOriginY, previousEntryWidth, previousEntryHeight, maxEntryWidth, maxEntryHeight);
            expect(nextEntryOrigin.nextEntryOriginX).toBe(previousEntryOriginX);
            expect(nextEntryOrigin.nextEntryOriginY).toBe(previousEntryOriginY + maxEntryHeight);
            //plot it for show
            options.canvasLegend.entrySize = justTextSize;
            options.canvasLegend.layout = twoColumnedTable;
            var plot = $.plot(plotContainer, mySeries, options);
        });
        it('should lay out in a 3-column table', function(){
            var mySeries = addNMoreSeries(7, series);
            
            var threeColumnTable = $.plot.canvasLegend.layouts.tableWithNColumns(3);
            var previousEntryOriginX = 0,
                previousEntryOriginY = 0,
                previousEntryWidth = 42,
                previousEntryHeight = 92,
                maxEntryHeight = 31,
                maxEntryWidth = 27;
            var nextEntryOrigin =  threeColumnTable(0,previousEntryOriginX, previousEntryOriginY, previousEntryWidth, previousEntryHeight, maxEntryWidth, maxEntryHeight);
            expect(nextEntryOrigin.nextEntryOriginX).toBe(previousEntryOriginX);
            expect(nextEntryOrigin.nextEntryOriginY).toBe(previousEntryOriginY);
            
            nextEntryOrigin =  threeColumnTable(1,previousEntryOriginX, previousEntryOriginY, previousEntryWidth, previousEntryHeight, maxEntryWidth, maxEntryHeight);
            expect(nextEntryOrigin.nextEntryOriginX).toBe(previousEntryOriginX + maxEntryWidth);
            expect(nextEntryOrigin.nextEntryOriginY).toBe(previousEntryOriginY);
            nextEntryOrigin =  threeColumnTable(2,previousEntryOriginX, previousEntryOriginY, previousEntryWidth, previousEntryHeight, maxEntryWidth, maxEntryHeight);
            expect(nextEntryOrigin.nextEntryOriginX).toBe(previousEntryOriginX + 2*maxEntryWidth);
            expect(nextEntryOrigin.nextEntryOriginY).toBe(previousEntryOriginY);
            
            nextEntryOrigin =  threeColumnTable(3,previousEntryOriginX, previousEntryOriginY, previousEntryWidth, previousEntryHeight, maxEntryWidth, maxEntryHeight);
            expect(nextEntryOrigin.nextEntryOriginX).toBe(previousEntryOriginX);
            expect(nextEntryOrigin.nextEntryOriginY).toBe(previousEntryOriginY + maxEntryHeight);
            
            //plot it for show
            options.canvasLegend.entrySize = justTextSize;
            options.canvasLegend.layout = threeColumnTable;
            var plot = $.plot(plotContainer, mySeries, options);
        });
       
    });//root describe block
});//document ready