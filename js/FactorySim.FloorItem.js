FactorySim.module("Game", function(Game, App, Backbone, Marionette, $, _){

    Game.FloorItem = Backbone.Model.extend({

        constructor: function(){

            // Call the original constructor
            var args = Array.prototype.slice.apply(arguments);
            Backbone.Model.prototype.constructor.apply(this, args);

            if(this.has("parentIDs")){
                // Create a place to put the parents
                this.set("parents", [], {silent: true});

                // Listen to events on my collection to determine my resources
                if(this.collection && this.collection.floor){
                    this.listenTo(this.collection.floor, "add", this._checkIfParent, this);
                    this.listenTo(this.collection.floor, "remove", this._checkRemoved, this);
                    this.listenTo(this.collection.floor, "reset", this._lookForParent, this);

                    // Check if parents might already exist
                    this._lookForParent(this.collection.floor);
                }
            }
        },

        // Add parent and trigger appropriet changes
        addParent: function(parent){
            var parents = this.get("parents");
            parents.push(parent);
            this.trigger("change", this);
            this.trigger("change:parents", this, parent);
        },

        _hasAllParents: function(){
            if(this.has("parentIDs")){
                return this.get("parentIDs").length === this.get("parents").length;
            }
            else{
                return true;
            }
        },

        _checkIfParent: function(model, collection, options){
            if(!this._hasAllParents()){
                _.each(this.get("parentIDs"), function(parentID){
                    if(parentID === model.id){
                        this.addParent(model);
                    }
                }, this);
            }
        },

        _checkRemoved: function(model, collection, options){
            _.each(this.get("parents"), function(parent){
                if(parent === model){
                    // Do something if my parent is removed?
                    console.log("My parent was removed!");
                }
            }, this);
        },

        _lookForParent: function(collection, options){
            if(!this._hasAllParents()){
                _.each(collection.models, function(possibleParent){
                    this._checkIfParent(possibleParent);
                }, this);
            }
        }

    });

    Game.FloorItemCollection = Backbone.Collection.extend({
        constructor: function(){
            // Call the original constructor
            var args = Array.prototype.slice.apply(arguments);
            Backbone.Collection.prototype.constructor.apply(this, args);
            this.trigger("reset", this);
        },

        initialize: function(models, options){
            if(options && options.floor){
                this.floor = options.floor;

                // Add everything from me to the floor
                this.on("add", this._addToFloor, this);
                this.on("remove", this._removeFromFloor, this);
                this.on("reset", this._resetItems, this);
            }
        },

        _addToFloor: function(model, collection, options){
            this.floor.add(model);
        },

        _removeFromFloor: function(model, collection, options){
            this.floor.remove(model);
        },

        _resetItems: function(collection, options){
            if(options && options.previousModels){
                this.floor.remove(options.previousModels);
            }
            this.floor.add(collection.models);
        }
    });


    // Floor Collection
    // ----------------

    Game.Floor = Backbone.Collection.extend({
        initialize: function(){
            this.fetch();
        },

        model: function(attrs, options){
            switch(attrs.type){
                case "market":
                    return new Floor.Market(attrs, options);
                case "resource":
                    return new Floor.Resource(attrs, options);
                default:
                    return new Floor.Job(attrs, options);
            }
        },
        url: "data/floor.json"
    });



    // Views
    // -----

    Game.FloorView = Marionette.CollectionView.extend({

        id:'factory',
        className:'simulation',

        collectionEvents:{
            "change:sources": "updatePipe",
            "change:source": "updatePipe"
        },

        getItemView: function(item){
            switch(item.get("type")){
                case "market":
                    return Floor.MarketView;
                case "resource":
                    return Floor.ResourceView;
                default:
                    return Floor.JobView;
            }
        },

        onItemviewShow: function(targetView){
            this.connectItemView(targetView);
        },

        connectItemView: function(targetView){
            // Get the source list
            var sourceViewList = [];
            if(targetView.model.has("sources")){
                _.each(targetView.model.get("sources"), function(sourceModel){
                    sourceViewList.push(this.children.findByModel(sourceModel));
                }, this);
            } else if(targetView.model.has("source")){
                sourceViewList.push(this.children.findByModel(targetView.model.get("source")));
            }

            // Make the enpoints and connections
            _.each(sourceViewList, function(sourceView){
                var inEP = jsPlumb.addEndpoint(targetView.el, {
                                endpoint: ["Dot", {radius: 7}],
                                anchor: [ "Perimeter", { shape:"circle" }]
                            });
                var outEP = jsPlumb.addEndpoint(sourceView.el, {
                                endpoint: ["Dot", {radius: 7}],
                                anchor: [ "Perimeter", { shape:"circle" }]
                            });
                jsPlumb.connect({
                    source: inEP,
                    target: outEP,
                    connector:[ "Flowchart", {stub:5}]
                });
            }, this);
        },

        updatePipe: function(model){
            this.connectItemView(this.children.findByModel(model));
        }
    });

});