FactorySim.module("HeaderApp", function(HeaderApp, App, Backbone, Marionette, $, _){
    this.startWithParent = false;

    var API = {
        show: function(){
            var controller = new HeaderApp.Show.Controller({
                region: App.headerRegion
            });

        }

    };

    HeaderApp.addInitializer(function(options){
        API.show();
    });

});