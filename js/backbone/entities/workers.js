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
        idAttribute: "name",
        defaults:{
            status: STATUSES.unassigned,
            setupProgress: 0
        },

        initialize: function () {
            this.listenTo(App.vent, "clock:tick", this.tryToWork);
            this.listenTo(App.vent, "clock:tick:after", this.completeWork);
        },

        parse: function  (data) {
            var setupTime =  WORKER_SETUP_TIMES[data.skill];
            if(setupTime === undefined) throw new Error("Worker skill not recognized.");
            data.setupTime = setupTime;
            return data;
        },

        assignJob: function (job) {
            if(this.get("job") === job) return;
            if(this.has("task") && !this.confirmAbandonTask()){
                return false;
            }
            this.set({
                job: job,
                setupProgress: 0,
                status: STATUSES.settingUp
            });
            return true;
        },

        confirmAbandonTask: function () {
            var msg, task = this.get("task");
            if(task){
                msg = ["Abandon", this.get("name") + "'s", "current task?\n(Progress will be kept)"].join(" ");
                if(App.request("pause:confirm", msg )){
                    this.get("task").abandon();
                    this.unset("task");
                } else {
                    return false;
                }
            }
            return true;
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
                    var task = this.get("task") || this.requestTask();
                    if(task){
                        // Finally if they can, acutally put some work in
                        task.addTime();
                        newStatus = STATUSES.working;
                    } else {
                        // Or sit idly
                        newStatus = STATUSES.waiting;
                    }
                }
            } else {
                // Remain unassigned
                newStatus = STATUSES.unassigned;
            }
            // Update the workers' status
            this.set("status", newStatus);
            this.logTime();
        },

        completeWork: function() {
            var task = this.get("task");
            if(task && task.get("complete")){
                this.completeTask(task);
            }
        },

        requestTask: function () {
            var task = this.get("job").getTask();
            if(task){
                this.set("task", task);
                task.claim(this); // bad style still
            }
            return task;
        },

        completeTask: function (task) {
            this.get("job").completeTask(task);
            this.unset("task");
        },

        logTime: function() {
            var counts = _.clone(this.get("counts")) || {},
                status = this.get("status"),
                newCount = (counts[status] || 0) + 1;
            counts[status] = newCount;
            this.set("counts", counts);
        }

    });

    Entities.WorkerCollection = Backbone.Collection.extend({
        model: Entities.Worker,
        comparator: "name"
    });

    var API = {
        newWorkers: function(){
            return new Entities.WorkerCollection(App.options.config.workers, {parse: true});
        }
    };

    App.reqres.setHandler("new:worker:entities", function(){
        return API.newWorkers();
    });
});