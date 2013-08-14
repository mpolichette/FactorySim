FactorySim.module("FactoryMarketsApp.Show", function(Show, App, Backbone, Marionette, $, _){


    var MarketView = Marionette.ItemView.extend({
        mixins: ["floor-item"],
        template: "#market-template",
        className: "floor-item market span2",

        bindings: {
            ".produced": "produced",
            ".revenue": "revenue"
        },

        onRender: function() {
            this.stickit();
        }

    });

    Show.MarketsView = Marionette.CollectionView.extend({
        itemView: MarketView
    });


});