
// Main Application Declaration
var FactorySim = new Backbone.Marionette.Application();
FactorySim.settings = {};

var ReplaceRegion = Marionette.Region.extend({
    open: function(view){
        this.$el.replaceWith(view.el);
    }
});

FactorySim.addRegions({
    mainRegion: "#content",
    clockRegion: {
        selector: "#clock",
        regionType: ReplaceRegion
    },
    bankRegion: {
        selector: "#bank",
        regionType: ReplaceRegion
    },
    profitRegion: {
        selector: "#profit",
        regionType: ReplaceRegion
    },
    optionsRegion: {
        selector: "#options",
        regionType: ReplaceRegion
    },
    workforceRegion: {
        selector: "#workforce",
        regionType: ReplaceRegion
    }
});

FactorySim.on('initialize:after', function(){
  Backbone.history.start();
});