/**
 * @param {AapentAppMainController}
 *            controller
 * @returns AapentHandler
 */
function AapentHandler(controller) {
	this.controller = controller;
	this.mapHandler = new MapHandler(this);
	this.placeHandler = new PlaceHandler(this);
	
// /** All Aapent Places and Google Places retrieved */
// this.placesList = new ListAdapter();
// /** Current search results (ids) */
// this.searchResultsList = new ListAdapter();
// /** Google Places details */
// this.placesDetailsList = new ListAdapter();
 /** Group Places */
 this.groupPlacesList = new ListAdapter();

	/** Google services */
	this.services = null;
	this.geolocationWatchProcess = null;
	this.geolocationCounter = 0;
	/** User position */
	this.position = null;
	/** Last search positions */
	this.positions = [];
// /** Last search time */
// this.searchTime = null;
	/** Aapent features */
	this.features = {};
};

// CONSTANTS

AapentHandler.URI_AAPENT = "api_rest.php?/aapent/&mode=%s";
// AapentHandler.URI_AAPENT_PLACES =
// "api_rest.php?/aapent/places/%s/%s&%s&mode=%s";
// AapentHandler.URI_AAPENT_PLACES_SEARCH =
// "api_rest.php?/aapent/places/%s/%s/%s&%s&mode=%s";

// AapentHandler.SEARCH_TIMEOUT = 500;
// AapentHandler.SEARCH_RADIUS = 1000; // Meters
// AapentHandler.SEARCH_NEARBY_TYPES = [ "grocery_or_supermarket",
// "liquor_store" ];

// /CONSTANTS

// FUNCTIONS

// ... GET

/**
 * @returns {EventHandler}
 */
AapentHandler.prototype.getEventHandler = function() {
	return this.controller.getEventHandler();
};

/**
 * @return {Object}
 */
AapentHandler.prototype.getSettings = function() {
	return JSON.parse(this.controller.getLocalStorageVariable("settings")) || {};
};

/**
 * @returns {Object} Place, converted from Google Place or Aapent Place, null of
 *          not exist
 */
AapentHandler.prototype.getPlace = function(placeId) {
// return this.placesList.getItem(placeId);
	return this.placeHandler.getPlace(placeId);
};

AapentHandler.prototype.getGroupPlace = function(groupId) {
	return this.groupPlacesList.getItem(groupId) || null;
};

//
// AapentHandler.prototype.getGroupPlace = function(groupId) {
// return this.groupPlacesList.getItem(groupId) || null;
// };

// ... /GET

AapentHandler.prototype.isPlace = function(placeId) {
	return this.placeHandler.isPlace(placeId);
};

// ... SET

AapentHandler.prototype.setSettings = function(settings) {
	var settingsOld = this.getSettings();
	this.controller.setLocalStorageVariable("settings", JSON.stringify(jQuery.extend(true, {}, settingsOld, settings)));
};

// ... /SET

// ... IS

// AapentHandler.prototype.isPlace = function(placeId) {
// return this.placesList.getItem(placeId) != null;
// };

// ... IS

// ... HANDLE

AapentHandler.prototype.handleRetrievedAapent = function(data) {
	var groups = data.groups;

	this.groupPlacesList.addAll(groups);
	this.features = data.features || {};
};

// AapentHandler.prototype.handleRetrievedAapentPlaces = function(data) {
// var places = data.places;
//
// var placesObjects = {}, place = null, placeIds = {};
// for ( var i in places) {
// place = places[i];
// placesObjects[i] = PlaceUtil.createPlaceFromAapent(place,
// this.getGroupPlace(place.group));
// placeIds[place.id] = { id : place.id };
// }
//
// this.placesList.addAll(placesObjects);
// this.mapHandler.mapPlacesList.addAll(placeIds);
// };
//
// AapentHandler.prototype.handleRetrievedPlaceDetail = function(placeDetail) {
// if (!placeDetail)
// return console.error("AapentHandler.handleRetrievedPlaceDetail: Place detail
// not given", placeDetail);
//
// var place = this.getPlace(placeDetail.id);
//
// if (place) {
// place = PlaceUtil.createPlaceFromGoogle(place.google.place, placeDetail);
// } else {
// place = PlaceUtil.createPlaceFromGoogle(placeDetail);
// }
//
// this.placesList.add(place.id, place);
// this.placesDetailsList.add(place.id, placeDetail);
// };

// ... /HANDLE

// ... DO

AapentHandler.prototype.doInit = function() {
	var context = this;
	
	this.doRetrieveAapent(null);
	this.placeHandler.doInit();
	
	// BIND
	
	this.getEventHandler().registerListener(MapinitEvent.TYPE,
	/**
	 * @param {MapinitEvent}
	 *            event
	 */
	function(event) {
		context.mapHandler.doInit();
	});

	this.getEventHandler().registerListener(MaploadedEvent.TYPE,
	/**
	 * @param {MaploadedEvent}
	 *            event
	 */
	function(event) {
		context.doGeolocationInit();
	});
	
	// /BIND

};

AapentHandler.prototype.doRetrieveAapent = function(callback) {
	var url = Core.sprintf(AapentHandler.URI_AAPENT, this.controller.getMode());

	$.ajax({
		type : "GET",
		url : url,
		dataType : "json",
		context : this,
		success : function(data) {
			this.handleRetrievedAapent(data);
			if (callback && callback.success)
				callback.success(data.places);
		},
		error : function(jqXHR, textStatus, errorThrown) {
			if (callback && callback.error)
				callback.error(textStatus, errorThrown);
			else
				console.error("AapentHandler.doRetrieveAapent", jqXHR, textStatus, errorThrown);
		}
	});
};

// AapentHandler.prototype.doRetrieveAapentPlaces = function(lanLng, callback,
// settings) {
// settings = settings || {};
// var settingsUrl = [];
// for ( var i in settings)
// settingsUrl.push(i + "=" + encodeURIComponent(settings[i]));
//	
// var url = Core.sprintf(AapentHandler.URI_AAPENT_PLACES, lanLng.lat(),
// lanLng.lng(), settingsUrl.join("&"), this.controller.getMode());
//
// $.ajax({
// type : "GET",
// url : url,
// dataType : "json",
// context : this,
// success : function(data) {
// this.handleRetrievedAapentPlaces(data);
// if (callback && callback.success)
// callback.success(data.places);
// },
// error : function(jqXHR, textStatus, errorThrown) {
// if (callback && callback.error)
// callback.error(textStatus, errorThrown);
// else
// console.error("AapentHandler.doRetrieveAapentPlaces", jqXHR, textStatus,
// errorThrown);
// }
// });
// };
//
// AapentHandler.prototype.doRetrieveAapentPlacesSearch = function(search,
// lanLng, callback, settings) {
// settings = settings || {};
// var settingsUrl = [];
// for ( var i in settings)
// settingsUrl.push(i + "=" + encodeURIComponent(settings[i]));
//
// var url = Core.sprintf(AapentHandler.URI_AAPENT_PLACES_SEARCH, lanLng.lat(),
// lanLng.lng(), encodeURIComponent(search), settingsUrl.join("&"),
// this.controller.getMode());
//
// $.ajax({
// type : "GET",
// url : url,
// dataType : "json",
// context : this,
// success : function(data) {
// this.handleRetrievedAapentPlaces(data);
// if (callback && callback.success)
// callback.success(data.places);
// },
// error : function(jqXHR, textStatus, errorThrown) {
// if (callback && callback.error)
// callback.error(textStatus, errorThrown);
// else
// console.error("AapentHandler.doRetrieveAapentPlacesSearch", jqXHR,
// textStatus, errorThrown);
// }
// });
// };
//
// AapentHandler.prototype.doRetrievePlaceDetails = function(placeId) {
// var context = this;
// var place = this.getPlace(placeId);
// if (!place)
// return console.error("AapentHandler.doRetrievePlaceDetails: Place dosen't
// exist (%s)", placeId);
//
// // Google Place Details
// if (place.google.reference) {
// // Request detail
// var callback = function(placeDetail, status) {
// if (status == google.maps.places.PlacesServiceStatus.OK) {
// // context.doPlaceShow(PlaceUtil.createPlaceFromGoogle(googlePlace));
// // console.log("Place details", googlePlace.id, googlePlace);
// // context.placesDetailsList.add(googlePlace.id, googlePlace);
// context.handleRetrievedPlaceDetail(placeDetail);
// } else
// return console.error("AapentHandler.doRetrievePlaceDetails: Get detail
// error", status);
// }
// var request = {
// reference : place.google.reference
// };
//
// this.services.places.getDetails(request, callback);
// }
// };

// ... ... GEOLOCATION

AapentHandler.prototype.doGeolocationInit = function() {
	var context = this;

	if (navigator.geolocation) {
		if (this.geolocationWatchProcess == null) {
			this.geolocationWatchProcess = navigator.geolocation.watchPosition(function(position) {
				context.handleGeolocationPosition(position);
			}, function(error) {
				context.handleGeolocationError(error);
			});
		}
	} else
		this.handleGeolocationError(null);
};

AapentHandler.prototype.doGeolocationStop = function() {
	if (this.geolocationWatchProcess != null) {
		navigator.geolocation.clearWatch(this.geolocationWatchProcess);
		this.geolocationWatchProcess == null;
	}
};

// ... ... /GEOLOCATION

// ... ... SEARCH

// AapentHandler.prototype.doSearch = function(searchString) {
// if (!searchString) {
// return this.doSearchReset();
// }
//
// var context = this;
// var time = new Date().getTime();
//
// // GOOGLE TEXT
//
// var callback = function(results, status) {
// if (status != google.maps.places.PlacesServiceStatus.OK) {
// context.handleSearch(null, "google_text", time);
// return console.warn("AapentHandler.doSearchSuggestion: Google text", status);
// }
// context.handleSearch(results, "google_text", time);
// };
// var request = {
// query : searchString,
// location : this.mapHandler.map.getCenter(),
// radius : AapentHandler.SEARCH_RADIUS
// };
// this.services.places.textSearch(request, callback);
//
// // /GOOGLE TEXT
//
// // AAPENT SEARCH
//
// var callback = {
// success : function(result) {
// // context.handleSearchSuggestions(result, searchString,
// // "aapent_places", time);
// context.handleSearch(result, "aapent", time);
// },
// error : function(error) {
// console.error("AapentHandler.doSearch: Aapent search", error);
// }
// }
// this.doRetrieveAapentPlacesSearch(searchString,
// this.mapHandler.map.getCenter(), callback, {
// 'radius' : AapentHandler.SEARCH_RADIUS
// });
//
// // /AAPENT SEARCH
// };
//
// AapentHandler.prototype.doSearchReset = function() {
// this.searchResultsList.clear();
// };

// ... ... /SEARCH


AapentHandler.prototype.doDirections = function(placeId) {
	var place = this.getPlace(placeId);
	if (!place)
		return console.error("AapentHandler.doDirections: Place dosen't exist (%d)", placeId);

	var to = [ place.location.lat, place.location.lng ];
	var url = Core.sprintf("http://maps.google.com/maps?q=%s", to.join(","));
	if (this.position) {
		var from = [ this.position.lat(), this.position.lng() ];
		url = Core.sprintf("http://maps.google.com/maps?saddr=%s&daddr=%s", from.join(","), to.join(","));
	}
	window.open(url, '_blank');
};

// /**
// * @param latLng
// * Null if to use map center
// */
// AapentHandler.prototype.doPlacesNearby = function(latLng) {
// var context = this;
// latLng = latLng || this.mapHandler.map.getCenter();
//	
// // AAPENT PLACES
//
// this.doRetrieveAapentPlaces(latLng, null, {
// radius : AapentHandler.SEARCH_RADIUS
// });
//
// // /AAPENT PLACES
//
// // GOOGLE NEARBY
//
// var callback = function(placesNearby, status) {
// if (status != google.maps.places.PlacesServiceStatus.OK) {
// return console.warn("AapentHandler.doPlacesNearby: Google nearby", status);
// }
// context.handlePlacesGoogle(placesNearby);
// };
// var request = {
// location : latLng,
// types : AapentHandler.SEARCH_NEARBY_TYPES,
// radius : AapentHandler.SEARCH_RADIUS
// };
// // this.services.places.nearbySearch(request, callback);
//
// // /GOOGLE NEARBY
// };

AapentHandler.prototype.doPositionsAdd = function(latLng) {
	var isPositionSearch = false;
	if (this.positions.length > 0)
	{
		var distanceClosest = null;
		for(var i in this.positions)
		{
			var distance = google.maps.geometry.spherical.computeDistanceBetween(this.positions[i], this.mapHandler.map.getCenter());
			if (distanceClosest === null || distance < distanceClosest)
				distanceClosest = distance;
		}		
		isPositionSearch = distanceClosest > PlaceHandler.SEARCH_RADIUS;// / 2;
	}
	else
		isPositionSearch = true;
	
	if (isPositionSearch) {
		this.positions.push(latLng);
// this.doPlacesNearby(latLng);
		this.placeHandler.doNearby(latLng);
	}
};


// ... /DO

// ... HANDLE

// ... ... GEOLOCATION

AapentHandler.prototype.handleGeolocationError = function(error) {
	var errorMsg = null;
	if (error) {
		switch (error.code) {
		case error.PERMISSION_DENIED:
			errorMsg = "Did not share geolocation data";
			break;
		case error.POSITION_UNAVAILABLE:
			errorMsg = "Could not detect current position";
			break;
		case error.TIMEOUT:
			errorMsg = "Retrieving position timed out";
			break;
		default:
			errorMsg = "Unknown error";
			break;
		}
	} else
		errorMsg = "Geolocation Not supported";
	console.warn("AapentHandler.handleGeolocationError: %s", errorMsg, error);
};

AapentHandler.prototype.handleGeolocationPosition = function(geolocationPosition) {
	if (!geolocationPosition)
		console.error("AapentHandler.handleGeolocationPosition: Position not given", geolocationPosition);
	if (!this.mapHandler.map) 
		console.error("AapentHandler.handleGeolocationPosition: Map not initlized");
	
	var latLng = new google.maps.LatLng(geolocationPosition.coords.latitude.toFixed(5), geolocationPosition.coords.longitude.toFixed(5));
	this.position = latLng;

// this.location.marker.setVisible(true);
// this.location.marker.setPosition(latLng);
	this.mapHandler.doLocationSet(latLng);

	// if (position.coords.accuracy && !isNaN(position.coords.accuracy)) {
// this.location.circle.setVisible(true);
// this.location.circle.setPosition(latLng);
	// this.location.circle.setRadius(position.coords.accuracy);
	// } else
	// this.location.circle.setVisible(false);

	if (this.geolocationCounter++ == 0)
		this.mapHandler.doViewport(latLng, true);
// this.positions.push(latLng);
	
	this.doPositionsAdd(latLng);
	
		// this.controller.getEventHandler().handle(new
		// PositionEvent(latLng));
};

// ... ... /GEOLOCATION

// ... ... SEARCH

// AapentHandler.prototype.handleSearch = function(placeResults, type, time) {
// var placeResultsObject = {};
//
// // Google Places
// if (type == "google_text") {
// for ( var i in placeResults) {
// var place = PlaceUtil.createPlaceFromGoogle(placeResults[i],
// this.placesDetailsList.getItem(placeResults[i].id));
// placeResultsObject[place.id] = place;
// }
// }
// // Aapent Places
// else {
// for ( var i in placeResults) {
// var place = PlaceUtil.createPlaceFromAapent(placeResults[i],
// this.getGroupPlace(placeResults[i].group));
// placeResultsObject[place.id] = place;
// }
// }
//
// // Add to Places list
// this.placesList.addAll(placeResultsObject);
//
// // Clear old search results
// if (this.searchTime !== null && this.searchTime < time)
// this.searchResultsList.clear();
//
// // No results or old results
// if (placeResultsObject == null || Core.countObject(placeResultsObject) == 0
// || time < this.searchTime)
// return;
//
// // Place results ids
// var placeResultsIds = {};
// for ( var i in placeResultsObject) {
// placeResultsIds[placeResultsObject[i].id] = {
// id : placeResultsObject[i].id
// };
// }
//
// // Add to search results
// this.searchResultsList.addAll(placeResultsIds);
//
// this.searchTime = time;
// };

// ... ... /SEARCH

// AapentHandler.prototype.handlePlacesGoogle = function(places) {
// var placesObjects = {};
// var placesIds = {};
// for ( var i in places) {
// placesObjects[places[i].id] = PlaceUtil.createPlaceFromGoogle(places[i],
// this.placesDetailsList.getItem(places[i].id));
// placesIds[places[i].id] = {
// id : places[i].id
// };
// }
//
// this.placesList.addAll(placesObjects);
// this.mapHandler.mapPlacesList.addAll(placesIds);
// };

// ... HANDLE

// CLASS

// function PinImageMarker(options) {
// this.options = options || {};
// this.options.imageScale = this.options.imageScale || 1;
//	
// // Pin symbol
// var symbol = {
// path : "m77.543304 13.627296l0 0c15.333511 15.550947 15.43222 40.651203
// 0.22047424 56.062996q-13.771652 13.952751 -27.543304 27.90551q-13.881893
// -14.078743 -27.76378 -28.157478l0 0c-15.333513 -15.550949 -15.432221
// -40.651207 -0.22047234 -56.062996l0 0c15.211746 -15.411789 39.973576
// -15.298979 55.307083 0.25196838z",
// fillColor : "#dce3e6",
// fillOpacity : 1,
// scale : 0.45,
// strokeColor : this.options.strokeColor || "#AAAAAA", // "#e06666", /*
// // "#93c47d",/*
// // "#666666", */
// strokeWeight : 2,
// strokeOpacity : 0.8,
// anchor : new google.maps.Point(50, 100)
// };
// this.symbol = new google.maps.Marker({
// title : this.options.title,
// map : this.options.map,
// position : this.options.position,
// icon : symbol,
// visible : this.options.visible,
// zIndex : this.options.zIndex + 5,
// optimized : false,
// pinImage : this
// });
//	
// // Pin image
// var image = {
// url : this.options.image, /* 'image/logo/logo_meny.png', */
// size : new google.maps.Size(70, 70),
// anchor : new google.maps.Point(16 - ((1 - this.options.imageScale) * 14),42 -
// ((1 - this.options.imageScale) * 14)),
// // 9,35 - 16,42 - 20, 45), 10, 38 // (20 * this.options.imageScale,45 -
// // ((1 - this.options.imageScale) * 14))
// scaledSize : new google.maps.Size(45 * this.options.imageScale, 45 *
// this.options.imageScale, "%", "%")
// // 38, 38,
// };
// this.image = new google.maps.Marker({
// title : this.options.title,
// map : this.options.map,
// position : this.options.position,
// icon : image,
// visible : this.options.visible,
// zIndex : this.options.zIndex + 10,
// optimized : false,
// pinImage : this,
// clickable : false
// });
// }
//
// PinImageMarker.prototype.setPosition = function(position) {
// this.options.position = position;
// this.symbol.setPosition(position);
// this.image.setPosition(position);
// };
//
// PinImageMarker.prototype.setVisible= function(visible) {
// this.options.visible = visible;
// this.symbol.setVisible(visible);
// this.image.setVisible(visible);
// };
//
// PinImageMarker.prototype.addListener= function(callback) {
// google.maps.event.addListener(this.symbol, 'click', function() {
// callback(this.pinImage);
// });
// // google.maps.event.addListener(this.image, 'click', function() {
// // callback(this.pinImage);
// // });
// };

// /CLASS
