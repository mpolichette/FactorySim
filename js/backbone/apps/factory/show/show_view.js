FactorySim.module("FactoryApp.Show", function(Show, App, Backbone, Marionette, $, _){

    Show.Layout = Marionette.Layout.extend({
        template: "#factory-template",
        className: "row",

        regions: {
            workersRegion: "#worker-region",
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