FactorySim.module("FactoryWorkersApp", function(FactoryWorkersApp, App, Backbone, Marionette, $, _){

    var API = {
        showWorkers: function(options){
            var controller = new FactoryWorkersApp.Show.Controller({
                region: options.region,
                factory: options.factory
            });
        }
    };

    App.commands.setHandler("show:workers", function(options){
        API.showWorkers(options);
    });

});