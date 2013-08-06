FactorySim.module("Entities", function(Entities, App, Backbone, Marionette, $, _){

    Entities.Job = Backbone.Model.extend({
        defaults:{
            inventory: 0,
            processed: 0
        }
    });

    Entities.JobCollection = Backbone.Collection.extend({
        model: Entities.Job
    });

    var API = {
        newJobs: function(){
            return new Entities.JobCollection(App.options.config.jobs);
        }
    };

    App.reqres.setHandler("new:job:entities", function(){
        return API.newJobs();
    });
});