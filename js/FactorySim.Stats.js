FactorySim.module("Stats", function(Stats, App, Backbone, Marionette, $, _){

    Stats.StatKeeper = Backbone.Model.extend({

        initialize: function(attributes, options){
            // Bind local options
            this.clock = options.clock;
            this.statuses = [];

            //Listen to module level  events
            this.listenTo(Stats, "worker:status", this.logWorkerStatus, this);
        },

        logWorkerStatus: function(worker){
            this.statuses.push({
                timeStamp: this.clock.getTimeStamp(),
                status: worker.get("status"),
                worker: worker
            });
        }
    });

});