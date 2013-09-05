FactorySim.module ("Entities", function(Entities, App, Backbone, Marionette, $, _){

    Entities.User = Entities.Model.extend({
        validation: {
            firstName: "canIdentify",
            lastName: "canIdentify",
            schoolId: "canIdentify"
        },

        canIdentify: function(val, attr, willBe){
            if((_.isEmpty(willBe.firstName) || _.isEmpty(willBe.lastName)) && _.isEmpty(willBe.schoolId)){
                return "Please supply either first and last names or a school ID";
            }
        }
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
        // Provide a consistant list of users
        var users = new Entities.UserCollection();
        App.reqres.setHandler("user:entities", function(){
            return users;
        });

        // Provide a way to lock users to prevent changes
        var usersLocked = false;
        App.commands.setHandler("user:entities:lock", function(region){
            usersLocked = true;
        });
        App.reqres.setHandler("check:user:lock", function(){
            return usersLocked;
        });

    });

});