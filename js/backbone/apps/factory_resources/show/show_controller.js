FactorySim.module("FactoryResourcesApp.Show", function(Show, App, Backbone, Marionette, $, _){

    Show.Controller = App.Controllers.Base.extend({

        initialize: function(options) {
            this.resources = options.resources;
            var view = this.getView();
            this.show(view);
        },

        getView: function () {
            var view = new Show.ResourcesView({collection: this.resources});
            this.listenTo(view, {
                "childView:buy:resource": this.onBuy
            });
            return view;
        },

        onBuy: function  (view, amount) {
            App.vent.trigger("purchase:resource", view.model, amount);
        }
    });

});