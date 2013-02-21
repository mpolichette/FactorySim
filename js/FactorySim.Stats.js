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
        },

        resourcesBought: function(ResourceName){
            var groupedPurchases = _.groupBy(this.get("purchases"), function(purchase){
                return purchase.resource.get("name");
            });
            if(groupedPurchases[ResourceName]){
                var numberPurchased = _.reduce(
                    _.pluck(groupedPurchases[ResourceName], "quantity"),
                    function(memo, num){
                        return memo + num;
                    });
                return numberPurchased;
            } else {
                return 0;
            }
        },

        widgetRevenue: function(marketName){
            var grouped_sales = _.groupBy(this.get("sales"), function(sale){
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
                return 0;
            }
        },

        widgetsSold: function(marketName){
            var grouped_sales = _.groupBy(this.get("sales"), function(sale){
                return sale.market.get("name");
            });

            if(grouped_sales[marketName]){
                return grouped_sales[marketName].length;
            } else {
                return 0;
            }
        },

        timeSpent: function(){
            var statsByUser = {};
            var grouped_statuses = _.groupBy(this.get("statuses"), function(status){
                return status.worker.get("name");
            });

            _.each(grouped_statuses, function(statuses, workerName, groups){
                var userStats = {};
                var groupedByType = _.groupBy(statuses, function(status){
                    return status.status;
                });

                _.each(groupedByType, function(statusTypes, type, groups){
                    userStats[type] = statusTypes.length;
                });
                statsByUser[workerName] = userStats;
            });
            return statsByUser;
        }

    });


       // Statistics View
    // ---------------

    Stats.StatisticsView = Marionette.ItemView.extend({
        template: "#stats_template",
        id: "stats",
        className: "row",

        events: {
            "click .submit-score": "submitScore"
        },

        submitScore: function(){
            // This is really ugly!
            var data = {};

            // Add users
            App.users.each(function(user, index, users){
                data["FName" + (index + 1)] = user.get("firstName");
                data["LName" + (index + 1)] = user.get("lastName");
                data["ID" + (index + 1)] = user.get("schoolID");
            });

            // Add Outcomes
            data["Profit"] = this.model.get("weekEnd").profit;
            data["cashAtEnd"] = this.model.get("weekEnd").cash;

            // Add sales
            data["W1Sold"] = this.model.widgetsSold("Widget 1");
            data["W2Sold"] = this.model.widgetsSold("Widget 2");
            data["W2Sold"] = this.model.widgetsSold("Widget 2");

            // Add purchases (super hacky)
            data["MatAPurch"] = this.model.resourcesBought("Raw Material A") + 25;
            data["MatBPurch"] = this.model.resourcesBought("Raw Material B") + 25;
            data["MatCPurch"] = this.model.resourcesBought("Raw Material C") + 15;
            data["MatDPurch"] = this.model.resourcesBought("Raw Material D") + 10;

            // Lost worker stats
            _.each(this.model.timeSpent(), function(stats, worker){
                var firstLetter = worker.substring(0,1);
                data[firstLetter + "Idle"] = stats["Idle"] || 0;
                data[firstLetter + "Work"] = stats["Working"] || 0;
                data[firstLetter + "Unassign"] = stats["Unassigned"] || 0;
                data[firstLetter + "Setup"] = stats["Setting Up"] || 0;
                data[firstLetter + "Stop"] = stats["Stopped"] || 0;
            });

            $.ajax({
                type: "POST",
                url: "record_scores.cfm",
                data: data,
                success: function(data, status, jqXHR){
                    alert("Data submitted Succesfully");
                },
                error: function(jqXHR, status, error){
                    alert("Score submit failed");
                }

            });

        },

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
                    return 0;
                }
            },
            widgetSold: function(marketName){
                var grouped_sales = _.groupBy(this.sales, function(sale){
                    return sale.market.get("name");
                });

                if(grouped_sales[marketName]){
                    return grouped_sales[marketName].length;
                } else {
                    return 0;
                }
            }
        }
    });

});