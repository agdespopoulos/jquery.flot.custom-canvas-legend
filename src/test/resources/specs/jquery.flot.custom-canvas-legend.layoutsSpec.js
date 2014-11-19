/* global $ document describe beforeEach afterEach expect it Math*/
$(document).ready(function () {

    describe('jquery.flot.custom-canvas-legend.layouts.js', function () {

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

        var setupDom = function () {
            plotContainer = $('<div></div>').css({
                'height': '300px',
                'width': '500px'
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
                    canvas: {
                        show: true,
                        entrySize: {
                            height: 40,
                            width: 100
                        },
                        position: 'se',
                        layout: function (seriesIndex, previousEntryOriginX, previousEntryOriginY, previousEntryWidth, previousEntryHeight) {
                            return {
                                nextEntryOriginX: previousEntryOriginX,
                                nextEntryOriginY: previousEntryOriginY + previousEntryHeight
                            };
                        },
                        entryRender: function (legendCtx, thisSeries, options, nextEntryOriginX, nextEntryOriginY, fontOptions) {
                            legendCtx.font = fontOptions.style + " " + fontOptions.variant + " " + fontOptions.weight + " " + fontOptions.size + "px '" + fontOptions.family + "'";
                            legendCtx.fillStyle = thisSeries.color;
                            var charHeight = legendCtx.measureText('M').width;
                            legendCtx.fillRect(nextEntryOriginX, nextEntryOriginY, charHeight, legendCtx.measureText(thisSeries.label).width);
                            legendCtx.fillStyle = "#000";
                            legendCtx.fillText(thisSeries.label, nextEntryOriginX, nextEntryOriginY + charHeight);
                        },
                        margin: 0
                    }
                }
            };
        };
        beforeEach(setupDom);

    });//root describe block
});//document ready