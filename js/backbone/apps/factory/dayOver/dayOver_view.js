FactorySim.module("FactoryApp.DayOver", function(DayOver, App, Backbone, Marionette, $, _){

    DayOver.ModalView = Marionette.ItemView.extend({
        template: "#day-over-template"
    });

});