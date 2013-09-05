FactorySim.module("Mixins", function(Mixins, App, Backbone, Marionette, $, _){

    var COLLUMNS = [0, 90, 180, 270, 360, 450, 540],
        ROWS = [0, 100, 220, 340, 460, 580, 700, 820];

    var endpointOpts = {
            endpoint: ["Dot", {radius: 2}]
        },
        topEndpointOpts = _.extend(_.clone(endpointOpts), {
            anchor: "TopCenter"
        }),
        bottomEndpointOpts = _.extend(_.clone(endpointOpts), {
            anchor: "BottomCenter"
        });


    //anchor: [ "Perimeter", { shape:"circle" }]

    Mixins.FloorItemMixin = {

        attributes: function () {
            return {"data-floor-id": this.model.id};
        },

        onRender: function() {
            this.$el.css({
                top: ROWS[this.model.get("y")],
                left: COLLUMNS[this.model.get("x")]
            });
        },

        connectUpstreams: function () {
            var targetEP, sourceEP, view;
            this.model.upstreams.each(function(floorItem) {
                view = $("[data-floor-id=" + floorItem.id + "]");
                sourceEP = jsPlumb.addEndpoint(this.el, topEndpointOpts);
                targetEP  = jsPlumb.addEndpoint(view[0], bottomEndpointOpts);
                jsPlumb.connect({
                    source: sourceEP,
                    target: targetEP,
                    connector:[ "Flowchart", {stub:5}],
                    paintStyle: {lineWidth: 3, strokeStyle: "#332"}
                });
            }, this);
        }
    };

    Cocktail.mixins["floor-item"] = Mixins.FloorItemMixin;


});