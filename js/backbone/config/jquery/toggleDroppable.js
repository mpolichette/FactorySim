(function($, _){

    $.fn.toggleDropOnMe = function(obj, init) {
        // Allow obj = false
        if(_.isBoolean(obj)){
            init = obj,
            obj = {};
        }
        obj || (obj = {});

        if(_.isUndefined(init)) init = true;

        _.defaults(obj, {
            className: 'is-drop-active',
            backgroundColor: "white",
            opacity: 0.6,
            text: "Place Here"
        });

        var $offset = this.offset(),
            $width = this.width(),
            $height = this.height();

        if(init){
            $("<div>", {
                'class': obj.className,
                'data-dropOnMe': true,
                text: obj.text
            }).css({
                width: $width,
                height: $height,
                top: $offset.top + 2,
                left: $offset.left + 2,
                position: "absolute",
                lineHeight: $height+"px",
                opacity: obj.opacity,
                //zIndex: obj.zIndex + 1,
                backgroundColor: obj.backgroundColor
            }).appendTo("body");
        } else {
            $("[data-dropOnMe]").remove();
        }
        return this;
    };

})($, _);


    // $.fn.toggleWrapper = (obj = {}, init = true) ->
    //     _.defaults obj,
    //         className: ""
    //         backgroundColor: if @css("backgroundColor") isnt "transparent" then @css("backgroundColor") else "white"
    //         zIndex: if @css("zIndex") is "auto" or 0 then 1000 else (Number) @css("zIndex")

    //     $offset = @offset()
    //     $width  = @outerWidth(false)
    //     $height = @outerHeight(false)

    //     if init
    //         $("<div>")
    //             .appendTo("body")
    //                 .addClass(obj.className)
    //                     .attr("data-wrapper", true)
    //                         .css
    //                             width: $width
    //                             height: $height
    //                             top: $offset.top
    //                             left: $offset.left
    //                             position: "absolute"
    //                             zIndex: obj.zIndex + 1
    //                             backgroundColor: obj.backgroundColor
    //     else
    //         $("[data-wrapper]").remove()