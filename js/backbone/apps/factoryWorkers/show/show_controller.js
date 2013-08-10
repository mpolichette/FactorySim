FactorySim.module("FactoryWorkersApp.Show", function(Show, App, Backbone, Marionette, $, _){


    Show.Controller = App.Controllers.Base.extend({

        initialize: function (options) {
            this.game = options.game;
            var layout = this.getLayout();

            this.show(layout);
        },

        getLayout: function () {
            return new Show.Layout({collection: this.game.workers});
        }

    });

});