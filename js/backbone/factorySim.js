window.FactorySim = (function FactorySim(Backbone, Marionette, $, _){
    var App = new Marionette.Application();

    // Debug
    App.listenTo(App.vent, "all", function(){ console.log(arguments);});

    App.addRegions({
        headerRegion: "#header-region",
        mainRegion: "#main-region",
        workerRegion: "#worker-region",
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

    App.on("start", function(options){
        App.options = options;
        App.reqres.setHandler("get:app:config", function(){
            return App.options.config;
        });
        App.startHistory();
    });

    return App;
})(Backbone, Backbone.Marionette, $, _);