FactorySim.module("Game", function(Game, App, Backbone, Marionette, $, _){

    // Bank Account
    // -------
    // Bank Account holds all the details of cashflow
    Game.BankAccount = Backbone.Model.extend({

        initialize: function(){
            // Set the current cash amount to the starting cash
            this.set("cash", this.get("startingCash"));
        },

        defaults:{
            startingCash: 12725
        },

        withdraw: function(amount){
            var cur_cash = this.get("cash");
            if(cur_cash >= amount){
                this.set("cash", cur_cash - amount);
                App.vent.trigger("bank:withdraw", amount);
                return true;
            }
            else{
                return false;
            }
        },

        deposit: function(amount){
            this.set("cash", this.get("cash") + amount);
            App.vent.trigger("bank:deposit", amount);
        }
    });

    // Bank Account View
    // -----------------

    Game.BankAccountView = Marionette.Layout.extend({
        template: "#bank_template",
        id: "bank",
        tagName: "ul",
        className: "nav",

        modelEvents: {
            "change:cash": "_updateCash"
        },

        regions: {
            dropdown: {
                selector: ".dropdown-menu",
                regionType: App.ReplaceRegion
            }
        },

        _updateCash: function(){
            this.$(".cash").text("$" + this.model.get("cash"));
        }

    });

    Game.BankAccountDropdown = Marionette.ItemView.extend({
        template: "#bank-dropdown_template",
        tagName: "ul",
        className: "dropdown-menu pull-right",
        ui:{
            revenue: ".revenue",
            purchases: ".purchases",
            expenses: ".expenses",
            cash: ".cash"
        },
        modelEvents: {
            "change:revenue": "_updateRevenue",
            "change:purchases": "_updatePurchases",
            "change:expenses": "_updateExpenses",
            "change": "_updateCash"
        },

        _updateRevenue: function(){
            this.ui.revenue.text(this.model.get("revenue"));
        },

        _updatePurchases: function(){
            this.ui.purchases.text(this.model.get("purchases"));
        },

        _updateExpenses: function(){
            this.ui.expenses.text(this.model.get("expenses"));
        },

        _updateCash: function(){
            this.ui.cash.text(this.model.bank.get("cash"));
        }

    });

    // Profit View
    // -----------
    Game.ProfitView = Marionette.ItemView.extend({
        template: "#profit_template",
        id: "clock",
        tagName: "ul",
        className: "nav",

        ui: {
            profit: ".profit",
            revenue: ".revenue",
            inventory_sold: ".inventory-sold",
            expenses: ".expenses"
        },

        modelEvents: {
            "change:profit": "_updateProfit",
            "change:revenue": "_updateRevenue",
            "change:inventory_sold": "_updateInventorySold",
            "change:expenses": "_updateExpenses"
        },

        _updateProfit: function(){
            var profit = this.model.get("profit");
            if (profit >= 0){
                this.ui.profit.text("$" + this.model.get("profit"));
            } else {
                this.ui.profit.text("$(" + Math.abs(this.model.get("profit")) + ")");

            }
        },

        _updateRevenue: function(){
            this.ui.revenue.text(this.model.get("revenue"));
        },

        _updateInventorySold: function(){
            this.ui.inventory_sold.text(this.model.get("inventory_sold"));
        },

        _updateExpenses: function(){
            this.ui.expenses.text(this.model.get("expenses"));
        }

    });

});