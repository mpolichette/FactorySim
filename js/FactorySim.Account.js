FactorySim.module("Account", function(Account, App, Backbone, Marionette, $, _){

    Account.User = Backbone.Model.extend({
        defaults:{
            firstName: "",
            lastName: "",
            schoolId: ""
        },

        validate: function(attrs, options) {
            var hasFirstName = attrs.firstName && attrs.firstName.length > 0;
            var hasLastName = attrs.lastName && attrs.lastName.length > 0;
            var hasSchoolId = attrs.schoolId && attrs.schoolId.length > 0;

            if(hasFirstName && hasLastName) return;
            if(hasSchoolId) return;

            return {
                message: "You must supply both a first and last name OR a school id",
                needsFirstName: !hasFirstName,
                needsLastName: !hasLastName,
                needsSchoolId: !hasSchoolId
            };
        }
    });

    Account.Users = Backbone.Collection.extend({
        model: Account.User
    });

    // User View
    // ---------

    Account.UserView = Marionette.ItemView.extend({
        template: "#user_tempalte",
        tagName: "li",
        className: "user",
        model: Account.User,

        templateHelpers: {
            displayUser: function(){
                var name = "";
                if(this.firstName || this.lastName){
                    name = this.firstName + " " + this.lastName;
                    if(this.schoolId){
                        name = name + " (" + this.schoolId + ")";
                    }
                }
                else {
                    name = this.schoolId;
                }
                return name;
            }
        },

        events: {
            "click .js-remove-user": "removeUser"
        },

        removeUser: function(){
            this.model.destroy();
            this.remove();
        }
    });

    Account.NewUserView = Marionette.ItemView.extend({
        template: "#new_user_template",
        className: "new-user",

        ui: {
            firstName: ".first-name",
            lastName: ".last-name",
            schoolId: ".school-id"
        },

        events: {
            "click .js-save-user": "saveUser"
        },

        onShow: function(){
            this.ui.firstName.find("input").focus();
        },

        saveUser: function(){
            var user = new Account.User();

            var success = user.set({
                firstName: this.ui.firstName.find("input").val(),
                lastName: this.ui.lastName.find("input").val(),
                schoolId: this.ui.schoolId.find("input").val()
            }, {
                validate: true
            });

            if(success){
                Account.users.add(user);
                this.close();
            }
            else {
                this._showError(user.validationError);
            }
        },

        _showError: function(error){
            // Check First name
            if(error.needsFirstName){
                this.ui.firstName.addClass("error");
            } else {
                this.ui.firstName.removeClass("error");
            }
            // Check last name
            if(error.needsLastName){
                this.ui.lastName.addClass("error");
            } else {
                this.ui.lastName.removeClass("error");
            }
            // Check School Id
            if(error.needsFirstName && error.needsLastName){
                this.ui.schoolId.addClass("error");
            } else {
                this.ui.schoolId.removeClass("error");
            }
        }

    });

    Account.NoUsersView = Marionette.ItemView.extend({
        template: "#no-users-template"
    });

    Account.UserListView = Marionette.CollectionView.extend({
        itemView: Account.UserView,
        emptyView: Account.NoUsersView,
        tagName: "ul"
    });


    // Login View
    // ----------
    Account.LoginView = Marionette.Layout.extend({
        template: "#login_template",
        className: "modal hide fade login-modal",

        initialize: function(){
            this.listenTo(Account.users, "add", this._checkUserCount, this);
            this.listenTo(Account.users, "remove", this._checkUserCount, this);
            this.listenTo(Account.users, "reset", this._checkUserCount, this);
        },

        regions: {
            newUserRegion: ".new-user-holder",
            userListRegion: ".user-list"
        },

        templateHelpers: {
            showAddButton: function(){
                return Account.users.length < 3;
            },
            hasUser: function(){
                return  Account.users.length > 0;
            }
        },

        ui: {
            newUserButton: ".js-new-user",
            startGameButton: ".js-start-game"
        },

        events: {
            "click .js-new-user": "onNewUser",
            "click .js-start-game": "startGame"
        },

        onRender: function(){
            var view = new Account.UserListView({collection: Account.users});
            this.userListRegion.show(view);
        },

        _checkUserCount: function(){
            // Update Add user button
            if( Account.users.length < 3){
                this.ui.newUserButton.show();
            }
            else {
                this.ui.newUserButton.hide();
            }

            // Update Start game button
            if( Account.users.length > 0 ){
                this.ui.startGameButton.text("Start game");
                this.ui.startGameButton.addClass("btn-primary");
            }
            else {
                this.ui.startGameButton.text("Skip");
                this.ui.startGameButton.removeClass("btn-primary");
            }

        },

        onNewUser: function(){
            var view = new Account.NewUserView();
            this.newUserRegion.show(view);
        },

        startGame: function(){
            // Verify that we have a user or are skipping
            if(Account.users.length < 1){
                var message = "Without any information, you will not be able to submit your score.  Click ok to skip.";
                if (!confirm(message)){
                    return;
                }
            }

            // Otherwise start the app!
            this.trigger("startGame");
        }
    }),

    // Account Controller
    // ------------------
    // This is the entry point for the game.  It will bind to
    // the start button.

    Account.Controller = Marionette.Controller.extend({
        initialize: function(args){
            // Make all the controllers' function operate in its' context
            _.bindAll(this);

            this.loginRegion = args.loginRegion;

            // Create users collection
            Account.users = new Account.Users();
        },

        show: function(){
            // The application starts w/ a big button to start the app, bind to it
            $(".js-start").on("click", this.showLogin);
        },

        showLogin: function(){
            // Create the view
            var loginview = new Account.LoginView({
                collection: Account.users
            });

            // Listen for start game
            this.listenTo(loginview, "startGame", this.onStartGame, this);

            // Show the view
            this.loginRegion.show(loginview);

        },

        onStartGame: function(){
            this.loginRegion.dismiss();
            App.Game.start(App.settings);
        }
    });

    Account.addInitializer(function(args){
        this.controller = new Account.Controller({
            loginRegion: App.modalRegion
        });
        this.controller.show();
    });
});
