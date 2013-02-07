FactorySim.module("Stats", function(Stats, App, Backbone, Marionette, $, _){

    Stats.StatKeeper = Backbone.Model.extend({

        initialize: function(attributes, options){
            // Bind local options
            this.clock = options.clock;
            //Listen to module level  events
            this.listenTo(Stats, "worker:status", this.logWorkerStatus, this);
        },

        defaults: function(){
            return {
                statuses: [],
                sales: [],
                purchases: []
            };
        },

        logWorkerStatus: function(worker){
            this.get("statuses").push({
                timeStamp: this.clock.getTimeStamp(),
                status: worker.get("status"),
                worker: worker
            });
            this.trigger("change");
            this.trigger("change:statuses");
        },

        addPurchase: function(purchase){
            this.get("purchases").push(purchase);
            this.trigger("change");
            this.trigger("change:purchases");
        },

        addSale: function(sale){
            this.get("sales").push(sale);
            this.trigger("change");
            this.trigger("change:sales");
        },

        endOfWeek: function(finalstats){
            this.set("weekEnd", finalstats);
        }
    });


       // Statistics View
    // ---------------

    Stats.StatisticsView = Marionette.ItemView.extend({
        template: "#stats_template",
        id: "stats",
        className: "row",
        templateHelpers: {
            widgetRevenue: function(marketName){
                var grouped_sales = _.groupBy(this.sales, function(sale){
                    return sale.market.get("name");
                });

                if(grouped_sales[marketName]){
                    var totalRevenue = _.reduce(
                        _.pluck(grouped_sales[marketName], "revenue"),
                        function(memo, num){
                            return memo + num;
                        });
                    return "$" + totalRevenue;
                }
                else {
                    return "none";
                }
            }
        }
    });

});