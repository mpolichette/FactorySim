window.FactorySim = (function FactorySim(Backbone, Marionette, $, _){
    var App = new Marionette.Application();

    // Debug
    App.listenTo(App.vent, "all", function(){ console.log(arguments);});

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

    App.on("start", function(options){
        App.options = options;
        App.reqres.setHandler("get:app:config", function(){
            return App.options.config;
        });
        App.startHistory();
    });

    // This is kind of in an ugly area
    var COLLUMNS = [0, 90, 180, 270, 360, 450, 540],
        ROWS = [0, 120, 240, 360, 480, 600, 720, 840];

    App.reqres.setHandler("resolve:coordinates", function(x, y) {
        return { top: ROWS[y], left: COLLUMNS[x] };
    });


    return App;
})(Backbone, Backbone.Marionette, $, _);