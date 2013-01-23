FactorySim.module("Factory", function(Factory, App, Backbone, Marionette, $, _){

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
                this.pause();
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

    Factory.BankAccountView = Marionette.ItemView.extend({
        template: "#bank_template",
        id: "bank",
        tagName: "ul",
        className: "nav",

        modelEvents: {
            "change:cash": "_updateCash"
        },

        _updateCash: function(){
            this.$(".cash").text("$" + this.model.get("cash"));
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

    // Welcome View
    // ------------

    Factory.WelcomeView = Marionette.ItemView.extend({
        template: "#welcome_template",

        ui: {
            inputs: "input"
        },

        events: {
            "click button": "submitForm"
        },

        submitForm: function(event){
            event.preventDefault();
            var names = [];
            _.each(this.ui.inputs, function(input){
                names.push($(input).val());
            }, this);
            this.trigger("login", names);
        }
    });
});