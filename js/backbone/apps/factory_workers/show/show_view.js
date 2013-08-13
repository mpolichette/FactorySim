FactorySim.module("FactoryWorkersApp.Show", function(Show, App, Backbone, Marionette, $, _){

    var DRAG_DEFAULTS = {
        revert: "invalid",
        cursorAt: {top:25, left: 15},
        containment: "#main-region"
        };


    Show.Layout = Marionette.Layout.extend({
        template: "#worker-layout-template",

        regions: {
            workerRegion: "#worker-groups"
        },

        onShow: function() {
            this.$el.affix();
        }
    });

    var WorkerView = Marionette.ItemView.extend({
        template: "#worker-template",
        className: "worker media",
        attributes: function () { return {"data-name": this.model.get("name")}; },

        bindings: {
            ":el": {
                attributes: [{
                    name: "class",
                    observe: "status",
                    onGet: "getStatus"
                }]
            },
            ".js-status": {
                observe: "status",
                onGet: function(val) { return " - " + val; }
            }
        },

        events: {
            "mouseenter": "onEnter",
            "mouseleave": "onLeave"
        },

        onEnter: function() {
            $("[data-name=" + this.model.get("name") + "]").tooltip("show");
        },

        onLeave: function() {
            $("[data-name=" + this.model.get("name") + "]").tooltip("hide");
        },

        getStatus: function(val) {
            return val.toLowerCase();
        },

        ui: {
            icon: ".media-object"
        },

        onRender: function  () {
            this.stickit();
        },

        onShow: function () {
            this.$el.draggable(this.getDraggableOptions());
        },

        getDraggableOptions: function () {
            // TODO get some settings based on worker type
            var gender = this.model.get("gender");
            var opts = {
                scope: this.model.get("skill"),
                helper: function (e) {return "<i class='worker-icon icon-" + gender + " icon-2x'></i>";},
            };
            return _.defaults(opts, DRAG_DEFAULTS);
        }

    });

    var WorkerGroupView = Marionette.CompositeView.extend({
        template: "#worker-group-template",
        className: "worker-group",

        itemView: WorkerView,
        itemViewContainer: ".workers"
    });

    Show.WorkersView = Marionette.CollectionView.extend({
        itemView: WorkerGroupView,
        className: "worker-group-list",
        itemViewOptions: function (model, index) {
            return {
                collection: model.workers
            };
        }
    });

});