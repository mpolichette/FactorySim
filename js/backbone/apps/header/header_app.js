FactorySim.module("HeaderApp", function(HeaderApp, App, Backbone, Marionette, $, _){
    this.startWithParent = false;

    var API = {
        show: function(game){
            new HeaderApp.Show.Controller({
                region: App.headerRegion,
                game: game
            });
        }
    };

    App.addInitializer(function(options){
        API.show();
    });

    App.vent.on("start:game", function(game){
        API.show(game);
    });

});