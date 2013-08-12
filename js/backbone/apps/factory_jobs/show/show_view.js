FactorySim.module("FactoryJobsApp.Show", function(Show, App, Backbone, Marionette, $, _){

    var DROP_DEFAULTS = {

    };

    var JobWorkerView = Marionette.ItemView.extend({
        template: _.template("&nbsp;"),
        tagName: "i",
        className: function() {
            return "icon-" + this.model.get("gender") + " icon-2x";
        },
        attributes: function () { return {"data-name": this.model.get("name")}; }

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
            ".processed": "processed",
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
            limitBtn: ".js-limit"
        },

        events: {
            "click .js-limit": "grabFocus",
            "click .js-set-limit": "onSetLimit",
            "click .js-remove-limit": "onRemoveLimit",
            "keyup input": "onSetKeyup"
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
            this.model.set("limit", 0);
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