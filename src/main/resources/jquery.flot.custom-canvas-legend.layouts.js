(function(){
    $.plot.custom_canvas_legend = $.plot.custom_canvas_legend || {};
    function vertical (seriesIndex, previousEntryOriginX, previousEntryOriginY, previousEntryWidth, previousEntryHeight){
        //simple vertical layout
        var nextEntryOriginY = previousEntryOriginY + previousEntryHeight;
        return {
            nextEntryOriginX: previousEntryOriginX, 
            nextEntryOriginY: nextEntryOriginY
        };	
    };
    function horizontal (seriesIndex, previousEntryOriginX, previousEntryOriginY, previousEntryWidth, previousEntryHeight){
        //simple vertical layout
        var nextEntryOriginX = previousEntryOriginX + previousEntryWidth;
        return {
            nextEntryOriginX: nextEntryOriginX, 
            nextEntryOriginY: previousEntryOriginY
        };
    };
    $.plot.custom_canvas_legend.layouts = {
        vertical: vertical,
        horizontal: horizontal
    };
}());