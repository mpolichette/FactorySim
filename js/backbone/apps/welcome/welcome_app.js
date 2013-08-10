FactorySim.module("WelcomeApp", function(WelcomeApp, App, Backbone, Marionette, $, _){

    var API = {
        show: function(){
            var controller = new WelcomeApp.Show.Controller({
                region: App.mainRegion
            });
        },
        skip: function () {
            App.vent.trigger("new:game");
        }
    };

    WelcomeApp.Router = Marionette.AppRouter.extend({
        appRoutes: {
            "skip": "skip",
            "*anything": "show"
        }
    });

    App.addInitializer(function () {
        new WelcomeApp.Router({
            controller: API
        });
    });

});