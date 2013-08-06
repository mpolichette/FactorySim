FactorySim.module("FactoryFloorApp.Show", function(Show, App, Backbone, Marionette, $, _){

    Show.Controller = App.Controllers.Base.extend({
        initialize: function(options){
            this.game = options.game;

            this.layout = this.getFloorView(options);

            this.listenTo(this.layout, "show", function () {
                this.showResources();
                this.showJobs();
                this.showMarkets();
                this.showConnections();
            });

            this.show(this.layout);
        },

        getFloorView: function () {
            return new Show.FloorView({model: this.game});
        },

        showResources: function () {
            var view = new Show.ResourcesView({collection: this.game.resources});
            this.listenTo(view, {
                "childView:buy:resource": this.onBuy
            });
            this.layout.resourcesRegion.show(view);
        },

        onBuy: function  (view, amount) {
            var resource = view.model;
            this.game.purchase(resource, amount);
        },

        showJobs: function () {
            var view = new Show.JobsView({collection: this.game.jobs});
            this.layout.jobsRegion.show(view);

        },

        showMarkets: function () {
            var view = new Show.MarketsView({collection: this.game.markets});
            this.layout.marketsRegion.show(view);

        },

        showConnections: function () {

        }
    });

});