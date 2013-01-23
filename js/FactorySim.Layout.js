FactorySim.module("Layout", function(Layout, FactorySim, BackBone, Marionette, $, _){

    Layout.Controls = BackBone.Marionette.ItemView.extend({
        template:"#controls_template"
    });

});