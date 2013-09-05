FactorySim.module("WelcomeApp.Show", function(Show, App, Backbone, Marionette, $, _){

    Show.WelcomeView = Marionette.ItemView.extend({
        template: "#welcome-template",
        className: "hero-unit",
        triggers: {
            "click .js-start": "start:clicked"
        }
    });

});