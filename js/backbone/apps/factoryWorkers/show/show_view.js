FactorySim.module("FactoryWorkersApp.Show", function(Show, App, Backbone, Marionette, $, _){

    Show.Layout = Marionette.Layout.extend({
        template: "#worker-layout-template",

        regions: {
            workerRegion: "#worker-groups"
        }
    });

    var WorkerView = Marionette.ItemView.extend({
        template: "#worker-template",
        className: "worker"
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