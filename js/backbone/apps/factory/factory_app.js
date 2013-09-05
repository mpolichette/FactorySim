FactorySim.module("FactoryApp", function(FactoryApp, App, Backbone, Marionette, $, _){

    var API = {
        show: function(factory){
            var controller = new FactoryApp.Show.Controller({
                region: App.mainRegion,
                factory:factory
            });
        },

        dayOver: function() {
            new FactoryApp.DayOver.Controller({
                region: App.modalRegion
            });
        },

        weekOver: function() {
            new FactoryApp.WeekOver.Controller({
                region: App.modalRegion
            });
        }
    };

    App.vent.on("start:game", function(factory){
        API.show(factory);
    });

    App.vent.on("clock:day:over", function(){
        API.dayOver();
    });

    App.vent.on("clock:week:over", function(){
        API.weekOver();
    });

});
