FactorySim.module("Entities", function(Entities, App, Backbone, Marionette, $, _){

    Entities.Task = Backbone.Model.extend({

        defaults: {
            complete: false,
            progress: 0
        },

        initialize: function (options) {
            this.set("total", options.taskTime);
        },

        abandon: function () {
            this.unset("worker");
        },

        addTime: function () {
            var newProgress = this.get("progress") + 1;
            this.set("progress", newProgress);

            // Set it as complete if it is
            if(newProgress === this.get("total")){
                this.set("compltete", true);
            }
        }

    });

    App.reqres.setHandler("task:entity", function (options) {
        return new Entities.Task(options);
    });

});