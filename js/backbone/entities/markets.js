FactorySim.module("Entities", function(Entities, App, Backbone, Marionette, $, _){

    Entities.Market = Backbone.Model.extend({
        defaults:{
            demand: 0,
            produced: 0,
            unitPrice: 0,
            revenue: 0
        },

        initialize: function () {
            // Once the game starts, request your upstream connections.
            this.listenTo(App.vent, "start:game", this.connectUpstreams);
        },

        connectUpstreams: function (game) {
            if(!this.has("upstream")) return;
            var upstreams = [];
            _.each(this.get("upstream"), function (upstreamId) {
                // Most likely the upstream will be another job...
                var upstream = game.getFloorItem(upstreamId);
                if(!upstream) throw new Error("Upstream identity could not be resolved.");
                upstreams.push(upstream);
            }, this);
            this.upstreams = new Backbone.Collection(upstreams);
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