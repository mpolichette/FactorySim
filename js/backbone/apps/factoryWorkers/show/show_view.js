FactorySim.module("FactoryWorkersApp.Show", function(Show, App, Backbone, Marionette, $, _){

    var DRAG_DEFAULTS = {
        revert: "invalid",
        cursorAt: {top:25, left: 15}
        };


    Show.Layout = Marionette.Layout.extend({
        template: "#worker-layout-template",

        regions: {
            workerRegion: "#worker-groups"
        }
    });

    var WorkerView = Marionette.ItemView.extend({
        template: "#worker-template",
        className: "worker media",

        ui: {
            icon: ".media-object"
        },

        onShow: function () {
            this.$el.draggable(this.getDraggableOptions());
        },

        getDraggableOptions: function () {
            // TODO get some settings based on worker type
            var gender = this.model.get("gender");
            var opts = {
                helper: function (e) {return "<i class='worker-icon icon-" + gender + " icon-2x'></i>"},
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
        itemViewOptions: function (model, index) {
            return {
                collection: model.workers
            };
        }
    });

});