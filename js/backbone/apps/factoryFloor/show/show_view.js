FactorySim.module("FactoryFloorApp.Show", function(Show, App, Backbone, Marionette, $, _){

    var FloorItem = Marionette.ItemView.extend({

        onShow: function () {
            this.$el.css({
                left:this.model.get("x"),
                top:this.model.get("y")
            });
        }

    });

    var ResourceView = FloorItem.extend({
        template: "#resource-template",
        className: "floor-item resource span2",

        bindings: {
            ".purchased": "purchased",
            ".inventory": "inventory"
        },

        ui: {
            toggleBtn: ".js-toggle"
        },

        events: {
            "click .js-toggle": "grabFocus",
            "click .js-buy": "onBuyClicked",
            "keyup input": "onBuyKeyUp"
        },

        modelEvents: {
            "change:purchased": "closeBuy",
            "change:_error": "showBuyError"
        },

        onRender: function () {
            this.stickit();
            var opts = this.getPopoverOptions();
            this.ui.toggleBtn.popover(opts);
        },

        getPopoverOptions: function () {
            return {
                title: "How many?!",
                html: true,
                content: _.template($("#resource-popover-template").html()),
                placement: "left"
            };
        },

        grabFocus: function (){
            this.$("input").focus();
        },

        onBuyClicked: function (event) {
            var val = $(event.target).siblings("input").val();
            this._buy(val);
        },

        onBuyKeyUp: function (e) {
            this.hideError();
            if(e.keyCode == 13){
                this._buy(this.$("input").val());
            }
        },

        _buy: function (val) {
            this.hideError();
            if(!_.isEmpty(val)){
                val = parseInt(val, 10);
                if(!_.isNaN(val)){
                    this.trigger("buy:resource", val);
                } else {
                    return this.showError("You must specify a number.");
                }
            } else {
                this.closeBuy();
            }
        },

        closeBuy:function () {
            this.ui.toggleBtn.popover("hide");
        },

        showBuyError: function(model, value){
            if(!_.isEmpty(value)){
                this.showError(value);
            }
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

    Show.ResourcesView = Marionette.CollectionView.extend({
        itemView: ResourceView,
        itemViewEventPrefix: "childView"
    });

    var JobView = FloorItem.extend({
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

        onRender: function () {
            this.stickit();
            var opts = this.getPopoverOptions();
            this.ui.limitBtn.popover(opts);
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

    var MarketView = FloorItem.extend({
        template: "#market-template",
        className: "floor-item market span2",

        bindings: {
            ".produced": "produced",
            ".revenue": "revenue"
        },

        onRender: function () {
            this.stickit();
        }

    });

    Show.MarketsView = Marionette.CollectionView.extend({
        itemView: MarketView
    });

    /**
     * FloorView is mostly a layout holder for the individual items, giving me
     * regions to use for each of my collection views.  This allows me to use
     * the built in mechanisms for view closing
     */
    Show.FloorView = Marionette.Layout.extend({
        template: "#floor-template",
        className: "floor row",
        regions:{
            resourcesRegion: "#resources-region",
            jobsRegion: "#jobs-region",
            marketsRegion: "#markets-region"
        },

        /**
         * This function causes popovers to close when clicked away from them.  This
         * is not really the "Ideal" location for this, but it is quite opportune.
         */
        onRender: function () {
            $('body').on('click', function (e) {
                $('.popover').siblings().each(function () {
                    //the 'is' for buttons that trigger popups
                    //the 'has' for icons within a button that triggers a popup
                    if (!$(this).is(e.target) && $(this).has(e.target).length === 0 && $('.popover').has(e.target).length === 0) {
                        $(this).popover('hide');
                    }
                });
            });
        },
        onClose: function () {
            $('body').off('click');
        }
    });


});