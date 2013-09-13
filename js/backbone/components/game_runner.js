FactorySim.module("Components.Game", function(Game, App, Backbone, Marionette, $, _){

    var PAUSE_ON_DAY_END = true,
        HOURS_PER_DAY = 8,
        DAYS_IN_WEEK = 2,
        SPEEDS = [ 2000, 1000, 500, 250, 100, 10];

    Game.GameRunner = Marionette.Controller.extend({

        initialize: function (options) {
        },

        newGame: function () {
            this.factory = App.request("new:factory");
            this.factory.start();
            App.vent.trigger("start:game", this.factory);
        },

        setClockSpeed: function (speed) {
            this.factory.set("speed", speed);
        },

        toggleClock: function (val) {
            var start = val || !this.factory.get("running");
            if(start){
                this.timer = this.factory.startClock();
                this._clockLoop();
            } else {
                clearTimeout(this.timer);
                this.factory.stopClock();
            }
        },

        // Leaving this incase I decide to swap out the confirm dialog modal or something
        pauseConfirm: function(message) {
            var wasRunning = this.factory.get("running");
            // if(wasRunning) this.toggleClock();
            var choice = confirm(message);
            // if(wasRunning) this.toggleClock();
            return choice;
        },

        _clockLoop: function () {
            if(this.factory.get("running")){
                this._clockTick();
                var delay = SPEEDS[this.factory.get("speed")] || 1000;
                return _.delay(_.bind(this._clockLoop, this), delay);
            }
        },

        _clockTick: function () {
            var minute, hour, day, newHour, newDay;
            minute = this.factory.get("minute");
            hour = this.factory.get("hour");
            day = this.factory.get("day");

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

            this.factory.set({ "minute": minute, "hour": hour, "day": day });
            App.vent.trigger("clock:tick", day, hour, minute);
            // Allow lock-step actions to apply updates after clock ticks
            App.vent.trigger("clock:tick:after");

            // Always fire a new hour event
            if(newHour) {
                App.vent.trigger("clock:hour:over");
            }

            // Fire the more relavent of the time events
            if(newDay) {
                if(day === DAYS_IN_WEEK){
                    App.vent.trigger("clock:week:over");
                    this.factory.stopClock();
                } else {
                    App.vent.trigger("clock:day:over");
                    if(PAUSE_ON_DAY_END){
                        this.factory.stopClock();
                    }
                }
            }
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
    App.reqres.setHandler("current:factory", function(){
        return Game.runner.factory;
    });

    App.reqres.setHandler("pause:confirm", function (message) {
        return Game.runner.pauseConfirm(message);
    });

    App.commands.setHandler("toggle:clock", function () {
        Game.runner.toggleClock();
    });

    App.commands.setHandler("set:clock:speed", function (value) {
        Game.runner.setClockSpeed(value);
    });
});