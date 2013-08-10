FactorySim.module("FactoryApp", function(FactoryApp, App, Backbone, Marionette, $, _){

    var API = {
        show: function(factory){
            var controller = new FactoryApp.Show.Controller({
                region: App.mainRegion,
                factory:factory
            });
        }
    };

    App.vent.on("start:game", function(factory){
        API.show(factory);
    });

});