FactorySim.module("Account", function(Account, App, Backbone, Marionette, $, _){

    Account.User = Backbone.Model.extend({
        defaults:{
            firstName: "",
            lastName: "",
            schoolID: ""
        },

        isValid: function(){
            if((this.has("firstName") && this.get("firstName").length > 0 &&
                this.has("lastName")) && this.get("lastName").length > 0 ||
                (this.has("schoolID") && this.get("schoolID").length >0)){
                return true;
            }
            return false;
        }
    });

    Account.Users = Backbone.Collection.extend({
        model: Account.User,

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

    Account.UserView = Marionette.ItemView.extend({
        template: "#user_tempalte",
        className: "name clearfix",
        model: Account.User,

        events: {
            "keyup input": "saveFields"
        },

        ui: {
            fName: ".first-name input",
            lName: ".last-name input",
            school: ".school-id input"
        },

        saveFields: function(){
            this.model.set({
                "firstName": this.ui.fName.val(),
                "lastName": this.ui.lName.val(),
                "schoolID": this.ui.school.val()
            }, {validate:true});
        }
    });

    // Welcome View
    // ------------

    Account.SignInView = Marionette.CompositeView.extend({
        template: "#signin_template",
        className: "modal-inner signin",
        itemView: Account.UserView,
        itemViewContainer: ".names",
        emptyView: Account.UserView,

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
