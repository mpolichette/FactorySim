FactorySim.module("Factory", function(Factory, App, Backbone, Marionette, $, _){

    // Application Factory
    // -------------------
    // The application factory is the main application object, it its responsible
    // for holding the application objects and the application stats

    Factory.Factory = Backbone.Model.extend({

        initialize: function(attributes, options){
            _.bindAll(this);
            // Set the users
            if(options && options.users){
                this.users =options.users;
            } else {
                this.users = [];
            }


            // Start up the clock, and listen to clock events
            this.clock = new Factory.Clock();
            this.listenTo(App.vent, "clock:hourOver", this.hourlyPay, this);
            // Bind once to the clock start, to remove the first payment
            App.vent.once("clock:started", this.hourlyPay, this);
            // Listen for the end of week to push stats
            //this.listenTo(App.vent, "clock:endOfWeek", this.passStats, this);

            // Initialize the bank account
            this.bank = new App.Factory.BankAccount({cash:this.get("startingCash")});
            App.reqres.addHandler("purchase", this.makePurchase);
            App.commands.addHandler("sell", this.makeSale);

            // Hire the labor
            this.workforce = new App.Workers.WorkForce();

            // Create the positions
            this.floor = new App.Floor.Floor();

            // Create a place to store stats
            this.stats = new App.Stats.StatKeeper({}, {clock: this.clock});


        },

        defaults: {
            startingCash: 12725,

            // Local basic stats
            revenue: 0,
            inventory_sold: 0, // This is purchases as counted after a sell
            profit: 0,
            purchases: 0, // Spent on resources
            expenses: 0, // Spent on operating expenses
            totalOperatingExpenses: 10000
        },

        makePurchase: function(request){
            if (this.bank.withdraw(request.cost)){
                // Track locally
                this.set("purchases", this.get("purchases") + request.cost);
                // Log in stats
                this.stats.addPurchase(request);
                return true;
            } else {
                return false;
            }

        },

        makeSale: function(sale){
            this.bank.deposit(sale.revenue);
            // Track locally
            this.set("profit", this.get("profit") + sale.profit);
            this.set("revenue", this.get("revenue") + sale.revenue);
            this.set("inventory_sold", this.get("inventory_sold") + (sale.revenue - sale.profit));

            // Log in stats
            this.stats.addSale(sale);
        },

        hourlyPay: function(){
            // Cheating here with set numbers
            var hourlyWage = this.get("totalOperatingExpenses") / (40); // = 5 days * 8 hours
            // Check if we can remove the moneys!
            if(this.bank.withdraw(hourlyWage)){
                this.set("expenses", this.get("expenses") + hourlyWage);
                this.set("profit", this.get("profit") - hourlyWage);
            } else {
                // Can't pay employees! Sorry, you're bankrupt!
                alert("Sorry, you're bankrupt");
                App.vent.trigger("clock:pause");
                App.vent.trigger("bankrupt");
            }
        },

        passStats: function(){
            var endOfWeekStats = {
                revenue: this.get("revenue"),
                profit: this.get("profit"),
                cash: this.bank.get("cash"),
                purchases: this.get("purchases"),
                expenses: this.get("expenses")
            };
            this.stats.endOfWeek(endOfWeekStats);
        }

    });

    // Profit View
    // -----------
    Factory.ProfitView = Marionette.ItemView.extend({
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

    // Application Clock
    // -----------------
    // A very simple implementation of a ticking clock
    Factory.Clock = Backbone.Model.extend({

        initialize: function(attributes, options){
            App.vent.on("clock:start", this.start, this);
            App.vent.on("clock:pause", this.pause, this);
            App.vent.on("clock:setSpeed", this.setSpeed, this);
            App.vent.on("resetAll", this.reset, this);
        },

        defaults:{
            // State
            running: false,
            speed: 1,
            day: 1,
            hour: 0,
            minute: 0,

            //For logging
            totalSteps: 0,

            // Settings
            dayLength: 8,
            dayCount: 5
        },

        start: function(){
            if(this.has("timer")) return;
            App.vent.trigger("clock:started");
            this.set("running", true);
            this._doTimeStep();
        },

        pause: function(){
            if(this.has("timer")){
                this.set("running", false);
                App.vent.trigger("clock:paused");
                clearTimeout(this.get("timer"));
                this.unset("timer");
            }
        },

        reset: function(){
            if(this.has("timer")) clearTimeout(this.get("timer"));
            App.vent.trigger("clock:reset");
            this.set(this.defaults);
        },

        setSpeed: function(speed){
            if(speed && speed > 1){
                this.set("speed", speed);
            }
        },

        _doTimeStep: function(){
            App.vent.trigger("clock:timestep");
            this._increment_clock();

            // Keep track of timesteps
            this.set("totalSteps", this.get("totalSteps") + 1);

            // Setup next timestep
            if(this.get("running")){
                var that = this;
                var timer = setTimeout(function(){that._doTimeStep();}, 1000 / this.get("speed"));
                this.set("timer", timer);
            }
        },

        _increment_clock: function(){
            var min = this.get("minute");
            if(min < 59){
                this.set("minute", min + 1);
            }
            else{
                this.set("minute", 0);
                App.vent.trigger("clock:hourOver");
                var hour = this.get("hour");
                if(hour < this.get("dayLength") - 1){
                    this.set("hour", hour + 1);
                }
                else{
                    this.set("hour", 0);
                    this._increment_day();
                }
            }
        },

        _increment_day: function(){
            this.pause();
            App.vent.trigger("clock:dayOver", this.get("day"));

            var day =this.get("day");
            if(day < this.get("dayCount")){
                this.set("day", day + 1);
                return;
            }
            else{
                App.vent.trigger("clock:weekOver");
                alert("You have reached the end of the week!");
            }
        },

        getTimeStamp: function(){
            return {
                day: this.get("day"),
                hour: this.get("hour"),
                minute: this.get("minute"),
                totalMin: this.get("totalSteps")
            };
        }
    });

    // Application Clock View
    // ----------------------
    Factory.ClockView = Marionette.ItemView.extend({

        template: "#clock_template",
        id: "clock",
        tagName: "ul",
        className: "nav",

        events:{
            "click button": "toggleClock"
        },

        modelEvents: {
            "change:day change:hour change:minute": "_updateTime",
            "change:running": "_updateButton"
        },

        ui:{
            button: "button",
            day: ".day",
            time: ".time"
        },

        initialize: function(){
            this.listenTo(App.vent, "clock:weekOver", this._hideButton, this);
        },

        toggleClock: function(){
            if(this.model.get("running")){
                this.model.pause();
            } else {
                this.model.start();
            }
        },

        _hideButton: function(){
            this.ui.button.hide();
        },

        _updateTime: function(){
            var min = this.model.get("minute");
            if(min<10) min = "0"+min;
            this.ui.day.text(this.model.get("day"));
            this.ui.time.text(this.model.get("hour") + ":" + min);
            return this;
        },

        _updateButton: function(){
            this.ui.button.text( this.model.get("running") ? "Pause" : "Resume" );
        }
    });


    // Bank Account
    // -------
    // Bank Account holds all the details of cashflow

    Factory.BankAccount = Backbone.Model.extend({

        defaults:{
            cash: 10000
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

    Factory.BankAccountView = Marionette.Layout.extend({
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

    Factory.BankAccountDropdown = Marionette.ItemView.extend({
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


    // Factory Options View
    // --------------------

    Factory.OptionsView = Marionette.ItemView.extend({
        template: "#options_template",
        id: 'options',
        tagName: "ul",
        className: "nav",

        events:{
            "click .reset": "resetFactory"
        },

        ui:{
            speed: ".speed"
        },

        speedOptions: {
            1: 1,
            2: 2,
            3: 10,
            4: 20,
            5: 40,
            6: 80
        },

        onRender: function(){
            var that = this;
            this.$(".slider").slider({
                value: 1,
                min: 1,
                max: 6,
                step: 1,
                slide: function( event, ui ) {
                    var speed = that.speedOptions[ui.value];
                    App.vent.trigger("clock:setSpeed", speed);
                    that.ui.speed.text(speed+"x");
                }
            });
        },

        resetFactory: function(){
            App.vent.trigger("resetAll");
        }
    });

    // GamveOverView
    // ----------
    Factory.GamveOverView = Marionette.Layout.extend({
        template: "#gameover_template",
        id: "gameover",
        className: "row",

        regions: {
            statsRegion: "#statistics"
        },

        templateHelpers: {
            getFinalHeading: function(){
                if(this.profit > 0){
                    return "<h1>Congratulations!</h1><h2>You're profitable!</h2>";
                } else {
                    return "<h1>Sorry...</h1><h2>You've gone bankrupt...</h2>";
                }
            },

            getFinalMessage: function(){
                if(this.profit > 0){
                    return "Way to go! Check out some of your statistics, maybe write them down for a future resume!";
                } else {
                    return "Oh no!  Where did we go wrong? Look into these statistics and figure out what you can do better next time.";
                }
            }
          }
    });
});