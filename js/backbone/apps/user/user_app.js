FactorySim.module("UserApp", function(UserApp, App, Backbone, Marionette, $, _){

    var API = {
        showLogin: function(){
            var controller = new UserApp.Login.Controller({
                region: App.modalRegion
            });

        }

    };

    UserApp.addInitializer(function(options){
        // Listen for start event
        this.listenTo(App.vent, "start:clicked", function(){
            API.showLogin();
        });
    });

});