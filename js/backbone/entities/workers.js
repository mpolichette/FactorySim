FactorySim.module("Entities", function(Entities, App, Backbone, Marionette, $, _){

    var WORKER_SETUP_TIMES = {
        'Assembler': 0,
        'Chemist': 60,
        'Developer': 120,
        'Engineer': 30,
        'Fabricator': 15
    };

    var STATUSES = {
        unassigned: "Unassigned",
        settingUp: "Setting Up",
        working: "Working",
        waiting: "Idle"
    };

    Entities.Worker = Backbone.Model.extend({
        defaults:{
            status: STATUSES.unassigned,
            setupProgress: 0
        },

        initialize: function () {
            this.listenTo(App.vent, "clock:tick", this.tryToWork);
        },

        parse: function  (data) {
            var setupTime =  WORKER_SETUP_TIMES[data.skill];
            if(!setupTime) throw new Error("Worker skill not recognized.");
            data.setupTime = setupTime;
            return data;
        },

        tryToWork: function () {
            var newStatus;
            // If the worker doesn't have a job, it cannot work
            if(this.has("job")){
                // If the worker is not setup, they have to keep setting up
                var setupProgress = this.get("setupProgress");
                if(setupProgress < this.get("setupTime")){
                    this.set("setupProgress", setupProgress + 1);
                    newStatus = STATUSES.settingUp;
                } else {
                    // Finally if they can, acutally put some work in
                    if(this.get("job").putInTime(this)){
                        newStatus = STATUSES.working;
                    } else {
                        // Or sit idly
                        newStatus = STATUSES.waiting;
                    }
                }
            } else {
                newStatus = STATUSES.unassigned;
            }
            // Update the workers' status
            this.set("status", newStatus);
        }

    });

    Entities.WorkerCollection = Backbone.Collection.extend({
        model: Entities.Worker,
        comparator: "name"
    });

    var API = {
        newWorkers: function(){
            return new Entities.WorkerCollection(App.options.config.workers);
        }
    };

    App.reqres.setHandler("new:worker:entities", function(){
        return API.newWorkers();
    });
});