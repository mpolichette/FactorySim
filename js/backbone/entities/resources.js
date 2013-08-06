FactorySim.module("Entities", function(Entities, App, Backbone, Marionette, $, _){

    Entities.Resource = Backbone.Model.extend({
        defaults:{
            price: 1,
            inventory: 0,
            purchased: 0
        },

        addInventory: function(amount){
            this.set({
                "purchased": this.get("purchased") + amount,
                "inventory": this.get("inventory") + amount
            });
        }
    });

    Entities.ResourceCollection = Backbone.Collection.extend({
        model: Entities.Resource
    });

    var API = {
        newResources: function(){
            return new Entities.ResourceCollection(App.options.config.resources);
        }
    };

    App.reqres.setHandler("new:resource:entities", function(){
        return API.newResources();
    });
});