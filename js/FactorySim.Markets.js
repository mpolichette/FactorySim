FactorySim.module("Game", function(Game, App, Backbone, Marionette, $, _){

    Game.Market = Game.FloorItem.extend({
        __name__: "Market",
        initialize:function(){
            this.listenTo(App.vent, "clock:timestep", this.doTimeStep, this);
        },

        defaults:{
            demand: 0,
            produced: 0,
            unitPrice: 0,
            unitProfit: 0,
            revenue: 0
        },

        doTimeStep: function(){
            if(this.has("source") && this.get("source").hasInventory()){
                this.get("source").takeInventory();
                this.set("produced", this.get("produced") + 1);
                if(this.get("produced") <= this.get("demand")){
                    var sale = {
                        market: this,
                        revenue: this.get("unitPrice"),
                        profit: this.get("unitProfit")
                    };
                    App.execute("sell", sale);
                    this.set("revenue", this.get("revenue") + this.get("unitPrice"));
                }
            }
        }
    });


    Game.MarketCollection = Game.FloorItemCollection.extend({
        model: Game.Market
    });


    Game.MarketView = Marionette.ItemView.extend({
        template: "#market_template",
        id: function(){ return this.model.cid; },
        className: "market clearfix",

        ui:{
            produced: ".produced",
            revenue: ".revenue"
        },

        modelEvents: {
            "change:produced": "_updateProduced",
            "change:revenue": "_updateRevenue"
        },

        onRender: function(){
            this.$el.css('left', this.model.get('x'));
            this.$el.css('top', this.model.get('y'));

        },

        _updateProduced: function(){
            this.ui.produced.text(this.model.get("produced"));
        },

        _updateRevenue: function(){
            this.ui.revenue.text("$" + this.model.get("revenue"));
        }
    });

});