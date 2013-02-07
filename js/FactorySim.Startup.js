FactorySim.module("Startup", function(Startup, App, Backbone, Marionette, $, _){

    Startup.User = Backbone.Model.extend({
        defaults:{
            FName: "",
            LName: "",
            School: ""
        },

        isValid: function(){
            if((this.has("FName") && this.get("FName").length > 0 &&
                this.has("LName")) && this.get("LName").length > 0 ||
                (this.has("School") && this.get("School").length >0)){
                return true;
            }
            return false;
        }
    });

    Startup.Users = Backbone.Collection.extend({
        model: Startup.User,

        hasValidUser: function(){
            var validUser = false;
            this.each(function(user){
                if(user.isValid()){
                    validUser = true;
                }
            });
            return validUser;
        }
    });

    // User View
    // ---------

    Startup.UserView = Marionette.ItemView.extend({
        template: "#user_tempalte",
        className: "name clearfix",

        events: {
            "keyup input": "saveFields"
        },

        ui: {
            fName: ".firstName input",
            lName: ".lastName input",
            school: ".school input"
        },

        saveFields: function(){
            this.model.set({
                "FName": this.ui.fName.val(),
                "LName": this.ui.lName.val(),
                "School": this.ui.school.val()
            }, {validate:true});
        }
    });

    // Welcome View
    // ------------

    Startup.WelcomeView = Marionette.CompositeView.extend({
        template: "#welcome_template",
        className: "modal-inner",
        itemView: Startup.UserView,
        emptyView: Startup.UserView,
        itemViewContainer: ".names",

        ui: {
            startGameButton: ".startGame"
        },

        events: {
            "click .startGame": "submitForm",
            "click .add": "addUserInput"
        },

        collectionEvents: {
            "change": "checkValid"
        },

        maxUsers: 3,

        addUserInput: function(){
            if (this.collection.length < this.maxUsers){
                this.collection.add({});
            }
            if(this.collection.length === this.maxUsers) {
                this.$(".add").remove();
                this.$(".add-msg").remove();
            }
        },

        checkValid: function(){
            if(this.collection.hasValidUser()){
                this.ui.startGameButton.text("Start Game");
            } else{
                this.ui.startGameButton.text("Skip");
            }
        },

        submitForm: function(event){
            event.preventDefault();
            if(this.collection.hasValidUser() || confirm("Withou any information, you will not be able to submit your score.  Click ok to skip.")){
               this.startGame();
           }
        },

        startGame: function(){
           App.modalRegion.dismiss();
           this.trigger("startGame");
        }
    });

});
