FactorySim.module("FactoryJobsApp.Show", function(Show, App, Backbone, Marionette, $, _){

    var DRAG_DEFAULTS = {
        revert: "invalid",
        cursorAt: {top:25, left: 15},
        containment: "#main-region"
        };

    var DROP_DEFAULTS = {

    };

    var JobWorkerView = Marionette.ItemView.extend({
        template: "#job-worker-template",
        className: "worker",
        attributes: function () { return {"data-name": this.model.get("name")}; },

        ui: {
            progressBar: ".bar"
        },

        modelEvents: {
            "change:setupProgress": "updateProgress",
            "change:task": "updateTask"
        },

        onShow: function() {
            this.$el.tooltip({
                title: this.model.get("name"),
                placement: "bottom"
            });
            this.$el.draggable(this.getDraggableOptions());
        },

        getDraggableOptions: function () {
            var gender = this.model.get("gender");
            var opts = {
                scope: this.model.get("skill"),
                helper: function (e) {return "<i class='worker-icon icon-" + gender + " icon-2x'></i>";},
            };
            return _.defaults(opts, DRAG_DEFAULTS);
        },

        updateTask: function(worker, task) {
            if(task){
                this.bindTask(task);
            } else {
                this.bindTask(false);
            }
        },

        bindTask: function(task) {
            if(this._curTask) this.stopListening(this._curtask);
            this._curtask = task;
            if(task) this.listenTo(task, "change:progress", this.updateProgress);
            this.updateProgress();
        },

        updateProgress: function() {
            var val = 0,
                setupProgress = this.model.get("setupProgress") / this.model.get("setupTime"),
                task = this.model.get("task");

            if(task) val = task.get("progress") / task.get("total");
            if(setupProgress < 1) val = setupProgress;

            // Make it a nice clean percentage
            val = Math.ceil( val * 100 );

            this.ui.progressBar.height(val + "%");
        }

    });

    var JobWorkersView = Marionette.CollectionView.extend({
        itemView: JobWorkerView,
        className: "workers"
    });


    var JobView = Marionette.Layout.extend({
        template: "#job-template",
        className: "floor-item job span2",

        regions: {
            workersRegion: ".workers-region"
        },

        bindings: {
            ".processed .value": "processed",
            //".inventory": "inventory",
            ".limit": {
                observe: "limit",
                onGet: function (val) {
                    return val > 0 ? " of " + val : "";
                }
            },
            ".inventory": {
                observe: "inventory",
                updateMethod: "html",
                onGet: "showInventory"
            }
        },

        ui: {
            limitBtn: ".js-limit",
            inventory: ".inventory",
            processed: ".processed"
        },

        events: {
            "click .js-limit": "grabFocus",
            "click .js-set-limit": "onSetLimit",
            "click .js-remove-limit": "onRemoveLimit",
            "keyup input": "onSetKeyup",
            "dropactivate": "onActivate",
            "dropdeactivate": "onDeactivate"
        },

        onActivate: function() {
            this.$el.toggleDropOnMe();
        },

        onDeactivate: function() {
            this.$el.toggleDropOnMe(false);
        },

        showInventory: function(value) {
            var icon = "<i class='icon-archive'></i>";
            if(value <= 10){
                return new Array( value + 1 ).join(icon);
            } else {
                return [value, icon].join(" ");
            }
        },

        grabFocus: function (){
            this.$("input").focus();
        },

        onSetLimit: function () {
            this._setLimit(this.$("input").val());

        },

        onSetKeyup: function (e) {
            this.hideError();
            if(e.keyCode == 13){
                this._setLimit(this.$("input").val());
            }
        },

        _setLimit:function (val) {
            this.hideError();
            if(!_.isEmpty(val)){
                val = parseInt(val, 10);
                if(!_.isNaN(val)){
                    cur = this.model.get("produced");
                    val = val < cur ? cur : val; // you can't set lower than currently produced
                    this.model.set("limit", val);
                } else {
                    return this.showError("You must enter a number");
                }
            }
            this.closeLimit();
        },

        closeLimit:function () {
            this.ui.limitBtn.popover("hide");
        },

        onRemoveLimit: function () {
            this.model.unset("limit");
            this.closeLimit();
        },

        onRender: function() {
            this.stickit();
            var coords = App.request("resolve:coordinates", this.model.get("x"), this.model.get("y"));
            this.$el.css(coords);
            this.showWorkers();
        },

        showWorkers: function() {
            this.workersRegion.show(new JobWorkersView({collection: this.model.workers}));
        },

        onShow: function () {
            this.ui.limitBtn.popover(this.getPopoverOptions());
            this.ui.inventory.tooltip({placement:"right", delay: 500, html: true});
            this.ui.processed.tooltip({placement:"left", delay: 500, html: true});

            this.$el.droppable(this.getDrobbableOptions());
        },

        getDrobbableOptions: function () {
            var opts = {
                scope: this.model.get("skillRequired"),
                drop: _.bind(this.onDrop, this)
            };
            return _.defaults(opts, DROP_DEFAULTS);
        },

        onDrop: function (event, ui) {
            this.trigger("worker:placed", ui.draggable.data("name"));
        },

        getPopoverOptions: function () {
            return {
                title: "Stop after?",
                html: true,
                content: _.template($("#job-limit-popover-template").html()),
                placement: "left"
            };
        },

        showError: function (error) {
            var group = this.$(".control-group");
            group.addClass("error");
            group.find(".help-block").text(error);
        },

        hideError:function () {
            var group = this.$(".control-group");
            group.removeClass("error");
            group.find(".help-block").text("");
        }

    });

    Show.JobsView = Marionette.CollectionView.extend({
        itemView: JobView
    });


});