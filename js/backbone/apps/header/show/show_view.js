FactorySim.module("HeaderApp.Show", function(Show, App, Backbone, Marionette, $, _){

    var SPEEDX = [".5", "1", "2", "4", "10", "100"];

    Show.Layout = Marionette.Layout.extend({
        template: "#header-template",

        regions: {
            controlsRegion: "#controls-region"
        }
    });

    Show.ControlsView = Marionette.ItemView.extend({
        template: "#header-controls-template",
        tagName: "ul",
        className: "nav",

        bindings: {
            ".cash": "cash",
            ".profit": "profit",
            ".day": "day",
            ".time": {
                observe: ["hour", "minute"],
                onGet: "formatTime"
            },
            ".js-clock-toggle": {
                observe: ["started", "running"],
                onGet: "formatButtonText"
            },
            ".speed": {
                observe: "speed",
                onGet: "formatSpeed"
            }
        },

        triggers: {
            "click .js-clock-toggle": "toggle:clock"
        },

        formatTime: function (vals) {
            var mins = vals[1] < 10 ? "0" + vals[1] : vals[1];
            return [vals[0], mins].join(":");
        },

        formatButtonText:function(vals, options){
            var started = vals[0], running = vals[1];
            return started ? running ? "Pause" : "Resume" : "Start";
        },

        formatSpeed: function (val, options) {
            return SPEEDX[val];
        },

        onRender: function(){
            this.stickit();
            var opts = this.getSliderOptions();
            this.$(".slider").slider(opts);
        },

        getSliderOptions: function () {
            return {
                value: this.model.get("speed"),
                min: 0,
                max: 5,
                step: 1,
                slide: function( event, ui ) {
                    App.execute("set:clock:speed", ui.value);
                }
            };
        }
    });

});