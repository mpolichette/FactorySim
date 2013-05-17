FactorySim.module("UserApp.Login", function(Login, App, Backbone, Marionette, $, _){

    Login.Controller = App.Controllers.Base.extend({

        initialize: function(){
            this.layout = this.getLoginLayout();

            this.listenTo(this.layout, {
                "render": this.userList,
                "new:user:clicked": this.onNewUserClicked
            });

            this.show(this.layout);
        },

        userList: function(){
            var view = new Login.UserList();
            this.layout.listRegion.show(view);
        },

        onNewUserClicked: function(){
            if(!this.layout.newUserRegion.currentView){
                var user = App.request("new:user:entity");
                var view = new Login.NewUserView({model: user});
                this.layout.newUserRegion.show(view);
            }
        },

        getLoginLayout: function(){
            return new Login.LoginLayout();
        }
    });

});


// var users = App.request("user:entities");