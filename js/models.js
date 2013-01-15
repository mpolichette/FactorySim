worker_types = {
    'Assembler': {
        'sort_order': 1,
        'type_class': 'wrktyp1',
        'setupTime': 0
    },
    'Chemist': {
        'sort_order': 2,
        'type_class': 'wrktyp2',
        'setupTime': 60
    },
    'Developer': {
        'sort_order': 3,
        'type_class': 'wrktyp3',
        'setupTime': 120
    },
    'Engineer':{
        'sort_order': 4,
        'type_class': 'wrktyp4',
        'setupTime': 30
    },
    'Fabricator':{
        'sort_order': 5,
        'type_class': 'wrktyp5',
        'setupTime': 15
    }
};

worker_status = {
    "unassigned": "",
    "settingup": "Setting Up",
    "working": "Working",
    "waiting": "Waiting",
    "stopped": "Stopped"
};

task_type = {
    "fresh": 1,
    "partial": 2,
    "wait": 3,
    "stop": 4
};

/********************************
 Models
*********************************/
window.Factory = Backbone.Model.extend({

    initialize: function(options){
        // Get my workforce
        this.workForce = new WorkForce();
        this.workForceView = new WorkForceView({model: this.workForce, el:$("#workforce")});
        this.workForce.fetch();

        // Get my floor
        this.floor = new Floor();
        this.floorView = new FloorView({model: this.floor, el:$("#floor")});
        this.floor.fetch();

        // Show my controls
        this.controls = new FactoryView({model: this, el:$("#controls")}).render();
    },

    defaults:{
        cash: 10000,

        // Clock Data
        day: 1,
        hour: 0,
        minute: 0,

        // Clock meta
        started: false,
        paused: false,
        timer: undefined,
        speed: 1
    },

    withdraw: function(amount){
        var cur_cash = this.get("cash");
        if(cur_cash >= amount){
            this.set("cash", cur_cash - amount);
            return true;
        }
        else{
            return false;
        }
    },

    deposit: function(amount){
        this.set("cash", this.get("cash") + amount);
    },

    increment_clock: function(){
        var min = this.get("minute");
        if(min < 59){
            this.set("minute", min + 1);
        }
        else{
            this.set("minute", 0);
            var hour = this.get("hour");
            if(hour < 8){
                this.set("hour", hour + 1);
            }
            else{
                this.set("hour", 0);
                this.increment_day();
            }
        }
    },

    increment_day: function(){
        this.pause_clock();
        this.trigger("paused");
        var day =this.get("day");
        if(day < 5){
            this.set("day", day + 1);
            return;
        }
        else{
            alert("You have reached the end of the week!");
        }
    },

    perform_timestep: function(){
        this.trigger("timestep");
        this.increment_clock();

        // Logic of weather to continue or not
        var that = this;
        if(!this.get("paused")){
            var timer = setTimeout(function(){that.perform_timestep();}, 1000 / this.get("speed"));
            this.set("timer", timer);
        }
    },

    start_clock:function(){
        if (this.get("timer")){
            return;
        }
        else{
            var that = this;
            var timer = setTimeout(function(){that.perform_timestep();}, 1000 / this.get("speed"));
            this.set("timer", timer);
            this.set("started", true);
        }
    },
    pause_clock:function(){
        var timer = this.get("timer");
        clearTimeout(timer);
        this.unset("timer");
        this.set("paused", true);
    },
    resume_clock:function(){
        this.set("paused", false);
        this.start_clock();
    },

    resetFactory: function(){
        clearTimeout(this.get("timer"));
        this.set(this.defaults);
    }
});

window.Worker = Backbone.Model.extend({
    initialize: function(){
        this.set(worker_types[this.get('skill')]);
        factory.on("timestep", this.doTimeStep, this);
    },

    defaults:{
        id: null,
        name: "",
        skill: "",
        sort_order: 0,
        type_class: '',
        status: worker_status.unassigned,

        taskTime: 1,
        progress: 0

    },

    assign_job: function(job){
        // Make sure the assignment is valid
        if(this.get("skill") === job.get("skill_required")){
            // Check if we're already at a job
            if(this.has("job")){
                // Check if we were dropped on the same job
                if(this.get("job").id == job.id) return false;
                // Otherwise, remove ourselves from the old one
                this.get("job").remove_worker(this);
            }
            // Assign job
            this.set("job", job);
            console.log(this.get("name")+" now works at job " + job.id+".");

            // Update status
            this.set({
                "status": worker_status.settingup,
                "taskTime": this.get("setupTime"),
                "progress": 0
            });

            return true;
        }
        else{
            return false;
        }
    },

    doTimeStep: function(){
        switch(this.get("status")){
            case worker_status.unassigned:
                return;  //Give me something to do!
            case worker_status.settingup:
            case worker_status.working:
                // Update progress
                var cur_progress = this.get("progress");
                if(cur_progress < this.get("taskTime")){
                    // Simple case... just update progress
                    this.set("progress", cur_progress + 1);
                }
                else{
                    // Complete the task
                    this.completeTask();
                    // Get a new task
                    this.getNewTask();
                }
                break;
            case worker_status.stopped:
            case worker_status.waiting:
                // Get a new task
                this.getNewTask();
                return;
        }
    },

    completeTask: function(){
        this.set("progress", 0);
        if(this.get("status") == worker_status.working) this.trigger("taskCompleted");
    },

    getNewTask: function(){
        var task = this.get("job").requestTask();

        if(task.type === task_type.stop){
            this.set("status", worker_status.stopped);
        }
        else if(task.type === task_type.wait){
            this.set("status", worker_status.waiting);
        }
        else{
            this.set("taskTime", task.taskTime);
            // If the task was interupted, resume where it was
            if(task.type === task_type.partial){
                this.set("progress", task.progress);
            }
            this.set("status", worker_status.working);
        }
    }

});

window.WorkerList = Backbone.Collection.extend({model: Worker});

window.Job = Backbone.Model.extend({

    initialize: function(options){
        this.set(worker_types[this.get('skill_required')]);
        this.workers = new WorkerList();
        this.set("sources", []);
        this.set("abandoned_tasks", []);

        // Listen for my dependencies
        this.collection.on("reset", this.mapSources, this);
    },

    defaults:{
        id: null,
        skill_required: '',
        source_ids: [],
        taskTime: 5, // should be overwritten
        type: 'job',
        limit: 0,
        inventory: 0,

        // Starting position
        x: 15,
        y: 15
    },

    mapSources: function(collection){
        _.each(this.get("source_ids"), function(id){
            var sources = _.clone(this.get("sources"));
            sources.push(collection.get(id));
            this.set("sources", sources);
        }, this);
    },

    add_worker: function(worker){
        this.workers.add(worker);
        this.trigger("change");
        this.trigger("change:workers");
        this.listenTo(worker, "taskCompleted", this.taskCompleted);
        console.log("Job"+this.id+" added "+worker.get("name")+ " to its workforce.");
    },

    remove_worker: function(worker){
        // Check if worker is currently on a task
        if(worker.get("status") == worker_status.working){
            var task = {taskTime: this.get("taskTime"), progress: worker.get("progress")};
            this.get("abandoned_tasks").push(task);
            this.trigger("change");
            this.trigger("change:abandoned_tasks");
        }
        this.workers.remove(worker);
        this.trigger("change");
        this.trigger("change:workers");
        this.stopListening(worker, "taskCompleted", this.taskCompleted);
        console.log("Job"+this.id+" removed "+worker.get("name")+ " to its workforce.");
    },

    requestTask: function(){
        var task = {};
        // First check if there are any abanadoned tasks
        if(this.get("abandoned_tasks").length > 0){
            task = this.get("abandoned_tasks").pop();
            task.type = task_type.partial;
            this.trigger("change");
            this.trigger("change:abandoned_tasks");
            return task;
        }
        else{
            // Check if a limit has been set

            // Check if it can create a new task
            var sourcesHaveInventory = true;
            _.each(this.get("sources"), function(source){
                if(!source.hasInventory()) sourcesHaveInventory = false;
            }, this);
            // If all sources have inventory, get one and create a task
            if(sourcesHaveInventory){
                _.each(this.get("sources"), function(source){
                    source.takeInventory();
                }, this);
                return {type: task_type.fresh, taskTime: this.get("taskTime")};
            }
            else{
                return {type:task_type.wait};
            }
        }
    },

    taskCompleted:function(){
        this.set("inventory", this.get("inventory") + 1);
    },

    hasInventory:function(){
        var inventory = this.get("inventory");
        if(inventory > 0) return true;
        else return false;
    },
    takeInventory:function(){
        var inventory = this.get("inventory");
        if(inventory > 0){
            this.set("inventory", inventory - 1);
            return true;
        }
        else return false;
    }
});

window.Market = Backbone.Model.extend({
    initialize:function(){
        // Listen for my dependencies
        this.collection.on("reset", this.findSource, this);
        factory.on("timestep", this.doTimeStep, this);
    },

    defaults:{
        id: null,
        demand: 0
    },

    findSource: function(collection){
        if(this.has("buys_from")){
            this.set("source", collection.get(this.get("buys_from")));
        }
        else{
            //Log error
            console.log("Market " + this.id + " has no source.");
        }
    },

    doTimeStep: function(){
        if(this.get("demand") > 0 && this.has("source") && this.get("source").hasInventory()){
            this.set("demand", this.get("demand") - 1);
            this.get("source").takeInventory();
            factory.deposit(this.get("buy_price"));
        }
    }
});

window.Resource = Backbone.Model.extend({
    initialize:function(){
        this.set("sources", []);
        // Listen for my dependencies
        this.collection.on("reset", this.mapSources, this);
    },

    defaults:{
        id: null,
        price: 1,
        source_ids: [],
        sources: [],
        inventory: 0
    },

    mapSources: function(collection){
        _.each(this.get("source_ids"), function(id){
            var sources = _.clone(this.get("sources"));
            sources.push(collection.get(id));
            this.set("sources", sources);
        }, this);
    },

    buy: function(amount){
        var value = this.get('price') * amount;
        if(factory.withdraw(value)){
            var current_inventory = this.get("inventory");
            this.set("inventory", current_inventory + amount);
            return true;
        }
        else{
            return false;
        }
    },

    hasInventory:function(){
        var inventory = this.get("inventory");
        if(inventory > 0) return true;
        else return false;
    },
    takeInventory:function(){
        var inventory = this.get("inventory");
        if(inventory > 0){
            this.set("inventory", inventory - 1);
            return true;
        }
        else return false;
    }
});



/********************************
 COLLECTIONS
*********************************/
window.WorkForce = Backbone.Collection.extend({
    model: Worker,
    url: "../FactorySim/data/workers.json",

    comparator: function(worker){
        return worker.get('sort_order');
    }
});

window.Floor = Backbone.Collection.extend({
    model: function(attrs, options){
        switch(attrs.type){
            case "market":
                return new Market(attrs, options);
            case "resource":
                return new Resource(attrs, options);
            default:
                return new Job(attrs, options);
        }
    },
    url: "../FactorySim/data/floor.json"
});