FactorySim.module("Entities", function(Entities, App, Backbone, Marionette, $, _){

    Entities.Job = Backbone.Model.extend({

        defaults:{
            inventory: 0,
            processed: 0
        },

        initialize: function () {
            // Once the game starts, request your upstream connections.
            this.listenTo(App.vent, "start:game", this.connectUpstreams);
        },

        connectUpstreams: function (game) {
            if(!this.has("upstream")) return;
            var upstreams = [];
            _.each(this.get("upstream"), function (upstreamId) {
                // Most likely the upstream will be another job...
                var upstream = game.getFloorItem(upstreamId);
                if(!upstream) throw new Error("Upstream identity could not be resolved.");
                upstreams.push(upstream);
            }, this);
            this.upstreams = new Backbone.Collection(upstreams);
        }
    });

    Entities.JobCollection = Backbone.Collection.extend({
        model: Entities.Job
    });

    var API = {
        newJobs: function(){
            return new Entities.JobCollection(App.options.config.jobs);
        }
    };

    App.reqres.setHandler("new:job:entities", function(){
        return API.newJobs();
    });
});