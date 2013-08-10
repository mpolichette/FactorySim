FactorySim.module("FactoryWorkersApp", function(FactoryWorkersApp, App, Backbone, Marionette, $, _){

    var API = {
        showWorkers: function(game){
            var controller = new FactoryWorkersApp.Show.Controller({
                region: App.workerRegion,
                game:game
            });
        }
    };

    App.vent.on("start:game", function(game){
        API.showWorkers(game);
    });

});