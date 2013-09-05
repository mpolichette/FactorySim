FactorySim.module("Entities", function(Entities, App, Backbone, Marionette, $, _){

    Entities.Task = Backbone.Model.extend({

        defaults: {
            complete: false,
            progress: 0
        },

        initialize: function (options) {
            this.set("total", options.taskTime);
        },

        claim: function(worker) {
            this.set("worker", worker);
        },

        abandon: function () {
            this.unset("worker");
        },

        // Update the progress and set it complete if it is
        addTime: function () {
            var newProgress = this.get("progress") + 1,
                isComplete = newProgress === this.get("total");
            this.set({
                "progress": newProgress,
                "complete": isComplete
            });
        }

    });

    App.reqres.setHandler("task:entity", function (options) {
        return new Entities.Task(options);
    });

});