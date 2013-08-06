FactorySim.module("HeaderApp.Show", function(Show, App, Backbone, Marionette, $, _){


    Show.Controller = App.Controllers.Base.extend({

        initialize: function(options){
            this.game = options.game;
            this.layout = this.getLayout();

            this.listenTo(this.layout, "show", function(){
                if(this.game){
                    this.showControls();
                }
            });

            this.show(this.layout);
        },

        showControls: function () {
            var view = new Show.ControlsView({model: this.game});

            this.listenTo(view, {
                "toggle:clock": this.onToggleClock
            });

            this.layout.controlsRegion.show(view);
        },

        onToggleClock: function () {
            App.execute("toggle:clock");
        },

        getLayout: function(){
            return new Show.Layout();
        }
    });

});