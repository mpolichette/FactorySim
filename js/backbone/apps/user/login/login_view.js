FactorySim.module("UserApp.Login", function(Login, App, Backbone, Marionette, $, _){

    Login.LoginLayout = Marionette.Layout.extend({
        template: "#login-template",
        regions:{
            listRegion: ".list-user-region",
            newUserRegion: ".new-user-region"
        },

        triggers: {
            "click .js-new": "new:user:clicked"
        },

        templateHelpers: {
            showAddButton: function(){return true;},
            hasUser: function(){return false;}
        }
    });

    Login.NewUserView = Marionette.ItemView.extend({
        template: "#new-user-template",

        bindings: {
            "[name=firstName]": "firstName",
            "[name=lastName]": "lastName",
            "[name=schoolId]": "schoolId"
        },

        onRender: function(){
            this.stickit();
        }
    });

    Login.EmptyView = Marionette.ItemView.extend({
        template: "#empty-user-template"
    });

    Login.UserList = Marionette.CollectionView.extend({
        itemView: Login.NewUserView,
        emptyView: Login.EmptyView
    });

});