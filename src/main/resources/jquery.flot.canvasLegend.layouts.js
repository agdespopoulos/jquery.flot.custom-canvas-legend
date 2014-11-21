(function(){
    "use strict";
    $.plot.canvasLegend = $.plot.custom_canvas_legend || {};
    /**
     * 
     * @param {Number} seriesIndex
     * @param {Number} previousEntryOriginX
     * @param {Number} previousEntryOriginY
     * @param {Number} previousEntryWidth
     * @param {Number} previousEntryHeight
     * @returns {Object} - {nextEntryOriginX: {Number}, nextEntryOriginY: {Number}}
     */
    function vertical (seriesIndex, previousEntryOriginX, previousEntryOriginY, previousEntryWidth, previousEntryHeight){
        //simple vertical layout
        var nextEntryOriginY = previousEntryOriginY + previousEntryHeight;
        return {
            nextEntryOriginX: previousEntryOriginX, 
            nextEntryOriginY: nextEntryOriginY
        };	
    };
    /**
     * 
     * @param {Number} seriesIndex
     * @param {Number} previousEntryOriginX
     * @param {Number} previousEntryOriginY
     * @param {Number} previousEntryWidth
     * @param {Number} previousEntryHeight
     * @returns {Object} - {nextEntryOriginX: {Number}, nextEntryOriginY: {Number}}
     */
    function horizontal (seriesIndex, previousEntryOriginX, previousEntryOriginY, previousEntryWidth, previousEntryHeight){
        //simple vertical layout
        var nextEntryOriginX = previousEntryOriginX + previousEntryWidth;
        return {
            nextEntryOriginX: nextEntryOriginX, 
            nextEntryOriginY: previousEntryOriginY
        };
    };
    $.plot.canvasLegend.layouts = {
        vertical: vertical,
        horizontal: horizontal
    };
}());