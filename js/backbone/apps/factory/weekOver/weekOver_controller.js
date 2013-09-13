FactorySim.module("FactoryApp.WeekOver", function(WeekOver, App, Backbone, Marionette, $, _){

    WeekOver.Controller = App.Controllers.Base.extend({

        initialize: function(options) {
            this.factory = App.request("current:factory");
            var view = this.getView();
            this.show(view);
        },

        getView: function() {
            var view = new WeekOver.ModalView({
                model: this.factory
            });

            this.listenTo(view, {
                "start:over:clicked": this.onNewGame,
                "submit:clicked": this.onSubmitClicked
            });

            return view;
        },

        onNewGame: function() {
            this.region.close();
            this.close();
            App.vent.trigger("new:game");
        },

        onSubmitClicked: function() {
            App.vent.trigger("submit:scores");
        }

    });
});