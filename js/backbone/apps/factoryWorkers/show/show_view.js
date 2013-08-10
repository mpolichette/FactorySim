FactorySim.module("FactoryWorkersApp.Show", function(Show, App, Backbone, Marionette, $, _){

    Show.Layout = Marionette.ItemView.extend({
        template: "#worker-layout-template",
        className: "container"
    });

});