/* global jQuery Math */
//based on https://raw.githubusercontent.com/lukesampson/flot/5922045d8bc233073ef3d102703aa74a037c7e54/jquery.flot.legendoncanvas.js
/**
 * user specifies canvas legend configuration by modifying the canvasLegend options object
 * {
 * .
 * .
 * .
 * canvasLegend: {
 * 			show: optional boolean, defaulting to true
 * 			position: "ne" or "nw" or "se" or "sw". Ignored if "container" option is specified.
 * 			entrySize: {width: Number, height: Number} or (function(legendCtx, series, options, entryOriginX, entryOriginY, fontOptions)->{width:Number, height:Number}).
 * 					If a function, the function is called on each entry. The plugin uses this information to calculate the width of the overall legend.
 * 			margin: optional number of pixels or [x margin, y margin]. Ignored if "container" option is specified.
 * 			container: optional jQuery object wrapping a canvas element, or an actual canvas element, or null, defaulting to null.
 * 					If null, legend will be drawn on the plot's canvas. Else, legend will be drawn in the specified canvas and the "margin" and "position" options will be ignored.
 * 			sorted: optional null, false, true, "ascending", "descending", "reverse", or (function(seriesA, seriesB)->Number), defaulting to null.
 * 					If null or false, series are displayed in whatever order flot provides. If a function, the function is used to sort the order 
 * 					in which the series' legend entries are passed to the "render" function based on whether the function returns a positive or negative number.
 * 
 *   				Legend entries appear in the same order as their series by default. If "sorted" is "reverse" then they appear in the opposite order from their series. To sort them alphabetically, you can specify true, "ascending" or "descending", where true and "ascending" are equivalent.
 *   
 * 			layout: optional (function(seriesIndex, previousEntryOriginX, previousEntryOriginY, previousEntryWidth, previousEntryHeight)->{nextEntryOriginX: Number, nextEntryOriginY: Number}) or null, defaulting to null.
 * 					If null, a vertical layout will be used. If a function, the resulting object's properties will be passed as entryOriginX and entryOriginY to the "render" function.
 * 			background: optional String color or (function(legendCtx, legendOriginX, legendOriginY, legendWidth, legendHeight)), defaulting to white.
 * 			entryRender: optional (function(legendCtx, series, options, entryOriginX, entryOriginY, fontOptions)->undefined), or null, defaulting to null.
 * 					If a function, the function is called to perform custom rendering of the legend entry for each series. 
 * 					The plugin calculates the coordinates for the origin of the current legend entry and passes them to the function. 
 * 					If null, a box matching the color of the series is drawn to the left of the series text in 13 pt font.
 * 			
 * 		}
 * }
 * 
 * example:
 * 
 *      canvasLegend: {
 * 			show: true,
 * 			entrySize: function(legendCtx, series, options, entryOriginX, entryOriginY, fontOptions){
 * 					//assume constant symbol width and height
 * 					var symbolWidth = 40;
 * 					var symbolHeight = 15;
 * 
 * 					var textWidth = legendCtx.measureText(label).width;
 * 					var textHeight = legendCtx.meaureText('M').width;
 * 					var entryWidth = symbolWidth + textWidth;
 * 					var entryHeight = Math.max(symbolHeight, textHeight);
 * 
 * 					
 * 					return {width:entryWidth, height:entryHeight};
 * 				  },
 * 			container: $('#myCanvas'),
 * 			sorted: function(seriesA, seriesB){.
 * 				if(seriesA.text > seriesB.text){
 * 					return 1;
 * 				}
 * 				else{
 *					return -1; 
 * 				}
 * 			}		  
 * 			layout: function(seriesIndex, previousEntryOriginX, previousEntryOriginY, previousEntryWidth, previousEntryHeight){
 *				 //simple vertical layout
 *				var nextEntryOriginY = previousEntryOriginY + previousEntryHeight; 
 * 				return {nextEntryOriginX: previousEntryOriginX, nextEntryOriginY: nextEntryOriginY};
 * 			}
 * 			entryRender: function(legendCtx, series, options, entryOriginX, entryOriginY, fontOptions){
 *				legendCtx.fillStyle = series.someProperty.indicating.theSeries.color;
 *				var symbolHeight = 15;
 *				var symbolWidth = 40; 
 *				legendCtx.fillRect(entryOriginX, entryOriginY, symbolWidth, symbolHeight);
 *				legendCtx.legendCtx.fillText(series.text, entryOriginX + symbolWidth, entryOriginY + symbolHeight);
 * 			}
 * 		}
 * }
 * 
 */

(function ($) {

    function init(plot) {
        plot.hooks.processOptions.push(addLastDrawHook);
    }

    function addLastDrawHook(plot) {
        plot.hooks.draw.push(drawLegend);
    }
    function defaultRender(legendCtx, series, options, entryOriginX, entryOriginY, fontOptions) {
        legendCtx.font = fontOptions.style + " " + fontOptions.variant + " " + fontOptions.weight + " " + fontOptions.size + "px '" + fontOptions.family + "'";
        legendCtx.textAlign = "left";
        legendCtx.textBaseline = "bottom";
        legendCtx.fillStyle = "#F00";
    }
    function defaultLayout(seriesIndex, previousEntryOriginX, previousEntryOriginY, previousEntryHeight, previousEntryWidth) {
        var LEGEND_BOX_WIDTH = 22; // color box
        var PADDING_RIGHT = 5;
        var LEGEND_BOX_LINE_HEIGHT = 18;
    }
    function ascendingAlphabeticalSort(seriesA, seriesB) {
        var value = seriesA.label > seriesB.label ? 1 : -1;
        return value;
    }
    function getFontOptions(placeholder) {
        return {
            style: placeholder.css("font-style"),
            size: Math.round(+placeholder.css("font-size").replace("px", "") || 13),
            variant: placeholder.css("font-variant"),
            weight: placeholder.css("font-weight"),
            family: placeholder.css("font-family")
        };
    }
    function getLegendContainerAndContext(container, placeholder, plotContext) {
        var finalContainer, finalContext;
        if (container) {
            if (container.is('canvas')) {
                finalContainer = container;
            }
            else {
                finalContainer = $('<canvas/>');
                container.append(finalContainer);
            }
            finalContext = $(finalContainer)[0].getContext('2d');
        } else {
            finalContainer = $(plotContext.canvas);
            finalContext = plotContext;
        }
        return {
            container: finalContainer,
            context: finalContext
        };
    }
    function getSortedSeries(sortedOption, series) {
        var sortedSeries;
        if (sortedOption) {
            if (true === sortedOption || 'ascending' === sortedOption) {
                sortedSeries = series.sort(ascendingAlphabeticalSort);
            }
            else if ('descending' === sortedOption) {
                sortedSeries = series.sort(ascendingAlphabeticalSort).reverse();
            }
            else if ('reverse' === sortedOption) {
                sortedSeries = series.reverse();
            }
            else if ('function' === typeof sortedOption) {
                sortedSeries = series.sort(sortedOption);
            }
            else {
                throw Error('Unrecognized value for "sorted" option: ' + sortedOption);
            }
        } else {
            sortedSeries = series;
        }
        return sortedSeries;
    }
    function getLegendSize(entrySize, layout, sortedSeries, legendCtx, options, fontOptions) {
        var seriesIndex;
        var legendWidth = 0;
        var legendHeight = 0;
        var previousEntryOriginX = 0,
                previousEntryOriginY = 0,
                previousEntryWidth = 0,
                previousEntryHeight = 0,
                nextEntryOrigin,
                nextEntryOriginX,
                nextEntryOriginY,
                entryWidth,
                entryHeight,
                potentialXExtremity,
                potentialYExtremity,
                thisEntrySize,
                thisSeries;

        if ('function' === typeof entrySize) {

            for (seriesIndex = 0; seriesIndex < sortedSeries.length; seriesIndex++) {
                thisSeries = sortedSeries[seriesIndex];
                if(0 === seriesIndex){
                    nextEntryOrigin = {
                        nextEntryOriginX : previousEntryOriginX,
                        nextEntryOriginY : previousEntryOriginY,
                    };
                }
                else{
                    nextEntryOrigin = layout(seriesIndex, previousEntryOriginX, previousEntryOriginY, previousEntryWidth, previousEntryHeight);
                }
                
                nextEntryOriginX = nextEntryOrigin.nextEntryOriginX;
                nextEntryOriginY = nextEntryOrigin.nextEntryOriginY;
                thisEntrySize = entrySize(legendCtx, thisSeries, options, nextEntryOriginX, nextEntryOriginY, fontOptions);
                entryWidth = thisEntrySize.width;
                entryHeight = thisEntrySize.height;
                potentialXExtremity = nextEntryOriginX + entryWidth;
                potentialYExtremity = nextEntryOriginY + entryHeight;
                legendWidth = potentialXExtremity > legendWidth ? potentialXExtremity : legendWidth;
                legendHeight = potentialYExtremity > legendHeight ? potentialYExtremity : legendHeight;
                previousEntryOriginX = nextEntryOriginX;
                previousEntryOriginY = nextEntryOriginY;
                previousEntryWidth = entryWidth;
                previousEntryHeight = entryHeight;
            }
        }
        else if ('number' === typeof entrySize.height && 'number' === typeof entrySize.width) {
            for (seriesIndex = 0; seriesIndex < sortedSeries.length; seriesIndex++) {
                entryWidth = entrySize.width;
                entryHeight = entrySize.height;
                if(0 === seriesIndex){
                    nextEntryOrigin = {
                        nextEntryOriginX : previousEntryOriginX,
                        nextEntryOriginY : previousEntryOriginY,
                    };
                }
                else{
                    nextEntryOrigin = layout(seriesIndex, previousEntryOriginX, previousEntryOriginY, previousEntryWidth, previousEntryHeight);
                }
                nextEntryOriginX = nextEntryOrigin.nextEntryOriginX;
                nextEntryOriginY = nextEntryOrigin.nextEntryOriginY;
                potentialXExtremity = nextEntryOriginX + entryWidth;
                potentialYExtremity = nextEntryOriginY + entryHeight;
                legendWidth = potentialXExtremity > legendWidth ? potentialXExtremity : legendWidth;
                legendHeight = potentialYExtremity > legendHeight ? potentialYExtremity : legendHeight;
                previousEntryOriginX = nextEntryOriginX;
                previousEntryOriginY = nextEntryOriginY;
                previousEntryWidth = entryWidth;
                previousEntryHeight = entryHeight;
            }
        }
        else {
            throw Error('Unrecognized value for "entrySize" option: ' + entrySize);
        }
        return {
            height: legendHeight,
            width: legendWidth
        };
    }
    // draws the legend on the canvas, using the HTML added by flot as a guide
    function drawLegend(plot, plotCtx) {
        var options = plot.getOptions();
        if (!(options.canvasLegend && options.canvasLegend.show)){
            return;
        }
        var placeholder = plot.getPlaceholder();
        var fontOptions = getFontOptions(placeholder);
        var entryRender = options.canvasLegend.entryRender || defaultRender;
        var layout = options.canvasLegend.layout || defaultLayout;

        var containerOption = options.canvasLegend.container;
        var containerAndContext = getLegendContainerAndContext(containerOption, placeholder, plotCtx);
        var container = containerAndContext.container;
        //the legendCtx will either be plotCtx or the context from an external canvas,
        //depending on what is contained in canvas.container
        var legendCtx = containerAndContext.context;
        var isExternalLegend = legendCtx === plotCtx ? false : true;

        var series = plot.getData();
        var plotOffset = plot.getPlotOffset();
        var plotHeight = plot.height();
        var plotWidth = plot.width();

        var sortedSeries = getSortedSeries(options.canvasLegend.sorted, series);

        var entrySize = options.canvasLegend.entrySize;
        var layout = options.canvasLegend.layout;

        var legendSize = getLegendSize(entrySize, layout, sortedSeries, legendCtx, options, fontOptions);

        var legendWidth = legendSize.width;
        var legendHeight = legendSize.height;


        var legendOrigin, legendOriginX, legendOriginY;

        if (options.canvasLegend.position && !options.canvasLegend.container) {
            legendOrigin = calculateLegendOrigin(options.canvasLegend.position, options.canvasLegend.margin, plotOffset, options.grid.borderWidth, legendWidth, legendHeight, plotWidth, plotHeight);
            legendOriginX = legendOrigin.x;
            legendOriginY = legendOrigin.y;
        }
        else {
            legendOriginX = 0;
            legendOriginY = 0;
        }

        //color background

        //first save context state
        var oldGlobalAlpha = legendCtx.globalAlpha;
        var oldFillStyle = legendCtx.fillStyle;

        //render background
        legendCtx.globalAlpha = options.legend.backgroundOpacity;
        legendCtx.fillStyle = options.canvasLegend.backgroundColor || '#fff';
        legendCtx.fillRect(legendOriginX, legendOriginY, legendWidth, legendHeight);

        //restore previous context state
        legendCtx.globalAlpha = oldGlobalAlpha;
        legendCtx.fillStyle = oldFillStyle;

        //now do actual rendering of legend entries
        var previousEntryOriginX = legendOriginX,
                previousEntryOriginY = legendOriginY,
                previousEntryWidth = 0,
                previousEntryHeight = 0,
                nextEntryOrigin,
                nextEntryOriginX,
                nextEntryOriginY,
                seriesIndex,
                thisSeries,
                thisEntrySize,
                entryWidth,
                entryHeight;

        for (seriesIndex = 0; seriesIndex < sortedSeries.length; seriesIndex++) {
            thisSeries = sortedSeries[seriesIndex];
            nextEntryOrigin = layout(seriesIndex, previousEntryOriginX, previousEntryOriginY, previousEntryWidth, previousEntryHeight);
            nextEntryOriginX = nextEntryOrigin.nextEntryOriginX;
            nextEntryOriginY = nextEntryOrigin.nextEntryOriginY;

            entryRender(legendCtx, thisSeries, options, nextEntryOriginX, nextEntryOriginY, fontOptions);
            thisEntrySize = 'function' === typeof entrySize ? entrySize(legendCtx, thisSeries, options, nextEntryOriginX, nextEntryOriginY, fontOptions) : entrySize;
            entryWidth = thisEntrySize.width;
            entryHeight = thisEntrySize.height;
            previousEntryOriginX = nextEntryOriginX;
            previousEntryOriginY = nextEntryOriginY;
            previousEntryWidth = entryWidth;
            previousEntryHeight = entryHeight;
        }

//		var num_labels = 0;
//		var s, label;
//		// get width of legend and number of valid legend entries
//		for(var i = 0; i < series.length; ++i) {
//			s = series[i];
//			label = s.label;
//			if(!label) continue;
//			num_labels++;
//			labelWidth = legendCtx.measureText(label).width;
//                        if(options.legend.horizontal){
//                            legendWidth+=labelWidth;
//                        }else {
//                            if(labelWidth > legendWidth) legendWidth = labelWidth}
//		}
//
//                if (options.legend.horizontal){
//                    legendWidth = legendWidth + num_labels*(LEGEND_BOX_WIDTH + PADDING_RIGHT);
//                    legendHeight = LEGEND_BOX_LINE_HEIGHT;
//                }else {
//                    legendWidth = legendWidth + LEGEND_BOX_WIDTH + PADDING_RIGHT;
//                    legendHeight = num_labels * LEGEND_BOX_LINE_HEIGHT;
//                }
//		
//		var x, y;
//		if(isExternalLegend) {
//			x = 0
//			y = 0;
//		} else {
//			
//			if(options.legend.backgroundOpacity != 0.0) {
//				var c = options.legend.backgroundColor;
//				if(c == null) c = options.grid.backgroundColor;
//				if(c && typeof c == "string") {
//					legendCtx.globalAlpha = options.legend.backgroundOpacity;
//					legendCtx.fillStyle = c;
//					legendCtx.fillRect(x, y, legendWidth, legendHeight);
//					legendCtx.globalAlpha = 1.0;
//				}
//			}
//		}
//		var posx=x+2, posy;
//		for(var i = 0; i < series.length; ++i) {
//			s = series[i];
//			if (options.legend.horizontal){
//	            posy = y+2;
//			}else{
//	           posx=x;
//	           posy = y + (i * 18);
//			}
//			boxLegend(legendCtx, s, options, posx, posy, lf, fontOptions);
//			if (options.legend.horizontal){
//	            posx = posx +  legendCtx.measureText(label).width+PADDING_RIGHT;
//	        }
//		}
//		if(!isExternalLegend){
//			container.hide(); // hide the HTML version
//		}
    }
    /**
     * @param position {String}, one of (ne, nw, se, sw)
     * @param margin {Array|Number}, if array, must have exactly two elements, both of type Number
     * @param plotOffset {Object}, must have two properties of name "top" and "left", both having values of type Number
     * @param borderWidth {Number}
     * @param legendWidth {Number}
     * @param legendHeight {Number}
     * @param plotWidth {Number}
     * @param plotHeight {Number}
     * @returns {x: Number, y:Number}
     */
    function calculateLegendOrigin(position, margin, plotOffset, borderWidth, legendWidth, legendHeight, plotWidth, plotHeight) {
        var x,y;
        if (margin[0] == null)
            margin = [margin, margin];
        if (position.charAt(0) === "n") {
            y = Math.round(plotOffset.top + borderWidth + margin[1]);
        }
        else if (position.charAt(0) === "s") {
            y = Math.round(plotOffset.top + borderWidth + plotHeight - margin[0] - legendHeight);
        }
        else {
            throw Error('Unrecognized value for "position" option: ' + position);
        }
        if (position.charAt(1) === "e") {
            x = Math.round(plotOffset.left + borderWidth + plotWidth - margin[0] - legendWidth);
        }
        else if (position.charAt(1) === "w") {
            x = Math.round(plotOffset.left + borderWidth + margin[0]);
        }
        else {
            throw Error('Unrecognized value for "position" option: ' + position);
        }
        return {x: x, y: y};
    }
    /**
     * @returns [Number, Number] - an array [the width of the drawn legend entry, and the height of the drawn legend entry]
     */
    function boxLegend(legendCtx, series, options, posx, posy, labelFormatter, fontOptions) {
        var label = series.label;
        if (!label)
            return;
        if (lf)
            label = labelFormatter(label, series);


        legendCtx.fillStyle = options.legend.labelBoxBorderColor;
        legendCtx.fillRect(posx, posy, 18, 14);
        legendCtx.fillStyle = "#FFF";
        legendCtx.fillRect(posx + 1, posy + 1, 16, 12);
        legendCtx.fillStyle = s.color;
        posx = posx + 22;
        posy = posy + f.size + 2;

        legendCtx.fillStyle = options.legend.color;
        legendCtx.fillText(label, posx, posy);
    }

    $.plot.plugins.push({
        init: init,
        options: {},
        name: 'custom-canvas-legend',
        version: '0.1',
        _private_methods: {
            calculateLegendOrigin: calculateLegendOrigin,
            getFontOptions: getFontOptions,
            getSortedSeries: getSortedSeries,
            getLegendContainerAndContext: getLegendContainerAndContext,
            getLegendSize: getLegendSize
        }
    });
    
//    $.plot.custom_canvas_legend = {
//        layout : {
//            vertical : function(){
//                
//            }
//        },
//        entrySize : {
//            default: function(){
//                    
//            }
//        }
//    };
    
})(jQuery);