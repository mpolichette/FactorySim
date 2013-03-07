FactorySim.module("Game", function(Game, App, Backbone, Marionette, $, _){
    this.startWithParent = false;

    Game.Game = Backbone.Model.extend({
        __name__: "Game",

        initialize: function(attributes, options){
            options = options ? _.clone(options) : {};

            // Create the game parts
            this.bank = new Game.BankAccount();
            this.clock = new Game.Clock();
            // Add clock to options
            options.clock = this.clock;
            this.factory = new Game.Factory(options);

        },

        defaults: {
            profit: 0,
            totalRevenue: 0,
            totalPurchaseExpenses: 0,
            totalOperatingExpenses: 0,

            // This is the set amount that employee salaries costs
            staticOperationsExpense: 10000
        }

    });

    // Game Manager
    // ---------------
    // Keeps track of games, and the current game
    Game.GameManager = Marionette.Controller.extend({
        initialize: function(options){
            // A place to keep track of games
            this.games = [];
            this.settings = options.settings;
            this.config = options.config;

        },

        newGame: function(){
            // If there is already a runner, stop it
            if(this.currentRunner){
                this.currentRunner.close();
            }

            // Create the runner
            var runner = new Game.GameRunner({
                game: this._getNewGame()
            });

            // Listen to runner events
            this.listenTo(runner, "gameOver", this.onGameOver, this);

            // Keep track of the runner
            this.currentRunner = runner;

            // Start the game runner
            runner.startGame();
        },

        _getNewGame: function(){
            // Create game
            var game = new Game.Game(this.settings, this.config);
            this.games.push(game);
            this.currentGame = game;
            return game;
        },

        onGameOver: function(){
            // Do stuff when the game ends
        }
    });


    Game.GameRunner = Marionette.Controller.extend({
        initialize: function(options){
            this.game = options.game;

        },

        startGame: function(){

        },

        onClose: function(){

        }
    });



    this.addInitializer(function(options){
        // Create the game manager
        this.manager = new Game.GameManager(options);
        this.manager.newGame();
    });
});