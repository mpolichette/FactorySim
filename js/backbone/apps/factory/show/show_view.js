FactorySim.module("FactoryApp.Show", function(Show, App, Backbone, Marionette, $, _){

    Show.Layout = Marionette.Layout.extend({
        template: "#factory-template",
        className: "row",

        regions: {
            floorRegion: "#floor-region",
            workersRegion: "#worker-region"
        }

    });

});