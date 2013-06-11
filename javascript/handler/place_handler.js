/**
 * @param {AapentHandler}
 *            controller
 * @returns PlaceHandler
 */
function PlaceHandler(aapentHandler) {
	this.aapentHandler = aapentHandler;

	/** All Aapent Places and Google Places retrieved */
	this.placesList = new ListAdapter();
	this.placesGoogle = {};
	this.placesAapent = {};
	/** Current search results (ids) */
	this.searchResultsList = new ListAdapter();
	/** Google Places details */
	this.placesDetailsList = new ListAdapter();

	/** Last search time */
	this.searchTime = null;
	this.searchTimeout = null;
};

// CONSTANTS

PlaceHandler.URI_AAPENT_PLACES = "api_rest.php?/aapent/places/%s/%s&%s&mode=%s";
PlaceHandler.URI_AAPENT_PLACES_SEARCH = "api_rest.php?/aapent/places/%s/%s/%s&%s&mode=%s";

PlaceHandler.SEARCH_TIMEOUT = 500;
PlaceHandler.SEARCH_RADIUS = 1000; // Meters
PlaceHandler.SEARCH_NEARBY_TYPES = [ "grocery_or_supermarket", "liquor_store" ];

PlaceHandler.REGEX_PLACE_MATCH = /[^\w\d\s]+/gi;

// /CONSTANTS

// FUNCTIONS

// ... GET

/**
 * @returns {EventHandler}
 */
PlaceHandler.prototype.getEventHandler = function() {
	return this.aapentHandler.getEventHandler();
};

/**
 * @returns {Place}
 */
PlaceHandler.prototype.getPlace = function(placeId) {
	var place = this.placesList.getItem(placeId);
	if (!place)
		return null;
	if (place.isGoogle && place.aapent.id)
		return this.placesList.getItem(place.aapent.id);
	return place;
};

PlaceHandler.prototype.getDuplicatePlace = function(place) {
	var places = {};
	if (place.isGoogle)
		places = this.placesAapent;
	else
		places = this.placesGoogle;

	var placeTemp = null, title = null, titleTemp = null;
	for ( var i in places) {
		placeTemp = this.getPlace(places[i]);
		if (placeTemp && place.group == placeTemp.group) {
			title = place.name.replace(PlaceHandler.REGEX_PLACE_MATCH, "").replace(/\s+/, " ").trim();
			titleTemp = placeTemp.name.replace(PlaceHandler.REGEX_PLACE_MATCH, "").replace(/\s+/, " ").trim();
			// console.log("GetDuplicatePlace", place.id, title, titleTemp,
			// title ==
			// titleTemp);
			if (title == titleTemp) {
				return placeTemp.id;
			}
		}
	}

	return null;
};

// ... /GET

// ... IS

PlaceHandler.prototype.isPlace = function(placeId) {
	return this.placesList.getItem(placeId) != null;
};

// ... IS

// ... CREATE

/**
 * @returns {Place}
 */
PlaceHandler.prototype.createPlace = function(place) {
	return new Place(place, this.placesList, this.aapentHandler.groupPlacesList, this.placesDetailsList);
};

// ... /CREATE

// ... HANDLE

PlaceHandler.prototype.handleRetrievedAapentPlaces = function(data) {
	var places = data.places;

	var placesObjects = {}, place = null, placeIds = {};
	for ( var i in places) {
		if (this.isPlace(places[i].id))
			continue;

		place = this.createPlace(places[i]); //this.createPlace(places[i]);
		placesObjects[place.id] = place // PlaceUtil.createPlaceFromAapent(place,
		// this.aapentHandler.getGroupPlace(place.group));
		this.placesAapent[place.id] = place.id;

		var placeDuplicate = this.getDuplicatePlace(place);
		if (placeDuplicate) {
//			console.log("Duplicate", place.id, placeDuplicate, place.name);
			place.mergePlace(this.placesList.getItem(placeDuplicate));
			this.aapentHandler.mapHandler.mapPlacesList.remove(placeDuplicate);
		} else {
			placeIds[place.id] = {
				id : place.id
			};
		}
	}

	this.placesList.addAll(placesObjects);
	this.aapentHandler.mapHandler.mapPlacesList.addAll(placeIds);
};

PlaceHandler.prototype.handleRetrievedPlaceDetail = function(placeId, placeDetail) {
	var place = this.getPlace(placeId);
	if (!place)
		return console.error("PlaceHandler.handleRetrievedPlaceDetail: Place not given", placeId, placeDetail);
	if (!placeDetail)
		return console.error("PlaceHandler.handleRetrievedPlaceDetail: Place detail not given (%d)", placeId, placeDetail);

	place.mergePlaceDetail(placeDetail);
	this.placesDetailsList.add(place.google.id, placeDetail);
	
	// if (place) {
	// place = this.createPlace(place.google.place); // ;
	// // PlaceUtil.createPlaceFromGoogle(place.google.place,
	// // placeDetail);
	// } else {
	// place = this.createPlace(placeDetail); //
	// PlaceUtil.createPlaceFromGoogle(placeDetail);
	// }

	this.placesList.add(place.id, place);
};

// ... /HANDLE

// ... DO

PlaceHandler.prototype.doInit = function() {
	var context = this;

	// BIND

	this.getEventHandler().registerListener(SearchEvent.TYPE,
	/**
	 * @param {SearchEvent}
	 *            event
	 */
	function(event) {
		if (event.getSearch() == null)
			context.doSearchReset();
		else {
			if (context.searchTimeout) {
				clearTimeout(context.searchTimeout);
			}
			var search = event.getSearch();
			context.searchTimeout = setTimeout(function() {
				context.doSearch(search);
			}, PlaceHandler.SEARCH_TIMEOUT);
		}
	});

	this.getEventHandler().registerListener(PlaceEvent.TYPE,
	/**
	 * @param {PlaceEvent}
	 *            event
	 */
	function(event) {
		context.doRetrieveDetails(event.getPlaceId());
	});

	// /BIND
};

PlaceHandler.prototype.doRetrieveAapentPlaces = function(lanLng, callback, settings) {
	settings = settings || {};
	var settingsUrl = [];
	for ( var i in settings)
		settingsUrl.push(i + "=" + encodeURIComponent(settings[i]));

	var url = Core.sprintf(PlaceHandler.URI_AAPENT_PLACES, lanLng.lat(), lanLng.lng(), settingsUrl.join("&"), this.aapentHandler.controller.getMode());

	$.ajax({
		type : "GET",
		url : url,
		dataType : "json",
		context : this,
		success : function(data) {
			this.handleRetrievedAapentPlaces(data);
			if (callback && callback.success)
				callback.success(data.places);
		},
		error : function(jqXHR, textStatus, errorThrown) {
			if (callback && callback.error)
				callback.error(textStatus, errorThrown);
			else
				console.error("PlaceHandler.doRetrieveAapentPlaces", jqXHR, textStatus, errorThrown);
		}
	});
};

PlaceHandler.prototype.doRetrieveAapentPlacesSearch = function(search, lanLng, callback, settings) {
	settings = settings || {};
	var settingsUrl = [];
	for ( var i in settings)
		settingsUrl.push(i + "=" + encodeURIComponent(settings[i]));

	var url = Core.sprintf(PlaceHandler.URI_AAPENT_PLACES_SEARCH, lanLng.lat(), lanLng.lng(), encodeURIComponent(search), settingsUrl.join("&"), this.aapentHandler.controller
			.getMode());

	$.ajax({
		type : "GET",
		url : url,
		dataType : "json",
		context : this,
		success : function(data) {
			this.handleRetrievedAapentPlaces(data);
			if (callback && callback.success)
				callback.success(data.places);
		},
		error : function(jqXHR, textStatus, errorThrown) {
			if (callback && callback.error)
				callback.error(textStatus, errorThrown);
			else
				console.error("PlaceHandler.doRetrieveAapentPlacesSearch", jqXHR, textStatus, errorThrown);
		}
	});
};

PlaceHandler.prototype.doRetrieveDetails = function(placeId) {
	var context = this;
	var place = this.getPlace(placeId);
	if (!place)
		return console.error("PlaceHandler.doRetrieveDetails: Place dosen't exist (%s)", placeId);
	if (this.placesDetailsList.getItem(place.google.id))
		return;

	// Google Place Details
	if (place.google.reference && place.isType(Place.TYPE_ESTABLISHMENT)) {
		// Request detail
		var callback = function(placeDetail, status) {
			if (status == google.maps.places.PlacesServiceStatus.OK) {
				// context.doPlaceShow(PlaceUtil.createPlaceFromGoogle(googlePlace));
				// console.log("Place details", googlePlace.id, googlePlace);
				// context.placesDetailsList.add(googlePlace.id, googlePlace);
				context.handleRetrievedPlaceDetail(placeId, placeDetail);
			} else
				return console.error("PlaceHandler.doRetrieveDetails: Get detail error", status);
		}
		var request = {
			reference : place.google.reference
		};

		this.aapentHandler.services.places.getDetails(request, callback);
	}
};

// ... ... SEARCH

PlaceHandler.prototype.doSearch = function(searchString) {
	if (!searchString) {
		return this.doSearchReset();
	}

	var context = this;
	var time = new Date().getTime();

	// GOOGLE TEXT

	var callback = function(results, status) {
		if (status != google.maps.places.PlacesServiceStatus.OK) {
			context.handleSearch(null, "google_text", time);
			return console.warn("PlaceHandler.doSearchSuggestion: Google text", status);
		}
		context.handleSearch(results, "google_text", time);
	};
	var request = {
		query : searchString,
		location : this.aapentHandler.mapHandler.map.getCenter(),
		radius : PlaceHandler.SEARCH_RADIUS
	};
	this.aapentHandler.services.places.textSearch(request, callback);

	// /GOOGLE TEXT

	// AAPENT SEARCH

	var callback = {
		success : function(result) {
			// context.handleSearchSuggestions(result, searchString,
			// "aapent_places", time);
			context.handleSearch(result, "aapent", time);
		},
		error : function(error) {
			console.error("PlaceHandler.doSearch: Aapent search", error);
		}
	}
	this.doRetrieveAapentPlacesSearch(searchString, this.aapentHandler.mapHandler.map.getCenter(), callback, {
		'radius' : PlaceHandler.SEARCH_RADIUS
	});

	// /AAPENT SEARCH
};

PlaceHandler.prototype.doSearchReset = function() {
	this.searchResultsList.clear();
};

// ... ... /SEARCH

/**
 * @param latLng
 *            Null if to use map center
 */
PlaceHandler.prototype.doNearby = function(latLng) {
	var context = this;
	latLng = latLng || this.aapentHandler.mapHandler.map.getCenter();

	// AAPENT PLACES

	this.doRetrieveAapentPlaces(latLng, null, {
		radius : PlaceHandler.SEARCH_RADIUS
	});

	// /AAPENT PLACES

	// GOOGLE NEARBY

	var callback = function(placesNearby, status) {
		if (status != google.maps.places.PlacesServiceStatus.OK) {
			return console.warn("PlaceHandler.doNearby: Google nearby", status);
		}
		context.handlePlacesGoogle(placesNearby);
	};
	var request = {
		location : latLng,
		types : PlaceHandler.SEARCH_NEARBY_TYPES,
		radius : PlaceHandler.SEARCH_RADIUS
	};
	this.aapentHandler.services.places.nearbySearch(request, callback);

	// /GOOGLE NEARBY
};

// ... /DO

// ... HANDLE

// ... ... SEARCH

PlaceHandler.prototype.handleSearch = function(placeResults, type, time) {
	var placeResultsObject = {};
	var placeResultsIds = {};

	var place = null;
	for ( var i in placeResults) {
		placeResultsIds[placeResults[i].id] = {
			id : placeResults[i].id
		};

		if (!this.isPlace(placeResults.id)) {
			place = this.createPlace(placeResults[i]); // this.createPlace(placeResults[i]); // PlaceUtil.createPlaceFromGoogle(placeResults[i],
			// this.placesDetailsList.getItem(placeResults[i].id));
			placeResultsObject[place.id] = place;

			if (place.isGoogle) {
				this.placesGoogle[place.id] = place.id;
			} else {
				this.placesAapent[place.id] = place.id;
			}

			var placeDuplicate = this.getDuplicatePlace(place);
			if (placeDuplicate) {
//				console.log("Handle search: Duplicate", place.id, placeDuplicate, place.name);
				if (place.isGoogle)
					this.getPlace(placeDuplicate).mergePlace(place);
				else
					place.mergePlace(this.placesList.getItem(placeDuplicate));
			}
		}
	}

	// Google Places
	// // Aapent Places
	// else {
	// for ( var i in placeResults) {
	// var place = this.createPlace(placeResults[i]); //
	// PlaceUtil.createPlaceFromAapent(placeResults[i],
	// // this.aapentHandler.getGroupPlace(placeResults[i].group));
	// placeResultsObject[place.id] = place;
	// placeResultsIds[place.id] = {
	// id : place.id
	// };
	// }
	//		
	// }

	// Add to Places list
	this.placesList.addAll(placeResultsObject);

	// Clear old search results
	if (this.searchTime !== null && this.searchTime < time)
		this.searchResultsList.clear();

	// No results or old results
	if (placeResultsObject == null || Core.countObject(placeResultsObject) == 0 || time < this.searchTime)
		return;

	// Add to search results
	this.searchResultsList.addAll(placeResultsIds);

	this.searchTime = time;
};

// ... ... /SEARCH

PlaceHandler.prototype.handlePlacesGoogle = function(places) {
	var placesObjects = {};
	var placesIds = {};
	for ( var i in places) {
		if (this.isPlace(places[i].id))
			continue;

		var place = this.createPlace(places[i]); // this.createPlace(places[i]); // PlaceUtil.createPlaceFromGoogle(places[i],
		// this.placesDetailsList.getItem(places[i].id));
		placesObjects[place.id] = place;

		this.placesGoogle[place.id] = place.id;

		var placeDuplicate = this.getDuplicatePlace(place);
		if (placeDuplicate) {
//			console.log("Handle places Google Duplicate", place.id, placeDuplicate, place.name);
			this.getPlace(placeDuplicate).mergePlace(place);
			this.aapentHandler.mapHandler.mapPlacesList.remove(place.id);
		} else {
			placesIds[place.id] = {
				id : place.id
			};
		}
	}

	this.placesList.addAll(placesObjects);
	this.aapentHandler.mapHandler.mapPlacesList.addAll(placesIds);
};

// ... HANDLE
