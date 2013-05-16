(function () {

    _.extend(Backbone.Marionette.Application.prototype, {

        navigate: function(route, options){
            Backbone.history.navigate(route, options);
        },

        getCurrentRoute: function(){
            var frag = Backbone.history.fragment;
            if(_.isEmpty(frag)){
                return null;
            } else {
                return frag;
            }
        },

        startHistory: function(){
            if(Backbone.history){
                Backbone.history.start();
            }
        },

        register: function(instance, id){
            this.registry = this.registry || {};
            this.registry[id] = instance;
        },

        unregister: function(instance, id){
            delete this.registry[id];
        },

        resetRegistry: function () {
            var oldCount = this.getRegistrySize();
            _.each(this.registry, function(controller, id, list){
                controller.region.close();
            }, this);
            var newCount = this.getRegistrySize();
            var message = "Closed " + oldCount + " controllers. " + newCount + " didn't close correctly.";
            if (newCount > 0){
                console.warn(message);
            } else{
                console.log(message);
            }
        },

        getRegistrySize: function(){
            return _.size(this.registry);
        }

    });

})();