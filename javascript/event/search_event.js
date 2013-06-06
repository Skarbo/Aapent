SearchEvent.prototype = new Event();

function SearchEvent(search, latLng, callback) {
	this.search = search;
	this.latLng = latLng;
	this.callback = callback;
}

// VARIABLES

SearchEvent.TYPE = "SearchEvent";

// /VARIABLES

// FUNCTIONS

/**
 * @return {string}
 */
SearchEvent.prototype.getSearch = function() {
	return this.search;
};

/**
 * @return {Object}
 */
SearchEvent.prototype.getLatLng = function() {
	return this.latLng;
};

/**
 * @return {Object}
 */
SearchEvent.prototype.getCallback = function() {
	return this.callback;
};

SearchEvent.prototype.getType = function() {
	return SearchEvent.TYPE;
};

// /FUNCTIONS
