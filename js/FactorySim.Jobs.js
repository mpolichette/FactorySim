FactorySim.module("Game", function(Game, App, Backbone, Marionette, $, _){

    // Job
    // ---

    Game.Job = Game.FloorItem.extend({
        __name__: "Job",

        initialize: function(options){
            this.set(Game.worker_types[this.get('skill_required')]);
            this.workers = new Backbone.Collection();
            this.set("abandoned_tasks", []);
        },

        defaults:{
            skill_required: '',
            taskTime: 5, // should be overwritten
            type: 'job',
            inventory: 0,

            // Starting position
            x: 15,
            y: 15
        },

        add_worker: function(worker){
            this.workers.add(worker);
            this.trigger("change");
            this.trigger("change:workers");
            this.listenTo(worker, "taskCompleted", this.taskCompleted);
        },

        remove_worker: function(worker){
            // Check if worker is currently on a task
            if(worker.get("status") == App.Workers.worker_status.working){
                var task = {taskTime: this.get("taskTime"), progress: worker.get("progress")};
                this.get("abandoned_tasks").push(task);
                this.trigger("change");
                this.trigger("change:abandoned_tasks");
            }
            this.workers.remove(worker);
            this.trigger("change");
            this.trigger("change:workers");
            this.stopListening(worker, "taskCompleted", this.taskCompleted);
            console.log("Job"+this.id+" removed "+worker.get("name")+ " from its workforce.");
        },

        requestTask: function(){
            var task = {};
            // First check if there are any abanadoned tasks
            if(this.get("abandoned_tasks").length > 0){
                task = this.get("abandoned_tasks").pop();
                task.type = App.Workers.task_type.partial;
                this.trigger("change");
                this.trigger("change:abandoned_tasks");
                return task;
            }
            else{
                // Check if a limit has been set
                if(this.has("limit")){
                    if(this.get("limitCount") >= this.get("limit")){
                        return {type:App.Workers.task_type.stop};
                    }
                }
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

                    // Update limit count
                    if(this.has("limitCount")){
                        this.set("limitCount", this.get("limitCount") + 1);
                    }

                    // Return the task
                    return {type: App.Workers.task_type.fresh, taskTime: this.get("taskTime")};
                }
                else{
                    return {type:App.Workers.task_type.wait};
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

    Game.JobCollection = Game.FloorItemCollection.extend({
        model: Game.Job
    });

    Game.JobView = Marionette.ItemView.extend({
        template: "#job_template",

        className: function(){
            return "job " + this.model.get("type_class");
        },

        id: function(){
            return this.model.cid;
        },

        ui: {
            limitLink: ".limit"
        },

        modelEvents: {
            "change:inventory": "_updateInventory",
            "change:limit change:limitCount": "_updateLimit"
        },

        events: {
            "drop":"dropped_on",
            "click .set": "_setLimit",
            "click .cancel": "_dismissPopover"
        },

        onRender: function(){
            this.$el.css('left', this.model.get('x'));
            this.$el.css('top', this.model.get('y'));
            this.$el.droppable({accept: "." + this.model.get("type_class")});
            this.ui.limitLink.popover({
                html: true,
                title: "Set a limit",
                content: $("#limit-popover_template").html(),
                trigger: "click"
            });
        },

        _setLimit: function(){
            var newLimit = this.$(".limit-popover input").val();
            this.model.set("limitCount", 0);
            this.model.set("limit", newLimit);
            this.ui.limitLink.popover("hide");
        },

        _dismissPopover: function(){
            this.ui.limitLink.popover("hide");
        },

        _updateLimit: function(event, ui){
            if(this.model.get("limit") === 0){
                this.ui.limitLink.text("Set limit");
            } else {
                this.ui.limitLink.text(
                    "Limit: " + this.model.get("limitCount") + "/" + this.model.get("limit")
                    );
            }
        },

        _updateInventory: function(){
            this.$(".inventory .value").text(this.model.get("inventory"));
        },

        dropped_on:function(event, ui){
            worker = App.factory.workforce.get(ui.draggable.data('cid'));

            // Make sure to validate
            ui.draggable.trigger('assign', [this, this.model]);
            this.model.add_worker(worker);
        }

    });


});