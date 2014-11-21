/* global $ Math */
(function () {
    $.plot.canvasLegend = $.plot.canvasLegend || {};

    var boxLeftLabelRight = (function () {
        
        /**
         * 
         * @param {CanvasRenderingContext2D} context
         * @param {Object} fontOptions
         * @returns {undefined}
         */
        var setupCanvasForText = function(context, fontOptions){
            context.font = fontOptions.style + " " + fontOptions.variant + " " + fontOptions.weight + " " + fontOptions.size + "px '" + fontOptions.family + "'";
            context.textAlign = "left";
            context.textBaseline = "bottom";
        };
        /**
         * Estimate the height of the label. Most browsers don't implement
         * a way to calculate actual text height on the canvas.
         *
         * Font options must be set prior to invocation for accurate result
         * 
         * @param {CanvasRenderingContext2D} context
         * @returns {Number}
         */
        var calcLabelHeight = function(context){
            return context.measureText('M').width;
        };
        
        
        var PADDING = 5;
        var BOX_LABEL_SPACE = 10;
        
        var exports = {};
        exports.render = function (legendCtx, thisSeries, options, nextEntryOriginX, nextEntryOriginY, fontOptions) {
            var color = thisSeries.color;
            var label = thisSeries.label;
            setupCanvasForText(legendCtx, fontOptions);
            //calcluate label dims
            var labelHeight = calcLabelHeight(legendCtx);
            var boxSize = labelHeight;//square
            //draw box
            legendCtx.fillStyle = color;
            var boxX = nextEntryOriginX + PADDING;
            var boxY = nextEntryOriginY + PADDING;
            legendCtx.fillRect(boxX, boxY, boxSize, boxSize);
            //draw label
            legendCtx.fillStyle = "#000";
            var textX = boxX + boxSize + BOX_LABEL_SPACE;
            // for textY, we need an additional offset of labelHeight because text 
            // is drawn above and to the right of the coords passed to context.fillText
            var textY = nextEntryOriginY + PADDING  + labelHeight;
            legendCtx.fillText(label, textX, textY);
        };
        exports.size = function (legendCtx, thisSeries, options, nextEntryOriginX, nextEntryOriginY, fontOptions) {
            var label = thisSeries.label;
            setupCanvasForText(legendCtx, fontOptions);
            var labelHeight = calcLabelHeight(legendCtx);
            var labelWidth = legendCtx.measureText(label).width;
            var boxSize = labelHeight;

            return {
                width: PADDING + boxSize + BOX_LABEL_SPACE + labelWidth + PADDING,
                height: PADDING + Math.max(labelHeight, boxSize) + PADDING
            };
        };
        return exports;
    }());

    $.plot.canvasLegend.renderersAndSizers = {
        boxLeftLabelRight: boxLeftLabelRight
    };
}());