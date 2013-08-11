FactorySim.module("Components.Game", function(Game, App, Backbone, Marionette, $, _){

    var PAUSE_ON_DAY_END = true,
        HOURS_PER_DAY = 8,
        DAYS_IN_WEEK = 5,
        SPEEDS = [ 2000, 1000, 500, 250, 100, 10];

    Game.GameRunner = Marionette.Controller.extend({

        initialize: function (options) {

        },

        newGame: function () {
            this.game = App.request("create:new:game");
            App.vent.trigger("start:game", this.game);
        },

        setClockSpeed: function (speed) {
            this.game.set("speed", speed);
        },

        toggleClock: function (val) {
            var start = val || !this.game.get("running");
            if(start){
                this.timer = this.game.startClock();
                this._clockLoop();
            } else {
                clearTimeout(this.timer);
                this.game.stopClock();
            }
        },

        _clockLoop: function () {
            if(this.game.get("running")){
                this._clockTick();
                var delay = SPEEDS[this.game.get("speed")] || 1000;
                return _.delay(_.bind(this._clockLoop, this), delay);
            }
        },

        _clockTick: function () {
            var minute, hour, day, newHour, newDay;
            minute = this.game.get("minute");
            hour = this.game.get("hour");
            day = this.game.get("day");

            minute = minute + 1;
            if(minute === 60){
                newHour = true;
                minute = 0;
                hour = hour + 1;
                if(hour === HOURS_PER_DAY){
                    newDay = true;
                    hour = 0;
                    day = day + 1;
                }
            }

            this.game.set({ "minute": minute, "hour": hour, "day": day });
            if(newHour) {
                App.vent.trigger("clock:hour:over");
            }
            if(newDay) {
                App.vent.trigger("clock:day:over");
                if(PAUSE_ON_DAY_END){
                    this.game.stopClock();
                }
            }
            if(day === DAYS_IN_WEEK) {
                App.vent.trigger("clock:week:over");
                this.game.stopClock();
            }
            App.vent.trigger("clock:tick", day, hour, minute);
        }

    });


    App.vent.on("new:game", function(options){
        if(!Game.runner) Game.runner = new Game.GameRunner();
        Game.runner.newGame();
    });

    /**
     * The Below events require a runner be instantiated... this should always be the case
     * if the application is opperating correctly.
     */
    App.commands.setHandler("toggle:clock", function () {
        Game.runner.toggleClock();
    });

    App.commands.setHandler("set:clock:speed", function (value) {
        Game.runner.setClockSpeed(value);
    });
});