FactorySim.module("Entities", function(Entities, App, Backbone, Marionette, $, _){

    Entities.Market = Backbone.Model.extend({
        defaults:{

        }
    });

    Entities.MarketCollection = Backbone.Collection.extend({
        model: Entities.Market
    });

    var API = {
        newMarkets: function(){
            return new Entities.MarketCollection(App.options.config.markets);
        }
    };

    App.reqres.setHandler("new:market:entities", function(){
        return API.newMarkets();
    });
});