FactorySim.module("FactoryFloorApp", function(FactoryFloorApp, App, Backbone, Marionette, $, _){

    var API = {
        showFloor: function(game){
            var controller = new FactoryFloorApp.Show.Controller({
                region: App.mainRegion,
                game:game
            });
        }
    };

    App.vent.on("start:game", function(game){
        API.showFloor(game);
    });


});