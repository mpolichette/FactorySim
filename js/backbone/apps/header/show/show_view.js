FactorySim.module("HeaderApp.Show", function(Show, App, Backbone, Marionette, $, _){

    Show.Header = Marionette.ItemView.extend({
        template: "#header-template"
    });

});