FactorySim.module("FactoryApp.WeekOver", function(WeekOver, App, Backbone, Marionette, $, _){

    WeekOver.ModalView = Marionette.ItemView.extend({
        template: "#week-over-template",

        modal: {
            backdrop: "static"
        },

        triggers: {
            "click .js-start-over": "start:over:clicked",
            "click .js-submit": "submit:clicked"
        }
    });

});