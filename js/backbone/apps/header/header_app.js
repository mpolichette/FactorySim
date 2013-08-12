FactorySim.module("HeaderApp", function(HeaderApp, App, Backbone, Marionette, $, _){
    this.startWithParent = false;

    var API = {
        show: function(factory){
            new HeaderApp.Show.Controller({
                region: App.headerRegion,
                factory: factory
            });
        }
    };

    App.addInitializer(function(options){
        API.show();
    });

    App.vent.on("start:game", function(factory){
        API.show(factory);
    });

});