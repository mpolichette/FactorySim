FactorySim.module("FactoryMarketsApp", function(FactoryMarketsApp, App, Backbone, Marionette, $, _){

    var API = {
        show: function(options){
            var controller = new FactoryMarketsApp.Show.Controller({
                region: options.region,
                markets: options.markets
            });
        }
    };

    App.commands.setHandler("show:markets", function(options){
        API.show(options);
    });


});