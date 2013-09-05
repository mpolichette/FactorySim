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
        className: function () {
            return "media worker " + this.model.get("skill").toLowerCase();
        },
        attributes: function () { return {"data-name": this.model.get("name")}; },

        bindings: {
            ":el": {
                attributes: [{
                    name: "class",
                    observe: "status",
                    onGet: "getStatus"
                }]
            },
            ".status": {
                observe: "status"
            }
        },

        ui: {
            icon: ".media-object"
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
            return val.toLowerCase().replace(/\s+/g, '');
        },

        onRender: function  () {
            this.stickit();
        },

        onShow: function () {
            this.$el.draggable(this.getDraggableOptions());
        },

        getDraggableOptions: function () {
            // TODO get some settings based on worker type
            var gender = this.model.get("gender"),
                skill = this.model.get("skill"),
                opts = {
                scope: skill,
                helper: function (e) {return "<i class='worker-icon icon-" + gender + " " + skill + " icon-2x'></i>";}
            };
            return _.defaults(opts, DRAG_DEFAULTS);
        }

    });

    var WorkerGroupView = Marionette.CompositeView.extend({
        template: "#worker-group-template",
        className: "worker-group",

        itemView: WorkerView,
        itemViewContainer: ".workers",

        ui: {
            status: ".worker-heading small"
        },

        onShow: function() {
            this.ui.status.tooltip({
                placement: "left",
                delay: {
                    show: 300,
                    hide: 100
                }
            });
        }
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