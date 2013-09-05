FactorySim.module("FactoryApp.WeekOver", function(WeekOver, App, Backbone, Marionette, $, _){

    WeekOver.Controller = App.Controllers.Base.extend({

        initialize: function(options) {
            this.factory = App.request("current:factory");
            var view = this.getView();
            this.show(view);
        },

        getView: function() {
            return new WeekOver.ModalView({
                model: this.factory
            });
        }

    });
});