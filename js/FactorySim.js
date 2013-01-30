
// Main Application Declaration
var FactorySim = new Backbone.Marionette.Application();
FactorySim.settings = {};

FactorySim.ReplaceRegion = Marionette.Region.extend({
    open: function(view){
        this.$el.replaceWith(view.el);
    }
});

FactorySim.addRegions({
    mainRegion: "#content",
    clockRegion: {
        selector: "#clock",
        regionType: FactorySim.ReplaceRegion
    },
    bankRegion: {
        selector: "#bank",
        regionType: FactorySim.ReplaceRegion
    },
    profitRegion: {
        selector: "#profit",
        regionType: FactorySim.ReplaceRegion
    },
    optionsRegion: {
        selector: "#options",
        regionType: FactorySim.ReplaceRegion
    },
    workforceRegion: {
        selector: "#workforce",
        regionType: FactorySim.ReplaceRegion
    }
});

FactorySim.on('initialize:after', function(){
  Backbone.history.start();
});