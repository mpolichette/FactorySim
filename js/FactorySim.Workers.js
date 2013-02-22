FactorySim.module("Workers", function(Workers, App, Backbone, Marionette, $, _){

    var worker_types = Workers.worker_types = {
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

    var worker_status = Workers.worker_status = {
        "unassigned": "Unassigned",
        "settingup": "Setting Up",
        "working": "Working",
        "waiting": "Idle",
        "stopped": "Stopped"
    };

    var task_type = Workers.task_type = {
        "fresh": 1,
        "partial": 2,
        "wait": 3,
        "stop": 4
    };

    Workers.Worker = Backbone.Model.extend({
        initialize: function(){
            this.set(worker_types[this.get('skill')]);
            this.listenTo(App.vent, "clock:timestep", this.doTimeStep, this);
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
                    // Are we working on a task?
                    if(this.get("status") === worker_status.working){
                        if(!confirm("Removing worker, will interup their current task. Still move worker")){
                            return;
                        }
                    }

                    // Otherwise, remove ourselves from the old one
                    this.get("job").remove_worker(this);
                }
                // Assign job
                this.set("job", job);

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
                    break;  //Give me something to do!
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
                    break;
            }
            App.Stats.trigger("worker:status",this);
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


    Workers.WorkForce = Backbone.Collection.extend({
        initialize: function(){
            this.fetch();
        },

        model: Workers.Worker,
        url: "data/workers.json",

        comparator: function(worker){
            return worker.get('sort_order');
        }
    });

    // WorkerView
    // ----------
    Workers.WorkerView = Marionette.ItemView.extend({
        template: "#worker_template",
        className: "worker_holder",

        events: {
            "assign": "assign"
        },

        ui: {
            worker: ".worker",
            info: ".info"
        },

        modelEvents:{
            "change:progress": "_updateProgress",
            "change:status": "_updateStatus"
        },


        onRender: function(){
            this.ui.worker.data('cid', this.model.cid);
            this.ui.worker.draggable({revert: 'invalid', revertDuration: 200});
        },

        _updateStatus: function(){
            var status = this.model.get("status");
            this.$(".status").text(status);
            if(status === ""){
                this.ui.info.hide();
            }
            else{
                this.ui.info.show();
            }
            return this;
        },

        _updateProgress: function(){
            var percent = (this.model.get("progress") / this.model.get("taskTime"))*100;
            this.$(".progress .bar").width(percent + "%");
            return this;
        },


        assign: function(event, view, job){
            // Set the workers job
            if (this.model.assign_job(job)){
                this.jobView = view;
                this.jobView.$(".workers").append(this.el);
                this.$(".worker").css('left', 0);
                this.$(".worker").css('top', 0);
            }
            else{
                this.revert();
            }
        },

        revert: function(){
            this.$(".worker").animate({top:0,left:0}, 200);
        }

    });


    // WorkforceView
    // -------------

    Workers.WorkforceView = Marionette.CompositeView.extend({
        template: "#workforce_template",
        itemView: Workers.WorkerView,
        itemViewContainer: ".workers",
        id: "workforce",
        className: "container clearfix",

        ui:{
            container: ".wf-container",
            workers: ".workers",
            toggle: ".toggle",
            icon: ".wf-icon",
            text: ".wf-text"
        },

        events: {
            "click .toggle": "_toggleVisibility"
        },

        _toggleVisibility: function(){
            if(this.ui.container.css("display") == "none"){
                this.ui.text.text("Hide Workforce");
                this.ui.icon.toggleClass("icon-chevron-up icon-chevron-down");
                $("body").animate({"padding-top": (60 + this.height) + "px"});
            } else {
                if(!this.height) this.height = this.$el.height();
                $("body").animate({"padding-top": "90px"});
                this.ui.icon.toggleClass("icon-chevron-up icon-chevron-down");
                this.ui.text.text("Show Workforce");
            }
            this.ui.container.slideToggle();
        },

        onBeforeRender: function(){
            var skills = _.unique(this.collection.pluck("skill"));
            _.each(skills, function(skill){
                this.ui.workers.append(this._createWorkerGroupEl(skill));
            }, this);
        },

        onRender: function(){
            $("body").css({"padding-top": "220px"});
        },

        onClose: function(){
            $("body").css({"padding-top": "90px"});
        },

        // This need to be broken out into... a template and... a different view?
        _createWorkerGroupEl: function(skill){
            var type = worker_types[skill];
            var parent = $("<div>", {"class":"worker-group " + skill});
            parent.append($("<h5>", {text: skill}))
            .append($("<div>", {"class": "setuptime", text: "Setup Time: " + type.setupTime + " min"}));
            return parent;
        },

        appendHtml: function(collectionView, itemView, index){
            var group = collectionView.ui.workers.find("."+itemView.model.get("skill"));
            group.append(itemView.el);
        }

    });
});