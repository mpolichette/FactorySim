FactorySim.module("Game", function(Game, App, Backbone, Marionette, $, _){


    Game.Resource = Game.FloorItem.extend({
        __name__: "Resource",

        defaults:{
            price: 1,
            inventory: 0,
            purchased: 0
        },

        buy: function(amount){
            var value = this.get('price') * amount;

            // Create the purchase request
            var request = {
                resource: this,
                quantity: amount,
                cost: value
            };

            var purchaseMade = App.request("purchase", request);

            if(purchaseMade){
                // Add to inventory
                var current_inventory = this.get("inventory");
                this.set("inventory", current_inventory + amount);
                // Add to purchased
                var current_purchased = this.get("purchased");
                this.set("purchased", current_purchased + amount);
                return true;
            }
            else{
                return false;
            }
        },

        hasInventory:function(){
            var inventory = this.get("inventory");
            if(inventory > 0) return true;
            else return false;
        },
        takeInventory:function(){
            var inventory = this.get("inventory");
            if(inventory > 0){
                this.set("inventory", inventory - 1);
                return true;
            }
            else return false;
        }
    });

    Game.ResourceCollection = Game.FloorItemCollection.extend({
        model: Game.Resource
    });


    Game.ResourceView = Marionette.ItemView.extend({
        template: "#resource_template",

        className: "resource clearfix",

        id: function(){ return this.model.cid; },

        ui: {
            inventory: ".inventory",
            purchased: ".purchased"
        },

        modelEvents:{
            "change:inventory": "_updateInventory",
            "change:purchased": "_updatePurchased"
        },

        events:{
            "click button": "buy"
        },

        onRender: function(){
            this.$el.css('left', this.model.get('x'));
            this.$el.css('top', this.model.get('y'));
        },
        buy: function(event){
            var amount = $(event.target).data("amount");
            if(!this.model.buy(amount)){
                alert("Failed to purchase "+ amount + ".  Do you have enough money?");
            }
        },

        _updateInventory: function(){
            this.ui.inventory.text(this.model.get("inventory"));
        },

        _updatePurchased: function(){
            this.ui.purchased.text(this.model.get("purchased"));
        }
    });
});