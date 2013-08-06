FactorySim.module("UserApp", function(UserApp, App, Backbone, Marionette, $, _){

    var API = {
        showLogin: function(){
            var controller = new UserApp.Login.Controller({
                region: App.modalRegion
            });
        },
        listUsers: function(region){
            var controller = new UserApp.List.Controller({
                region: region
            });
        }
    };

    App.commands.setHandler("list:users", function(region){
        API.listUsers(region);
    });

    UserApp.addInitializer(function(options){
        // Listen for start event
        this.listenTo(App.vent, "welcome:start:clicked", function(){
            API.showLogin();
        });
    });

});