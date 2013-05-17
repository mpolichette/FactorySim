FactorySim.module ("Entities", function(Entities, App, Backbone, Marionette, $, _){

    Entities.User = Entities.Model.extend({

    });

    Entities.UserCollection = Backbone.Collection.extend({
        model: Entities.User
    });

    var API = {
        newUser: function(){
            return new Entities.User();
        }
    };

    App.reqres.setHandler("new:user:entity", function(){
        return API.newUser();
    });


    Entities.addInitializer(function(options){
        var users = new Entities.UserCollection();
        App.reqres.setHandler("user:entities", function(){
            return users;
        });
    });

});