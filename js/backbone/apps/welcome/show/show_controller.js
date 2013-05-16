FactorySim.module("WelcomeApp.Show", function(Show, App, Backbone, Marionette, $, _){

    Show.Controller = App.Controllers.Base.extend({

        initialize: function(){
            var showView = this.getShowView();

            this.listenTo(showView, "start:clicked", function(){
                App.vent.trigger("start:clicked");
            });

            this.show(showView);
        },

        getShowView: function(){
            return new Show.WelcomeView();
        }
    });

});