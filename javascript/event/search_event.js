SearchEvent.prototype = new Event();

/**
 * @param {Object} callback Object(success, fail)
 */
function SearchEvent(search, callback) {
	this.search = search;
	this.callback = callback || {};
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
SearchEvent.prototype.getCallback = function() {
	return this.callback;
};

SearchEvent.prototype.getType = function() {
	return SearchEvent.TYPE;
};

// /FUNCTIONS
