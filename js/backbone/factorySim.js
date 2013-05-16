window.FactorySim = (function FactorySim(Backbone, Marionette, $, _){
    var App = new Marionette.Application();

    // Debug
    App.listenTo(App.vent, "all", function(e){ console.log(e);});

    App.addRegions({
        headerRegion: "#header-region",
        mainRegion: "#main-region",
        modalRegion: {
            selector: "#modal-region",
            regionType: Marionette.Region.ModalRegion
        }
    });

    App.addInitializer(function(options){
        this.module("HeaderApp").start();
    });

    App.commands.setHandler("register:instance", function(instance, id){
        App.register(instance, id);
    });

    App.commands.setHandler("unregister:instance", function(instance, id){
        App.unregister(instance, id);
    });

    return App;
})(Backbone, Backbone.Marionette, $, _);