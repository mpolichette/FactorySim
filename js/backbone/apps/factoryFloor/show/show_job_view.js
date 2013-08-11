FactorySim.module("FactoryFloorApp.Show", function(Show, App, Backbone, Marionette, $, _){


    var JobView = Show.FloorItem.extend({
        template: "#job-template",
        className: "floor-item job span2",

        bindings: {
            ".inventory": "inventory",
            ".limit": {
                observe: "limit",
                onGet: function (val) {
                    return val > 0 ? " of " + val : "";
                }
            }
        },

        ui: {
            limitBtn: ".js-limit"
        },

        events: {
            "click .js-limit": "grabFocus",
            "click .js-set-limit": "onSetLimit",
            "click .js-remove-limit": "onRemoveLimit",
            "keyup input": "onSetKeyup"
        },

        modelEvents: {

        },

        grabFocus: function (){
            this.$("input").focus();
        },

        onSetLimit: function () {
            this._setLimit(this.$("input").val());

        },

        onSetKeyup: function (e) {
            this.hideError();
            if(e.keyCode == 13){
                this._setLimit(this.$("input").val());
            }
        },

        _setLimit:function (val) {
            this.hideError();
            if(!_.isEmpty(val)){
                val = parseInt(val, 10);
                if(!_.isNaN(val)){
                    cur = this.model.get("produced");
                    val = val < cur ? cur : val; // you can't set lower than currently produced
                    this.model.set("limit", val);
                } else {
                    return this.showError("You must enter a number");
                }
            }
            this.closeLimit();
        },

        closeLimit:function () {
            this.ui.limitBtn.popover("hide");
        },

        onRemoveLimit: function () {
            this.model.set("limit", 0);
            this.closeLimit();
        },

        onShow: function () {
            this.ui.limitBtn.popover(this.getPopoverOptions());
            this.$el.droppable(this.getDrobbableOptions());
        },

        getDrobbableOptions: function () {
            return {};
        },

        getPopoverOptions: function () {
            return {
                title: "Stop after?",
                html: true,
                content: _.template($("#job-limit-popover-template").html()),
                placement: "left"
            };
        },

        showError: function (error) {
            var group = this.$(".control-group");
            group.addClass("error");
            group.find(".help-block").text(error);
        },

        hideError:function () {
            var group = this.$(".control-group");
            group.removeClass("error");
            group.find(".help-block").text("");
        }

    });

    Show.JobsView = Marionette.CollectionView.extend({
        itemView: JobView
    });


});