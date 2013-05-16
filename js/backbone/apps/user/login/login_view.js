FactorySim.module("UserApp.Login", function(Login, App, Backbone, Marionette, $, _){

    Login.LoginView = Marionette.ItemView.extend({
        template: "#login-template",

        templateHelpers: {
            showAddButton: function(){return true;},
            hasUser: function(){return false;}
        }
    });

});