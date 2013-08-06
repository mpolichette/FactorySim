FactorySim.module("Entities", function(Entities, App, Backbone, Marionette, $, _){

    Entities.Worker = Backbone.Model.extend({
        defaults:{
        }
    });

    Entities.WorkerCollection = Backbone.Collection.extend({
        model: Entities.Worker
    });

    var API = {
        newWorkers: function(){
            return new Entities.WorkerCollection(App.options.config.workers);
        }
    };

    App.reqres.setHandler("new:worker:entities", function(){
        return API.newWorkers();
    });
});