FactorySim.module("UserApp.List", function(List, App, Backbone, Marionette, $, _){

    List.Controller =  App.Controllers.Base.extend({

        initialize: function(){
            var view = this.listUsers();
            this.show(view);
        },

        listUsers: function(){
            var users = App.request("user:entities");
            var view = new List.UserList({collection: users});
            this.listenTo(view, "itemview:user:remove:clicked", this.removeUser);
            return view;
        },

        removeUser: function(args){
            if(!App.request("check:user:lock")){
                args.model.destroy();
            }
        }


    });


});