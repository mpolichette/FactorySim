FactorySim.module("UserApp.List", function(List, App, Backbone, Marionette, $, _){

    List.UserView = Marionette.ItemView.extend({
        template: "#user-template",
        templateHelpers: {
            name: function(){
                var name = "";
                if(!_.isEmpty(this.firstName)){
                    name = this.firstName;
                }
                if(!_.isEmpty(this.lastName)){
                    name = name + (name ? " " : "") + this.lastName;
                }
                return name;
            },

            school: function(){
                var sid = "";
                if(!_.isEmpty(this.schoolId)){
                    sid = this.schoolId;
                    if(!_.isEmpty(this.firstName) || !_.isEmpty(this.lastName)){
                        sid =  "(" + sid + ")";
                    }
                }
                return sid;
            },

            canRemove: function(){
                return !App.request("check:user:lock");
            },

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
        triggers: {
            "click .js-remove": "user:remove:clicked"
        }
    });

    List.EmptyView = Marionette.ItemView.extend({
        template: "#empty-user-template"
    });

    List.UserList = Marionette.CompositeView.extend({
        template: "#list-user-template",
        itemViewContainer: ".user-list",
        itemView: List.UserView,
        emptyView: List.EmptyView
    });

});