FactorySim.module("Sim", function(Sim, App, Backbone, Marionette, $, _){

    Sim.Router = Marionette.AppRouter.extend({
        appRoutes:{
            "": "start"
        }
    });

    Sim.Controller = Marionette.Controller.extend({

        initialize: function(options){
            App.users = new App.Account.Users({});
            this.singinRegion = options.welcomeRegion;
        },

        start:function(){
            this.signIn = _.bind(this.signIn, this);
            $(".begin").on("click", this.signIn);
        },

        signIn: function(){
            var signInView = new App.Account.SignInView({collection: App.users});
            this.singinRegion.show(signInView);
            this.listenTo(signInView, "startGame", this._newGame);
        },

        _newGame:function(){
            App.factory = new App.Factory.Factory(options);
            // Show the clock
            var clockView = new App.Factory.ClockView({model:App.factory.clock});
            App.clockRegion.show(clockView);

            // Show the bank
            var bankView = new App.Factory.BankAccountView({model: App.factory.bank});
            App.bankRegion.show(bankView);
            var bankDropdown = new App.Factory.BankAccountDropdown({model: App.factory});
            bankView.dropdown.show(bankDropdown);

            // Show the profit
            var profitView = new App.Factory.ProfitView({model: App.factory});
            App.profitRegion.show(profitView);

            // Show the options
            var optionsView = new App.Factory.OptionsView();
            App.optionsRegion.show(optionsView);

            var floorView = new App.Floor.FloorView({collection: App.factory.floor});
            App.mainRegion.show(floorView);

            // Show the workforce
            var WFview = new App.Workers.WorkforceView({collection: App.factory.workforce});
            App.workforceRegion.show(WFview);

            // Listen for end of the week event
            this.listenTo(App.vent, "clock:weekOver", this._showEndOfWeek);
        },

        _showEndOfWeek: function(){
            // Close other views
            App.clockRegion.close();
            App.bankRegion.close();
            App.workforceRegion.close();
            App.profitRegion.close();
            // Show Stats
            App.factory.passStats(); // TODO fix this timing problem (the factory needs to put stats over before showing hte view)
            var gameoverView = new App.Factory.GamveOverView({model: App.factory});
            App.mainRegion.show(gameoverView);
            var statsView = new App.Stats.StatisticsView({ model: App.factory.stats});
            gameoverView.statsRegion.show(statsView);

        }

    });

    Sim.addInitializer(function(options){

        App.controller = new Sim.Controller({
            welcomeRegion: App.modalRegion,
            region: App.mainRegion
        });

        App.router = new Sim.Router({controller: App.controller});
    });

});