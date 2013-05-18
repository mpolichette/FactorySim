FactorySim.module("UserApp.Login", function(Login, App, Backbone, Marionette, $, _){

    Login.LoginLayout = Marionette.Layout.extend({
        template: "#login-template",
        regions:{
            listUserRegion: ".list-user-region",
            newUserRegion: ".new-user-region"
        },
        collectionEvents:{
            "add remove reset": "updateStartGameBtn"
        },
        triggers: {
            "click .js-start-game": "game:start"
        },
        ui: {
            startGameBtn: ".js-start-game",
            dividerHolder: "divider-holder"
        },

        onRender: function(){
            this.updateStartGameBtn();
        },

        updateStartGameBtn: function(){
            if(this.collection.length === 0){
                this.ui.startGameBtn.removeClass("btn-primary");
                this.ui.startGameBtn.text("Skip");
            } else {
                this.ui.startGameBtn.addClass("btn-primary");
                this.ui.startGameBtn.text("Start Game");
            }
        },

        showDivider: function(){
            this.ui.dividerHolder.append($("<hr>"));
        },
        hideDivider: function(){
            this.ui.dividerHolder.empty();
        }
    });

    Login.AddUserView = Marionette.ItemView.extend({
        template: "#add-user-template",
        triggers: {
            "click .js-add": "user:add:clicked"
        },
        ui: {
            addBtn: ".js-add"
        },
        onShow: function(){
            this.ui.addBtn.focus();
        }
    });

    Login.NewUserView = Marionette.ItemView.extend({
        template: "#new-user-template2",
        triggers: {
            "click .js-save": "user:save",
            "form submit": "user:save"
        },

        bindings: {
            "[name=firstName]": {
                observe: "firstName",
                attributes: [{
                    name: "class",
                    onGet: "checkValid"
                }]
            },
            "[name=lastName]": "lastName",
            "[name=schoolId]": "schoolId",
            ".js-save": {
                attributes: [{
                    name: "disabled",
                    observe: ["firstName", "lastName", "schoolId"],
                    onGet: function(values){
                        return !this.model.isValid(true);
                    }
                }]
            }
        },

        ui: {
            firstInput: "[name=firstName]"
        },

        checkValid: function(){
            return this.model.isValid(true) ? "error" : "";
        },

        onRender: function(){
            this.stickit();
        },

        onShow:function(){
            this.ui.firstInput.focus();
        }

    });

});