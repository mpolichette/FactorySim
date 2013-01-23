FactorySim.module("Sim", function(Sim, App, Backbone, Marionette, $, _){

    Sim.Router = Marionette.AppRouter.extend({
        appRoutes:{
            "": "main"
        }
    });

    Sim.Controller = Marionette.Controller.extend({
        initialize: function(){

            // Create the clock
            App.clock = new App.Factory.Clock();

            // Start collecting stats
            App.stats = new App.Stats.StatKeeper({}, {clock: App.clock});

            // Create our stuff
            App.bank = new App.Factory.BankAccount();
            App.workforce = new App.Workers.WorkForce();
            App.workforce.fetch();
            App.floor = new App.Floor.Floor();
            App.floor.fetch();

        },

        main:function(){
            var view = new App.Factory.WelcomeView();
            this.listenTo(view, "login", this._login);
            App.mainRegion.show(view);
        },

        _login: function(users){
            App.settings.users = users;
            this._showLayout();
        },

        _showLayout:function(){

            // Show the clock
            var clockView = new App.Factory.ClockView({model:App.clock});
            App.clockRegion.show(clockView);

            // Show the bank
            var bankView = new App.Factory.BankAccountView({model: App.bank});
            App.bankRegion.show(bankView);

            // Show the options
            var optionsView = new App.Factory.OptionsView();
            App.optionsRegion.show(optionsView);

            var floorView = new App.Floor.FloorView({collection: App.floor});
            App.mainRegion.show(floorView);

            // Show the workforce
            var WFview = new App.Workers.WorkforceView({collection: App.workforce});
            App.workforceRegion.show(WFview);

        }

    });

    Sim.addInitializer(function(){
        App.controller = new Sim.Controller();
        App.router = new Sim.Router({controller: App.controller});
    });

});