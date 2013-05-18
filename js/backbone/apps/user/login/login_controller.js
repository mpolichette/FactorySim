FactorySim.module("UserApp.Login", function(Login, App, Backbone, Marionette, $, _){

    Login.Controller = App.Controllers.Base.extend({

        initialize: function(options){
            this.options = this.getDefaultOptions(options);
            this.users = this.getUserList();
            this.layout = this.getLoginLayout();
            this.show(this.layout);
        },

        getDefaultOptions: function(options){
            options = _.defaults({}, options, {
                maxUsers: 3
            });
            return options;
        },

        getUserList: function() {
            var users = App.request("user:entities");
            this.listenTo(users, "remove", this.onUserRemove);
            return users;
        },

        onUserRemove: function(){
            if(!this.layout.newUserRegion.currentView){
                this.showNewUserButton();
            }
        },

        showNewUserButton: function(){
            if(this.users.length < this.options.maxUsers){
                var view = new Login.AddUserView();
                this.listenTo(view, "user:add:clicked", this.onUserAddClicked);
                this.layout.newUserRegion.show(view);
            } else {
                this.layout.hideDivider();
                this.layout.newUserRegion.close();
            }
        },

        onUserAddClicked: function(){
            var user = App.request("new:user:entity");
            var view = new Login.NewUserView({model: user});
            this.listenTo(view, "user:save", this.saveUser);
            this.layout.newUserRegion.show(view);
        },

        showUserList: function(){
            if(this.users.length !== 0){
                this.layout.showDivider();
                App.execute("list:users", this.layout.listUserRegion);
            }
        },

        saveUser: function(args){
            if(args.model && args.model.isValid(true)){
                this.users.add(args.model);
                this.layoutParts();
            }
        },

        layoutParts: function(){
            this.showNewUserButton();
            this.showUserList();
        },

        getLoginLayout: function(){
            var view = new Login.LoginLayout({collection: this.users});

            this.listenTo(view, {
                "render": this.layoutParts,
                "game:start": this.onStartGame
            });

            return view;
        },

        onStartGame: function(){
            if(this.users.length === 0){
                if(!confirm("No credit will be given if no users exist, continue?")){
                    return;
                }
            }
            // Start the game!
            App.execute("user:entities:lock");
            App.vent.trigger("game:start");
        }
    });

});


// var users = App.request("user:entities");