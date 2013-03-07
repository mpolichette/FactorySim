// Moneky Patch to Backbone to name our backbone objects
// (This could either be moved or even removed in production)
(function () {

    function createNamedConstructor(name, constructor) {

        var fn = new Function('constructor', 'return function ' + name + '()\n' +
            '{\n' +
            '    // wrapper function created dynamically for "' + name + '" constructor to allow instances to be identified in the debugger\n' +
            '    constructor.apply(this, arguments);\n' +
            '};');
        return fn(constructor);
    }

    var originalExtend = Backbone.View.extend; // Model, Collection, Router and View shared the same extend function
    var nameProp = '__name__';
    var newExtend = function (protoProps, classProps) {
        if (protoProps && protoProps.hasOwnProperty(nameProp)) {
            // TODO - check that name is a valid identifier
            var name = protoProps[nameProp];
            // wrap constructor from protoProps if supplied or 'this' (the function we are extending)
            var constructor = protoProps.hasOwnProperty('constructor') ? protoProps.constructor : this;
            protoProps = _.extend(protoProps, {
                constructor: createNamedConstructor(name, constructor)
            });
        }
        return originalExtend.call(this, protoProps, classProps);
    };

    Backbone.Model.extend = Backbone.Collection.extend = Backbone.Router.extend = Backbone.View.extend = newExtend;
})();


// Main Application Declaration
var FactorySim = new Backbone.Marionette.Application();

FactorySim.on('initialize:before', function(){
    this.addRegions({
        toolbarRegion: "#toolbar-holder",
        workforceRegion: "#workforce-holder",
        mainRegion: "#content",
        modalRegion: {
            selector: "#modal",
            regionType: FactorySim.Util.ModalRegion
        }
    });
});

FactorySim.addInitializer(function(options){
    this.settings = options;
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