FactorySim.module("FactoryWorkersApp.Show", function(Show, App, Backbone, Marionette, $, _){


    Show.Controller = App.Controllers.Base.extend({

        initialize: function (options) {
            this.factory = options.factory;
            this.workers = this.groupWorkers(this.factory.workers);

            this.layout = this.getLayout();

            this.listenTo(this.layout, "show", function () {
                this.showWorkers();
            });

            this.show(this.layout);
        },

        showWorkers: function () {
            var view = this.getWorkersView();
            this.layout.workerRegion.show(view);
        },

        getWorkersView: function () {
            return new Show.WorkersView({collection: this.workers});
        },

        getLayout: function () {
            return new Show.Layout();
        },

        groupWorkers: function (workers) {
            // Group the workers into groups
            var groups = _.map(workers.groupBy("skill"), function (workers, skill) {
                var group = new Backbone.Model({
                    name: skill,
                    setupTime: _.first(workers).get("setupTime")
                });
                group.workers = new Backbone.Collection(workers);
                return group;
            }, this);

            // Return a collection of groups
            return new Backbone.Collection(groups);
        }

    });

});