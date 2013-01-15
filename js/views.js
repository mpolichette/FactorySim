/********************************
 VIEWS
*********************************/

window.EndPointOptions = {
    endpoint:["Dot", {radius: 7}],
    anchor: [ "Perimeter", { shape:"circle" }]
    };


window.FactoryView = Backbone.View.extend({
    id: 'controls',

    template:_.template($('#controls_template').html()),

    events:{
        "click .clockToggle": "toggleClock",
        "click .reset": "resetFactory",
        "click .workforceToggle": "toggleWorkforce"
    },

    speedOptions: {
        1: 1,
        2: 2,
        3: 10,
        4: 20,
        5: 40,
        6: 80
    },

    initialize: function(){
        this.model.on('change:minute change:hour change:day', this.updateClock, this);
        this.model.on('change:cash', this.updateCash, this);
        this.model.on("paused", this.was_paused, this);

        this.$el.html(this.template(this.model.toJSON()));
        var that = this;
        this.$(".speed .slider").slider({
            value: 1,
            min: 1,
            max: 6,
            step: 1,
            slide: function( event, ui ) {
                var speed = that.speedOptions[ui.value];
                that.model.set("speed", speed);
                that.$(".speed .value").text(speed+"x");
            }
        });
    },

    render: function(){
        return this;
    },

    updateClock: function(){
        var min = this.model.get("minute");
        if(min<10) min = "0"+min;
        this.$(".clock .day").text(this.model.get("day"));
        this.$(".clock .time").text(this.model.get("hour") + ":" + min);
        return this;
    },

    updateCash: function(){
        this.$(".cash .value").text("$" + this.model.get("cash"));
        return this;
    },

    toggleClock: function(){
        if(!this.model.get('started')){
            // If we havent started yet, start!
            this.model.start_clock();
            this.$(".clockToggle").text("Pause");
        }
        else{
            if(this.model.get("paused")){
                // If we're paused, resume
                this.model.resume_clock();
                this.$(".clockToggle").text("Pause");
            }
            else{
                // otherwise pause...
                this.model.pause_clock();
                this.$(".clockToggle").text("Resume");
            }
        }
    },

    resetFactory: function(){
        this.model.resetFactory();
    },

    was_paused: function(){
        this.$(".clockToggle").text("Resume");
    },

    toggleWorkforce: function(){
        var wf = $("#workforce");
        if(wf.css("display") == "none"){
            this.$(".workforceToggle").text("Hide Workforce");
            $("#floor").animate({"margin-top": "143px"});
        } else {
            $("#floor").animate({"margin-top": "0"});
            this.$(".workforceToggle").text("Show Workforce");
        }
        wf.slideToggle();
    }
});


window.FloorView = Backbone.View.extend({

    id:'floor',
    className:'simulation',

    initialize:function () {
        // Bind to model events
        this.model.bind("reset", this.render, this);

    },

    render:function (eventName) {

        var id_view_map = {},
            connections = [];

        _.each(this.model.models, function (job) {
            var view;
            switch(job.get('type')){
                case "market":
                    view = new MarketView({model:job}).render();
                    break;
                case "resource":
                    view = new ResourceView({model:job}).render();
                    break;
                default:
                    view = new JobView({model:job}).render();
            }

            // Include the element in the mapping
            id_view_map[job.id] = view;

            // Set the position of the element and add it to the DOM
            view.$el.css('left', job.get('x'));
            view.$el.css('top', job.get('y'));
            this.$el.append(view.el);

            // If there are connections, record them for adding after
            var dependencies = job.get("source_ids") || [job.get("buys_from")];
            if(dependencies.length > 0){
                connections.push({
                    "target":job.id,
                    "sources":dependencies});
            }
        }, this);

        // Add the connections
        _.each(connections, function(connection){

            // Go through each source and hook it up
            _.each(connection.sources,function(source){
                var source_view = id_view_map[source],
                    target_view = id_view_map[connection.target];

                    // Create the endpoints
                    source_view.outEP = jsPlumb.addEndpoint(source_view.el, {
                        endpoint: ["Dot", {radius: 7}],
                        anchor: [ "Perimeter", { shape:"circle" }]});
                    target_view.inEP = jsPlumb.addEndpoint(target_view.el, {
                        endpoint:["Dot", {radius: 7}],
                        anchor: [ "Perimeter", { shape:"circle" }]});
                    // Connect them!
                    jsPlumb.connect({
                        source: source_view.outEP,
                        target: target_view.inEP,
                        connector:[ "Flowchart", {stub:5}]});

                console.log(connection.target + " depends on " + source);
            }, this);
        }, this);

        return this;
    },

    renderResources:function(){

    },
    renderJobs: function(){

    },
    renderMarkets: function(){

    },
    renderConnections: function(){

    }



});

window.WorkForceView = Backbone.View.extend({

    id: 'workforce',
    className: 'container clearfix',

    initialize: function(){
        this.model.once('reset', this.initialLoad, this );
        this.model.on('add', this.render, this );

    },

    render: function (){
        return this;
    },

    initialLoad: function(){
        // Bring in all the models
        _.each(this.model.groupBy("skill"), function(workers, skill, models) {
            var workerGroup = $("<div>", {"class":"worker-group clearfix"});
            var setupTime = worker_types[skill].setupTime;
            workerGroup.append($("<h5>", {html:skill}));
            workerGroup.append($("<div>", {"class": "muted", text: "Setup Time: " + setupTime}));
            _.each(workers, function(worker){
                var worker_view = new WorkerView({model:worker}).render();
                workerGroup.append(worker_view.el);
            }, this);
            this.$el.append(workerGroup);
        },this);

        // Ugly!!!
        factory.controls.toggleWorkforce();
    }
});

window.WorkerView = Backbone.View.extend({

    template:_.template($('#worker_template').html()),
    className: "worker_holder",

    events:{
        "assign": "assign"
    },

    initialize: function(){
        //this.model.on('change', this.render, this );
        this.model.on('change:progress', this.updateProgress, this);
        this.model.on("change:status", this.updateStatus, this);
        this.$el.html(this.template(this.model.toJSON()));
        this.$('.worker').data('cid', this.model.cid);
        this.$('.worker').draggable({revert: 'invalid', revertDuration: 200});
    },

    render: function () {
        return this;
    },

    updateStatus: function(){
        var status = this.model.get("status");
        this.$(".status .value").text(status);
        if(status === ""){
            this.$(".info").addClass("hidden");
        }
        else{
            this.$(".info").removeClass("hidden");
        }
        return this;
    },

    updateProgress: function(){
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

window.JobView = Backbone.View.extend({

    template:_.template($('#job_template').html()),

    className: function(){
        return "job " + this.model.get("type_class");
    },

    id: function(){
        return this.model.cid;
    },

    events: {
        "drop":"dropped_on",
        "spin .limit .value": "changeLimit"
    },

    initialize: function(){
        this.model.on( 'change:inventory', this.updateInventory, this );
        this.model.on( 'change:limit', this.updateLimit, this );
    },

    render:function (eventName) {
        this.$el.html(this.template(this.model.toJSON()));
        this.$el.css('left', this.model.get('x'));
        this.$el.css('top', this.model.get('y'));
        var model_class = this.model.get("type_class");
        this.$el.droppable({accept: "."+model_class});
        this.$(".limit .value").spinner({min:0, max:99});
        return this;
    },

    updateLimit: function(){
        this.$(".limit input").val(this.model.get("limit"));
    },

    updateInventory: function(){
        this.$(".inventory .value").text(this.model.get("inventory"));
    },

    changeLimit: function(event, ui){
        this.model.set("limit", ui.value);
    },

    dropped_on:function(event, ui){
        worker = factory.workForce.get(ui.draggable.data('cid'));

        // Make sure to validate
        ui.draggable.trigger('assign', [this, this.model]);
        this.model.add_worker(worker);
    }

});

window.MarketView = Backbone.View.extend({
    template:_.template($('#market_template').html()),
    className: "market clearfix",


    initialize: function(){
        this.model.on( 'change', this.render, this );
    },

    render:function (eventName) {
        this.$el.html(this.template(this.model.toJSON()));
        this.$el.attr("id", this.model.cid);
        this.$el.css('left', this.model.get('x'));
        this.$el.css('top', this.model.get('y'));
        return this;
    }
});

window.ResourceView = Backbone.View.extend({

    initialize: function(){
        this.model.on( 'change', this.render, this );
    },

    template:_.template($('#resource_template').html()),
    className: "resource clearfix",

    id: function(){
        return this.model.cid;
    },

    events:{
        "click button": "buy"
    },

    render:function (eventName) {
        this.$el.html(this.template(this.model.toJSON()));
        this.$el.css('left', this.model.get('x'));
        this.$el.css('top', this.model.get('y'));
        return this;
    },

    buy: function(event){
        var amount = $(event.target).data("amount");
        if(!this.model.buy(amount)){
            alert("Failed to purchase "+ amount + ".  Do you have enough money?");
        }
    }
});