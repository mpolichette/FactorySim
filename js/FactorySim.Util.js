FactorySim.module("Util", function(Util, App, Backbone, Marionette, $, _){


    Util.ReplaceRegion = Marionette.Region.extend({
        open: function(view){
            this.$el.replaceWith(view.el);
        }
    });

    Util.ModalRegion = Marionette.Region.extend({
        initialize: function(){
            _.bindAll(this);
        },

        open: function(view){
            this.$el.html(view.el);
            this.$el.find('.modal').modal('show');
        },

        dismiss: function(){
            this.$el.find('.modal').modal('hide');
        }
    });

});