FactorySim.module("Game", function(Game, App, Backbone, Marionette, $, _){

    this.addInitializer(function(options){
        this.listenTo(App, "startGame", function(){alert("hello!!!");});
    });
});