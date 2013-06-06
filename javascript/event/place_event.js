PlaceEvent.prototype = new Event();

function PlaceEvent(placeId) {
	this.placeId = placeId;
}

// VARIABLES

PlaceEvent.TYPE = "PlaceEvent";

// /VARIABLES

// FUNCTIONS

PlaceEvent.prototype.getPlaceId = function() {
	return this.placeId;
};

PlaceEvent.prototype.getType = function() {
	return PlaceEvent.TYPE;
};

// /FUNCTIONS
