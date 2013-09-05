FactorySim.module("FactoryApp.DayOver", function(DayOver, App, Backbone, Marionette, $, _){

    DayOver.Controller = App.Controllers.Base.extend({

        initialize: function(options) {
            this.factory = App.request("current:factory");
            var view = this.getStatsView();
            this.show(view);
        },

        getStatsView: function() {
            return new DayOver.ModalView({
                model: this.factory
            });
        }

    });


});