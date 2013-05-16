FactorySim.module("UserApp.Login", function(Login, App, Backbone, Marionette, $, _){

    Login.Controller = App.Controllers.Base.extend({

        initialize: function(){
            var loginView = this.getLoginView();

            this.show(loginView);
        },

        getLoginView: function(){
            return new Login.LoginView();
        }
    });

});