FactorySim.module("FactoryWorkersApp", function(FactoryWorkersApp, App, Backbone, Marionette, $, _){

    var API = {
        showWorkers: function(options){
            var controller = new FactoryWorkersApp.Show.Controller({
                region: options.region,
                workers: options.workers
            });
        }
    };

    App.commands.setHandler("show:workers", function(options){
        API.showWorkers(options);
    });

});