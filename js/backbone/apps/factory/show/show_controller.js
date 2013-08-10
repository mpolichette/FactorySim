FactorySim.module("FactoryApp.Show", function(Show, App, Backbone, Marionette, $, _){

    Show.Controller = App.Controllers.Base.extend({
        initialize: function (options) {
            this.factory = options.factory;
            this.layout =  this.getLayout();

            this.listenTo(this.layout, "show", function () {
                this.showFloor();
                this.showWorkers();
            });

            this.show(this.layout);
        },

        showFloor: function () {
            App.execute("show:floor", {
                region: this.layout.floorRegion,
                factory: this.factory
            });
        },

        showWorkers: function () {
            App.execute("show:workers", {
                region: this.layout.workersRegion,
                factory: this.factory
            });
        },

        getLayout: function () {
            return new Show.Layout();
        }


    });

});