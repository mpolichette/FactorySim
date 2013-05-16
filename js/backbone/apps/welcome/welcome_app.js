FactorySim.module("WelcomeApp", function(WelcomeApp, App, Backbone, Marionette, $, _){

    var Router = Marionette.AppRouter.extend({
        appRoutes: {
            "" : "show"
        }
    });

    var API = {
        show: function(){
            var controller = new WelcomeApp.Show.Controller({
                region: App.mainRegion
            });

        }

    };

    WelcomeApp.addInitializer(function(options){
        API.show();
    });

    App.addInitializer(function(){
        var router = new Router({
            controller: API
        });
    });

});