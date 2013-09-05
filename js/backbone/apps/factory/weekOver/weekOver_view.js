FactorySim.module("FactoryApp.WeekOver", function(WeekOver, App, Backbone, Marionette, $, _){

    WeekOver.ModalView = Marionette.ItemView.extend({
        template: "#week-over-template"
    });

});