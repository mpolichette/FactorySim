FactorySim.module("Game", function(Game, App, Backbone, Marionette, $, _){

    // Application Clock
    // -----------------
    // A very simple implementation of a ticking clock
    Game.Clock = Backbone.Model.extend({

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
    Game.ClockView = Marionette.ItemView.extend({

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

});