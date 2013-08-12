FactorySim.module("FactoryFloorApp.Show", function(Show, App, Backbone, Marionette, $, _){

    // This is kind of in an ugly area
    Show.COLLUMNS = [0, 90, 180, 270, 360, 450, 540];
    Show.ROWS = [0, 120, 240, 360, 480, 600, 720, 840];

    /**
     * FloorView is mostly a layout holder for the individual items, giving me
     * regions to use for each of my collection views.  This allows me to use
     * the built in mechanisms for view closing
     */
    Show.FloorView = Marionette.Layout.extend({
        template: "#floor-template",
        className: "floor",
        regions:{
            resourcesRegion: "#resources-region",
            jobsRegion: "#jobs-region",
            marketsRegion: "#markets-region"
        },

        /**
         * This function causes popovers to close when clicked away from them.  This
         * is not really the "Ideal" location for this, but it is quite opportune.
         */
        onRender: function () {
            $('body').on('click', function (e) {
                $('.popover').siblings().each(function () {
                    //the 'is' for buttons that trigger popups
                    //the 'has' for icons within a button that triggers a popup
                    if (!$(this).is(e.target) && $(this).has(e.target).length === 0 && $('.popover').has(e.target).length === 0) {
                        $(this).popover('hide');
                    }
                });
            });
        },
        onClose: function () {
            $('body').off('click');
        }
    });


});