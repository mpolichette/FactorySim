(function(Backbone, Marionette, $, _) {

    Marionette.Region.ModalRegion = Marionette.Region.extend({
        initialize: function(){
            this.ensureEl();
            this.$el.on("hidden", _.bind(this.closeModal, this));
        },

        onShow: function(view){
            this.setupBindings(view);

            var options = this.getDefaultOptions(_.result(view, "modal"));
            this.$el.modal(options);
        },

        closeModal: function(){
            this.$el.modal('hide');
            this.stopListening();
            this.close();
        },

        // A bit unneccesary but as a learning exercise
        getDefaultOptions: function (options) {
            options = options || {};
            return _.defaults(options, {});
        },

        setupBindings: function(view){
            this.listenTo(view, {
                "close modal:close": this.closeModal
            });
        }
    });

})(Backbone, Backbone.Marionette, $, _);