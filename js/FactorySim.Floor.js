FactorySim.module("Floor", function(Floor, App, Backbone, Marionette, $, _){

    // Floor Collection
    // ----------------

    Floor.Floor = Backbone.Collection.extend({
        initialize: function(){
            this.fetch();
        },

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


    Floor.Market = Backbone.Model.extend({
        initialize:function(){
            // Listen for my dependencies
            this.collection.on("reset", this.findSource, this);
            this.listenTo(App.vent, "clock:timestep", this.doTimeStep, this);
        },

        defaults:{
            id: null,
            demand: 0,
            produced: 0,
            unitPrice: 0,
            unitProfit: 0,
            revenue: 0
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
            if(this.has("source") && this.get("source").hasInventory()){
                this.get("source").takeInventory();
                this.set("produced", this.get("produced") + 1);
                if(this.get("produced") <= this.get("demand")){
                    var sale = {
                        market: this,
                        revenue: this.get("unitPrice"),
                        profit: this.get("unitProfit")
                    };
                    App.execute("sell", sale);
                    this.set("revenue", this.get("revenue") + this.get("unitPrice"));
                }
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
            inventory: 0,
            purchased: 0
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

            // Create the purchase request
            var request = {
                resource: this,
                quantity: amount,
                cost: value
            };

            var purchaseMade = App.request("purchase", request);

            if(purchaseMade){
                // Add to inventory
                var current_inventory = this.get("inventory");
                this.set("inventory", current_inventory + amount);
                // Add to purchased
                var current_purchased = this.get("purchased");
                this.set("purchased", current_purchased + amount);
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

        collectionEvents:{
            "change:sources": "updatePipe",
            "change:source": "updatePipe"
        },

        getItemView: function(item){
            switch(item.get("type")){
                case "market":
                    return Floor.MarketView;
                case "resource":
                    return Floor.ResourceView;
                default:
                    return Floor.JobView;
            }
        },

        onItemviewShow: function(targetView){
            this.connectItemView(targetView);
        },

        connectItemView: function(targetView){
            // Get the source list
            var sourceViewList = [];
            if(targetView.model.has("sources")){
                _.each(targetView.model.get("sources"), function(sourceModel){
                    sourceViewList.push(this.children.findByModel(sourceModel));
                }, this);
            } else if(targetView.model.has("source")){
                sourceViewList.push(this.children.findByModel(targetView.model.get("source")));
            }

            // Make the enpoints and connections
            _.each(sourceViewList, function(sourceView){
                var inEP = jsPlumb.addEndpoint(targetView.el, {
                                endpoint: ["Dot", {radius: 7}],
                                anchor: [ "Perimeter", { shape:"circle" }]
                            });
                var outEP = jsPlumb.addEndpoint(sourceView.el, {
                                endpoint: ["Dot", {radius: 7}],
                                anchor: [ "Perimeter", { shape:"circle" }]
                            });
                jsPlumb.connect({
                    source: inEP,
                    target: outEP,
                    connector:[ "Flowchart", {stub:5}]
                });
            }, this);
        },

        updatePipe: function(model){
            this.connectItemView(this.children.findByModel(model));
        }
    });

    Floor.JobView = Marionette.ItemView.extend({
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

    Floor.MarketView = Marionette.ItemView.extend({
        template: "#market_template",
        id: function(){ return this.model.cid; },
        className: "market clearfix",

        ui:{
            produced: ".produced",
            revenue: ".revenue"
        },

        modelEvents: {
            "change:produced": "_updateProduced",
            "change:revenue": "_updateRevenue"
        },

        onRender: function(){
            this.$el.css('left', this.model.get('x'));
            this.$el.css('top', this.model.get('y'));

        },

        _updateProduced: function(){
            this.ui.produced.text(this.model.get("produced"));
        },

        _updateRevenue: function(){
            this.ui.revenue.text("$" + this.model.get("revenue"));
        }
    });

    Floor.ResourceView = Marionette.ItemView.extend({
        template: "#resource_template",

        className: "resource clearfix",

        id: function(){ return this.model.cid; },

        ui: {
            inventory: ".inventory",
            purchased: ".purchased"
        },

        modelEvents:{
            "change:inventory": "_updateInventory",
            "change:purchased": "_updatePurchased"
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
        },

        _updatePurchased: function(){
            this.ui.purchased.text(this.model.get("purchased"));
        }
    });



});