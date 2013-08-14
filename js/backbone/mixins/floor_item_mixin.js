FactorySim.module("Mixins", function(Mixins, App, Backbone, Marionette, $, _){

    var COLLUMNS = [0, 90, 180, 270, 360, 450, 540],
        ROWS = [0, 120, 240, 360, 480, 600, 720, 840];

    Mixins.FloorItemMixin = {
        onRender: function() {
            this.$el.css({
                top: ROWS[this.model.get("y")],
                left: COLLUMNS[this.model.get("x")]
            });
        }
    };

    Cocktail.mixins["floor-item"] = Mixins.FloorItemMixin;


});