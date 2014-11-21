/* global $ document describe beforeEach afterEach expect it Math*/
$(document).ready(function () {

    describe('jquery.flot.canvasLegend.renderersAndSizers.js', function () {

        var customCanvasLegend, plugin, pluginName = 'canvasLegend';
        //get a reference to the plugin's private methods
        for (var i = 0; i < $.plot.plugins.length; i++) {
            plugin = $.plot.plugins[i];
            if (pluginName === plugin.name) {
                customCanvasLegend = plugin;
                break;
            }
        }
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
                'width': '300'
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
                    layout: function (seriesIndex, previousEntryOriginX, previousEntryOriginY, previousEntryWidth, previousEntryHeight) {
                        //simple vertical layout
                        var nextEntryOriginY = previousEntryOriginY + previousEntryHeight;
                        return {
                            nextEntryOriginX: previousEntryOriginX,
                            nextEntryOriginY: nextEntryOriginY
                        };
                    },
                    margin: 0
                }
            };
        };
        beforeEach(setupDom);
        it('should render box left and label right', function () {
            var boxLeftLabelRight = $.plot.canvasLegend.renderersAndSizers.boxLeftLabelRight;
            var entryRender = boxLeftLabelRight.render;
            var entrySize = boxLeftLabelRight.size;
            
            options.canvasLegend.entryRender = entryRender;
            options.canvasLegend.entrySize = entrySize;
            var plot = $.plot(plotContainer, series, options);
        });
    });//root describe block
});//document ready