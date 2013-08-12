FactorySim.module("FactoryMarketsApp.Show", function(Show, App, Backbone, Marionette, $, _){

    Show.Controller = App.Controllers.Base.extend({

        initialize: function(options) {
            this.markets = options.markets;
            var view = this.getView();
            this.show(view);
        },

        getView: function () {
            return new Show.MarketsView({collection: this.markets});
        }
    });

});