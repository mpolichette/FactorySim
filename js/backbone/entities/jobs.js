FactorySim.module("Entities", function(Entities, App, Backbone, Marionette, $, _){

    Entities.Job = Backbone.Model.extend({

        defaults:{
            inventory: 0,
            processed: 0
        },

        initialize: function () {
            // Once the game starts, request your upstream connections.
            this.listenTo(App.vent, "start:game", this.connectUpstreams);
            this.tasks = new Backbone.Collection();
            this.workers = new Backbone.Collection();
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
        },

        // Get a task if one is available, otherwise returns false
        getTask: function () {
            var task = _.first(this.tasks.where({worker: undefined}));
            if(task){
                return task;
            } else {
                return this.createTask();
            }
        },

        // Try to create a task by checking if we have the resources upstream
        createTask: function () {
            var hasResources = _.every(this.upstreams.invoke("get", "inventory"));
            if(hasResources){
                this.upstreams.invoke("takeInventory");
                var task =  App.request("task:entity", { taskTime: this.get("taskTime") });
                return task;
            } else {
                return false;
            }
        },

        // Invoked downstream to take inventory so they can create a task
        takeInventory: function () {
            var inventory = this.get("inventory");
            if (inventory > 0){
                this.set("inventory", inventory - 1);
                return true;
            } else {
                return false;
            }
        },

        completeTask: function (task) {
            this.set({
                "inventory": this.get("inventory") + 1,
                "processed": this.get("processed") + 1
            });
            this.tasks.remove(task);
        },

        addWorker: function (worker) {
            this.workers.add(worker);
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