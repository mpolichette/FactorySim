(function(Backbone, Marionette, $, _) {

    Marionette.Region.ModalRegion = Marionette.Region.extend({
        initialize: function(){
            this.ensureEl();
            this.$el.on("hidden", _.bind(this.closeModal, this));
        },

        onShow: function(view){
            var options = this.getDefaultOptions(_.result(view, "modal"));
            this.$el.modal(options);
        },

        closeModal: function(){
            this.close();
        },

        // A bit unneccesary but as a learning exercise
        getDefaultOptions: function (options) {
            options = options || {};
            return _.defaults(options, {});
        }
    });

})(Backbone, Backbone.Marionette, $, _);