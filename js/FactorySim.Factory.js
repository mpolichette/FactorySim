FactorySim.module("Game", function(Game, App, Backbone, Marionette, $, _){

    // Application Factory
    // -------------------
    // The application factory is the main application object, it its responsible
    // for holding the application objects and the application stats

    Game.Factory = Marionette.Controller.extend({

        initialize: function(options){
            // Create the floor
            this.floor = new Backbone.Collection();

            // Get all the floor items which make a factory
            // (Silent is false so that the reset gets called )
            this.resources = new Game.ResourceCollection(options.resources, {floor: this.floor});
            this.jobs = new Game.JobCollection(options.jobs, {floor: this.floor});
            this.markets = new Game.MarketCollection(options.markets, {floor: this.floor});

            // And the employees!
            this.workforce = new Game.WorkForce(options.workers, {
                clock: options.clock
            });
        },



            // _.bindAll(this);

            // this.listenTo(App.vent, "clock:hourOver", this.hourlyPay, this);
            // // Bind once to the clock start, to remove the first payment
            // App.vent.once("clock:started", this.hourlyPay, this);
            // // Listen for the end of week to push stats
            // //this.listenTo(App.vent, "clock:endOfWeek", this.passStats, this);

            // // Initialize the bank account
            // this.bank = new App.Factory.BankAccount({cash:this.get("startingCash")});
            // App.reqres.addHandler("purchase", this.makePurchase);
            // App.commands.addHandler("sell", this.makeSale);

            // // Hire the labor
            // this.workforce = new App.Workers.WorkForce();

            // // Create the positions
            // this.floor = new App.Floor.Floor();

            // // Create a place to store stats
            // this.stats = new App.Stats.StatKeeper({}, {clock: this.clock});



        // defaults: {
        //     inventory_sold: 0, // This is purchases as counted after a sell
        // },

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


    Game.FactoryView = Marionette.CollectionView.extend({

    });


    // Factory Options View
    // --------------------

    Game.OptionsView = Marionette.ItemView.extend({
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
    Game.GamveOverView = Marionette.Layout.extend({
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