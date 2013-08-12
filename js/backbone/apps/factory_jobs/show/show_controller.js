FactorySim.module("FactoryJobsApp.Show", function(Show, App, Backbone, Marionette, $, _){

    Show.Controller = App.Controllers.Base.extend({

        initialize: function(options) {
            this.jobs = options.jobs;
            var view = this.getView();

            this.show(view);
        },

        getView: function () {
            var view = new Show.JobsView({collection: this.jobs});

            this.listenTo(view, {
                "itemview:worker:placed": this.onWorkerPlaced
            });

            return view;

        },

        onWorkerPlaced: function (view, workerName) {
            App.vent.trigger("assign:job", workerName, view.model);
        }
    });

});