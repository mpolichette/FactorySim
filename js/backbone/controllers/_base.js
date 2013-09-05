FactorySim.module ("Controllers", function(Controllers, App, Backbone, Marionette, $, _){

    Controllers.Base = Marionette.Controller.extend({

        constructor: function(options){
            this.region = options.region;
            Marionette.Controller.prototype.constructor.call(this, options);
            this._instanceId = _.uniqueId("controller");
            App.execute("register:instance", this, this._instanceId);
        },

        close: function(){
            delete this.region;
            delete this.options;
            Marionette.Controller.prototype.close.apply(this);
            App.execute("unregister:instance", this, this._instanceId);
        },

        show: function(view){
            this.listenTo(view, "close", this.close);
            this.region.show(view);
        }

    });

});