FactorySim.module("Entities", function(Entities, App, Backbone, Marionette, $, _){

    Entities.Game = Backbone.Model.extend({

        defaults: {
            // Time
            started: false,
            running: false,
            speed: 2,
            day: 1,
            hour: 0,
            minute: 0,

            // Money
            cash: 12725,
            profit: 0,
            revenue: 0,
            purchaseExpense: 0,
            operatingExpense: 0
        },

        initialize: function(options){
            this.workers = App.request("new:worker:entities");
            this.resources = App.request("new:resource:entities");
            this.jobs = App.request("new:job:entities");
            this.markets = App.request("new:market:entities");
        },

        purchase: function (resource, amount) {
            var total, cash, purchased, inventory;
            total = resource.get("price") * amount;
            cash = this.get("cash");
            if(cash > total){
                resource.addInventory(amount);
                this.set({
                    "cash": cash - total,
                    "purchaseExpense": this.get("purchaseExpense") + total
                });
            } else {
                resource.set("_error", "You do not have enough cash");
            }
        },

        startClock: function () {
            this.set({
                "started": true,
                "running": true
            });
        },

        stopClock: function () {
            this.set("running", false);
        }



    });

    App.reqres.setHandler("create:new:game", function(){
        Entities.currentGame = new Entities.Game();
        return Entities.currentGame;
    });

    App.reqres.setHandler("current:game", function(){
        return Entities.currentGame;
    });

});