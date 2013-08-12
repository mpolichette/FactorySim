FactorySim.module("FactoryMarketsApp.Show", function(Show, App, Backbone, Marionette, $, _){


    var MarketView = Marionette.ItemView.extend({
        template: "#market-template",
        className: "floor-item market span2",

        bindings: {
            ".produced": "produced",
            ".revenue": "revenue"
        },

        onRender: function() {
            this.stickit();
            var coords = App.request("resolve:coordinates", this.model.get("x"), this.model.get("y"));
            this.$el.css(coords);
        }

    });

    Show.MarketsView = Marionette.CollectionView.extend({
        itemView: MarketView
    });


});