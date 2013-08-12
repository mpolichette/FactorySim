FactorySim.module("FactoryFloorApp.Show", function(Show, App, Backbone, Marionette, $, _){


    var MarketView = Marionette.ItemView.extend({
        template: "#market-template",
        className: "floor-item market span2",

        bindings: {
            ".produced": "produced",
            ".revenue": "revenue"
        },

        onRender: function() {
            this.stickit();
            this.$el.css({
                left: Show.COLLUMNS[this.model.get("x")],
                top: Show.ROWS[this.model.get("y")]
            });
        }

    });


    // Make the Market View a floor item
    // There's gotta be a better place for this
    _.extend(MarketView, App.Views.FloorItemMixin);

    Show.MarketsView = Marionette.CollectionView.extend({
        itemView: MarketView
    });


});