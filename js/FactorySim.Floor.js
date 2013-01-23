FactorySim.module("Floor", function(Floor, App, Backbone, Marionette, $, _){

    // Floor Collection
    // ----------------

    Floor.Floor = Backbone.Collection.extend({
        model: function(attrs, options){
            switch(attrs.type){
                case "market":
                    return new Floor.Market(attrs, options);
                case "resource":
                    return new Floor.Resource(attrs, options);
                default:
                    return new Floor.Job(attrs, options);
            }
        },
        url: "../FactorySim/data/floor.json"
    });


    // Job
    // ---

    var WorkerList = Backbone.Collection.extend({model: App.Workers.Worker});
    Floor.Job = Backbone.Model.extend({

        initialize: function(options){
            this.set(App.Workers.worker_types[this.get('skill_required')]);
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


    Floor.Market = Backbone.Model.extend({
        initialize:function(){
            // Listen for my dependencies
            this.collection.on("reset", this.findSource, this);
            this.listenTo(App.vent, "clock:timestep", this.doTimeStep, this);
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

    Floor.Resource = Backbone.Model.extend({
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
            if(App.bank.withdraw(value)){
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



// VIEWS
// -----

    Floor.FloorView = Marionette.CollectionView.extend({

        id:'factory',
        className:'simulation',

        getItemView: function(item){
            switch(item.get("type")){
                case "market":
                    return Floor.MarketView;
                case "resource":
                    return Floor.ResourceView;
                default:
                    return Floor.JobView;
            }
        }

        // render:function (eventName) {

        //     var id_view_map = {},
        //         connections = [];

        //     _.each(this.model.models, function (job) {
        //         var view;
        //         switch(job.get('type')){
        //             case "market":
        //                 view = new MarketView({model:job}).render();
        //                 break;
        //             case "resource":
        //                 view = new ResourceView({model:job}).render();
        //                 break;
        //             default:
        //                 view = new JobView({model:job}).render();
        //         }

        //         // Include the element in the mapping
        //         id_view_map[job.id] = view;

        //         // Set the position of the element and add it to the DOM
        //         view.$el.css('left', job.get('x'));
        //         view.$el.css('top', job.get('y'));
        //         this.$el.append(view.el);

        //         // If there are connections, record them for adding after
        //         var dependencies = job.get("source_ids") || [job.get("buys_from")];
        //         if(dependencies.length > 0){
        //             connections.push({
        //                 "target":job.id,
        //                 "sources":dependencies});
        //         }
        //     }, this);

        //     // Add the connections
        //     _.each(connections, function(connection){

        //         // Go through each source and hook it up
        //         _.each(connection.sources,function(source){
        //             var source_view = id_view_map[source],
        //                 target_view = id_view_map[connection.target];

        //                 // Create the endpoints
        //                 source_view.outEP = jsPlumb.addEndpoint(source_view.el, {
        //                     endpoint: ["Dot", {radius: 7}],
        //                     anchor: [ "Perimeter", { shape:"circle" }]});
        //                 target_view.inEP = jsPlumb.addEndpoint(target_view.el, {
        //                     endpoint:["Dot", {radius: 7}],
        //                     anchor: [ "Perimeter", { shape:"circle" }]});
        //                 // Connect them!
        //                 jsPlumb.connect({
        //                     source: source_view.outEP,
        //                     target: target_view.inEP,
        //                     connector:[ "Flowchart", {stub:5}]});

        //             console.log(connection.target + " depends on " + source);
        //         }, this);
        //     }, this);

        //     return this;
        // }
    });

    Floor.JobView = Marionette.ItemView.extend({
        template: "#job_template",

        className: function(){
            return "job " + this.model.get("type_class");
        },

        id: function(){
            return this.model.cid;
        },

        modelEvents: {
            "change:inventory": "_updateInventory",
            "change:limit": "_updateLimit"
        },

        events: {
            "drop":"dropped_on",
            "spin .limit .value": "changeLimit"
        },

        onRender: function(){
            this.$el.css('left', this.model.get('x'));
            this.$el.css('top', this.model.get('y'));
            this.$el.droppable({accept: "." + this.model.get("type_class")});
        },

        // render:function (eventName) {
        //     this.$(".limit .value").spinner({min:0, max:99});
        //     return this;
        // },

        _updateLimit: function(){
            this.$(".limit input").val(this.model.get("limit"));
        },

        _updateInventory: function(){
            this.$(".inventory .value").text(this.model.get("inventory"));
        },

        changeLimit: function(event, ui){
            this.model.set("limit", ui.value);
        },

        dropped_on:function(event, ui){
            worker = App.workforce.get(ui.draggable.data('cid'));

            // Make sure to validate
            ui.draggable.trigger('assign', [this, this.model]);
            this.model.add_worker(worker);
        }

    });

    Floor.MarketView = Marionette.ItemView.extend({
        template: "#market_template",
        id: function(){ return this.model.cid; },
        className: "market clearfix",

        onRender: function(){
            this.$el.css('left', this.model.get('x'));
            this.$el.css('top', this.model.get('y'));
        }
    });

    Floor.ResourceView = Marionette.ItemView.extend({
        template: "#resource_template",

        className: "resource clearfix",

        id: function(){ return this.model.cid; },

        ui: {
            inventory: ".inventory"
        },
        modelEvents:{
            "change:inventory": "_updateInventory"
        },

        events:{
            "click button": "buy"
        },

        onRender: function(){
            this.$el.css('left', this.model.get('x'));
            this.$el.css('top', this.model.get('y'));
        },

        buy: function(event){
            var amount = $(event.target).data("amount");
            if(!this.model.buy(amount)){
                alert("Failed to purchase "+ amount + ".  Do you have enough money?");
            }
        },

        _updateInventory: function(){
            this.ui.inventory.text(this.model.get("inventory"));
        }
    });



});