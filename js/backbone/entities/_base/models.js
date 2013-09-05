FactorySim.module ("Entities", function(Entities, App, Backbone, Marionette, $, _){

    Entities.Model = Backbone.Model.extend({

    });
    _.extend(Entities.Model.prototype, Backbone.Validation.mixin);

});

