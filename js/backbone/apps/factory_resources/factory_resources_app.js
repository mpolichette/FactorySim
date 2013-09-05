FactorySim.module("FactoryResourcesApp", function(FactoryResourcesApp, App, Backbone, Marionette, $, _){

    var API = {
        show: function(options){
            var controller = new FactoryResourcesApp.Show.Controller({
                region: options.region,
                resources: options.resources
            });
        }
    };

    App.commands.setHandler("show:resources", function(options){
        API.show(options);
    });


});