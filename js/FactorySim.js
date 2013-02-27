
// Main Application Declaration
var FactorySim = new Backbone.Marionette.Application();

FactorySim.on('initialize:before', function(){
    this.addRegions({
        headerRegion: "#header",
        mainRegion: "#content",
        modalRegion: {
            selector: "#modal",
            regionType: FactorySim.Util.ModalRegion
        }
    });
});

FactorySim.on('initialize:after', function(){
  Backbone.history.start();
});





    // mainRegion: "#content",
    // clockRegion: {
    //     selector: "#clock",
    //     regionType: FactorySim.ReplaceRegion
    // },
    // bankRegion: {
    //     selector: "#bank",
    //     regionType: FactorySim.ReplaceRegion
    // },
    // profitRegion: {
    //     selector: "#profit",
    //     regionType: FactorySim.ReplaceRegion
    // },
    // optionsRegion: {
    //     selector: "#options",
    //     regionType: FactorySim.ReplaceRegion
    // },
    // workforceRegion: {
    //     selector: "#workforce",
    //     regionType: FactorySim.ReplaceRegion
    // },
    // modalRegion: {
    //     selector: "#modal",
    //     regionType: FactorySim.ModalRegion
    // }