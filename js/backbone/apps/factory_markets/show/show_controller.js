FactorySim.module("FactoryMarketsApp.Show", function(Show, App, Backbone, Marionette, $, _){

    Show.Controller = App.Controllers.Base.extend({

        initialize: function(options) {
            this.markets = options.markets;
            var view = this.getView();
            this.show(view);
        },

        getView: function () {
            var view = new Show.MarketsView({collection: this.markets});

            // Might not be the best way to do this
            view.listenTo(App.vent, "render:connections", function() {
                this.children.invoke("connectUpstreams");
            });

            return view;
        }
    });

});