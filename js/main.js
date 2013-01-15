
// Router
var Simulator = Backbone.Router.extend({

    routes:{
        "":"main"
    },

    main:function () {
        window.factory = this.factory = new Factory();
    }
});

var simulator = new Simulator();
Backbone.history.start();