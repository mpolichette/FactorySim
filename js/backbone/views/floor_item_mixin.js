FactorySim.module("Views", function(Views, App, Backbone, Marionette, $, _){


    var COLLUMNS = [0, 90, 180, 270, 360, 450, 540],
        ROWS = [0, 120, 240, 360, 480, 600, 720, 840];

    Views.FloorItemMixin = {
        setPosition: function() {
            this.$el.css({
                left: Show.COLLUMNS[this.model.get("x")],
                top: Show.ROWS[this.model.get("y")]
            });
        }
    };

});