FactorySim.module("FactoryFloorApp.Show", function(Show, App, Backbone, Marionette, $, _){


    var MarketView = Show.FloorItem.extend({
        template: "#market-template",
        className: "floor-item market span2",

        bindings: {
            ".produced": "produced",
            ".revenue": "revenue"
        }

    });

    Show.MarketsView = Marionette.CollectionView.extend({
        itemView: MarketView
    });


});