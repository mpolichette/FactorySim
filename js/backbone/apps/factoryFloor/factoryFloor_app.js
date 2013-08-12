FactorySim.module("FactoryFloorApp", function(FactoryFloorApp, App, Backbone, Marionette, $, _){

    var API = {
        showFloor: function(options){
            var controller = new FactoryFloorApp.Show.Controller({
                region: options.region,
                factory: options.factory
            });
        }
    };

    App.commands.setHandler("show:floor", function(options){
        API.showFloor(options);
    });


});