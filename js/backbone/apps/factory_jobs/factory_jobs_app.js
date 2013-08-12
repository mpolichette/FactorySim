FactorySim.module("FactoryJobsApp", function(FactoryJobsApp, App, Backbone, Marionette, $, _){

    var API = {
        showJobs: function(options){
            var controller = new FactoryJobsApp.Show.Controller({
                region: options.region,
                jobs: options.jobs
            });
        }
    };

    App.commands.setHandler("show:jobs", function(options){
        API.showJobs(options);
    });


});