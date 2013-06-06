function AapentHandler(controller) {
	this.controller = controller;
	/** All Aapent Places and Google Places retrieved */
	this.placesList = new ListAdapter();
	/** Current search results (ids) */
	this.searchResultsList = new ListAdapter();
	/** Places to be displayed on map (ids) */
	this.mapPlacesList = new ListAdapter();
	/** Google Places details */
	this.placesDetailsList = new ListAdapter();
	this.groupPlacesList = new ListAdapter();

	this.map = null;
	this.services = null;
	this.geolocationWatchProcess = null;
	this.geolocationCounter = 0;
	this.markerLocation = null;
	this.markerPlace = null;
	this.location = {
		marker : null,
		circle : null
	}
	/** User position */
	this.position = null;
	this.latLngOrigin = [ 61.308167, 8.833008 ];
	this.latLngBound = [ [ 63.802803, 9.964600 ], [ 63.851262, 12.205811 ], [ 58.586509, 11.898193 ], [ 58.540670, 5.460205 ] ];
	/** Last search time */
	this.searchTime = null;
	/** Last search positions */
	this.searchPositions = [];
	this.features = {};
};

// CONSTANTS

AapentHandler.URI_AAPENT = "api_rest.php?/aapent/&mode=%s";
AapentHandler.URI_AAPENT_PLACES = "api_rest.php?/aapent/places/%s/%s&%s&mode=%s";
AapentHandler.URI_AAPENT_PLACES_SEARCH = "api_rest.php?/aapent/places/%s/%s/%s&%s&mode=%s";

AapentHandler.SEARCH_TIMEOUT = 500;
AapentHandler.SEARCH_RADIUS = 1000; // Meters
AapentHandler.SEARCH_RADIUS_NOPOS = 1000; // Meters, position not set

AapentHandler.MAP_CANVAS = "map_canvas";
AapentHandler.MAP_ZOOM = 4;
AapentHandler.MAP_USER_ZOOM = 17;

// /CONSTANTS

// FUNCTIONS

// ... GET

/**
 * @returns {BudgetMainController}
 */
AapentHandler.prototype.getController = function() {
	return this.controller;
};

/**
 * @return {Object} Lat, Long, Zoom
 */
AapentHandler.prototype.getMapSettings = function() {
	return JSON.parse(this.getController().getLocalStorageVariable("map_settings")) || {};
};

/**
 * @returns {Object} Place, converted from Google Place or Aapent Place, null of
 *          not exist
 */
AapentHandler.prototype.getPlace = function(placeId) {
	return this.placesList.getItem(placeId);
	// var placeObject = this.placesList.getItem(placeId);
	// if (!placeObject)
	// return null;
	//
	// var place = null;
	//
	// // Google Place
	// if (placeObject.reference) {
	// var placeGoogleDetail = this.placesDetailsList.getItem(placeObject.id);
	// place = PlaceUtil.createPlaceFromGoogle(placeObject, placeGoogleDetail);
	// }
	// // Aapent Place
	// else {
	// var group = this.groupPlacesList.getItem(placeObject.group);
	// place = PlaceUtil.createPlaceFromAapent(placeObject, group);
	// }
	//
	// return place || null;
};

AapentHandler.prototype.getGroupPlace = function(groupId) {
	return this.groupPlacesList.getItem(groupId) || null;
};

// ... /GET

// ... SET

AapentHandler.prototype.setMapSettings = function(settings) {
	this.getController().setLocalStorageVariable("map_settings", JSON.stringify(settings));
};

// ... /SET

// ... SET

AapentHandler.prototype.isPlace = function(placeId) {
	return this.placesList.getItem(placeId) != null;
};

// ... SET

// ... HANDLE

AapentHandler.prototype.handleRetrievedAapent = function(data) {
	var groups = data.groups;

	this.groupPlacesList.addAll(groups);
	this.features = data.features || {};
};

AapentHandler.prototype.handleRetrievedAapentPlaces = function(data) {
	var places = data.places;

	var placesObjects = {}, place = null;
	for ( var i in places) {
		place = places[i];
		placesObjects[i] = PlaceUtil.createPlaceFromAapent(place, this.getGroupPlace(place.group));
	}

	this.placesList.addAll(placesObjects);

	// Place ids
	var placeIds = {};
	for ( var i in places) {
		placeIds[places[i].id] = {
			id : places[i].id
		};
	}
	this.mapPlacesList.addAll(placeIds);
};

AapentHandler.prototype.handleRetrievedPlaceDetail = function(placeDetail) {
	if (!placeDetail)
		return console.error("AapentHandler.handleRetrievedPlaceDetail: Place detail not given", placeDetail);

	var place = this.getPlace(placeDetail.id);

	if (place) {
		place = PlaceUtil.createPlaceFromGoogle(place.google.place, placeDetail);
	} else {
		place = PlaceUtil.createPlaceFromGoogle(placeDetail);
	}

	this.placesList.add(place.id, place);
	this.placesDetailsList.add(place.id, placeDetail);
};

// ... /HANDLE

// ... DO

AapentHandler.prototype.doRetrieveAapent = function(callback) {
	var url = Core.sprintf(AapentHandler.URI_AAPENT, this.getController().getMode());

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

AapentHandler.prototype.doRetrieveAapentPlaces = function(lanLng, callback, settings) {
	settings = settings || {};
	var settingsUrl = [];
	for ( var i in settings)
		settingsUrl.push(i + "=" + encodeURIComponent(settings[i]));
	
	var url = Core.sprintf(AapentHandler.URI_AAPENT_PLACES, lanLng.lat(), lanLng.lng(), settingsUrl.join("&"), this.getController().getMode());

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
				console.error("AapentHandler.doRetrieveAapentPlaces", jqXHR, textStatus, errorThrown);
		}
	});
};

AapentHandler.prototype.doRetrieveAapentPlacesSearch = function(search, lanLng, callback, settings) {
	settings = settings || {};
	var settingsUrl = [];
	for ( var i in settings)
		settingsUrl.push(i + "=" + encodeURIComponent(settings[i]));

	var url = Core.sprintf(AapentHandler.URI_AAPENT_PLACES_SEARCH, lanLng.lat(), lanLng.lng(), encodeURIComponent(search), settingsUrl.join("&"), this.getController().getMode());

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
				console.error("AapentHandler.doRetrieveAapentPlacesSearch", jqXHR, textStatus, errorThrown);
		}
	});
};

AapentHandler.prototype.doRetrievePlaceDetails = function(placeId) {
	var context = this;
	var place = this.getPlace(placeId);
	if (!place)
		return console.error("AapentHandler.doRetrievePlaceDetails: Place dosen't exist (%s)", placeId);

	// Google Place Details
	if (place.google.reference) {
		// Request detail
		var callback = function(placeDetail, status) {
			if (status == google.maps.places.PlacesServiceStatus.OK) {
				// context.doPlaceShow(PlaceUtil.createPlaceFromGoogle(googlePlace));
				// console.log("Place details", googlePlace.id, googlePlace);
				// context.placesDetailsList.add(googlePlace.id, googlePlace);
				context.handleRetrievedPlaceDetail(placeDetail);
			} else
				return console.error("AapentHandler.doRetrievePlaceDetails: Get detail error", status);
		}
		var request = {
			reference : place.google.reference
		};

		this.services.places.getDetails(request, callback);
	}
};

// ... ... MAP

AapentHandler.prototype.doMapInit = function() {
	var context = this;

	// Initialize map
	if (!this.map) {

		// MAP

		var mapSettings = this.getMapSettings();
		var latlng = new google.maps.LatLng(this.latLngOrigin[0], this.latLngOrigin[1]);
		if (mapSettings.lat && mapSettings.long)
			latlng = new google.maps.LatLng(mapSettings.lat, mapSettings.long);

		var mapOptions = {
			zoom : mapSettings.zoom || AapentHandler.MAP_ZOOM,
			center : latlng,
			mapTypeId : google.maps.MapTypeId.ROADMAP,
			zoomControl : true,
			zoomControlOptions : {
				position : google.maps.ControlPosition.RIGHT_BOTTOM
			},
			streetViewControl : false,
			mapTypeControl : false,
			panControl : false
		};
		google.maps.visualRefresh = true;
		this.map = new google.maps.Map(document.getElementById(AapentHandler.MAP_CANVAS), mapOptions);

		// Fit to bounds if no map settings
		var latLngBounds = new google.maps.LatLngBounds();
		latLngBounds.extend(new google.maps.LatLng(this.latLngBound[0][0], this.latLngBound[0][1]));
		latLngBounds.extend(new google.maps.LatLng(this.latLngBound[1][0], this.latLngBound[1][1]));
		latLngBounds.extend(new google.maps.LatLng(this.latLngBound[2][0], this.latLngBound[2][1]));
		latLngBounds.extend(new google.maps.LatLng(this.latLngBound[3][0], this.latLngBound[3][1]));
		if (!mapSettings.lat && !mapSettings.long) {
			this.map.fitBounds(latLngBounds);
		}

// google.maps.event.addListener(this.map, 'bounds_changed', function() {
// context.handleMapChanged();
// });
		google.maps.event.addListener(this.map, 'idle', function() {
			context.handleMapChanged();
		});

		// MAP

// this.location.marker = new PinImageMarker({
// position : latlng,
// title : "Current location",
// map : this.map,
// visible : false,
// image :
// "http://maps.gstatic.com/mapfiles/place_api/icons/generic_business-71.png",
// imageScale : 0.5
// });
		
 // Position marker
 // var image = "image/icon/location_blue_15x15.png";
 // var image = "image/icon/markers/pin_meny.png";
 var symbol = {
 path : "m0 50.0l0 0c0 -27.614237 22.385763 -50.0 50.0 -50.0l0 0c13.260826 0 25.978523 5.267842 35.35534 14.644661c9.376816 9.37682 14.644661 22.094513 14.644661 35.35534l0 0c0 27.614235 -22.385765 50.0 -50.0 50.0l0 0c-27.614237 0 -50.0 -22.385765 -50.0 -50.0z",
 fillColor : "#6d9eeb",
 fillOpacity : 0.8,
 scale : 0.2,
 strokeColor : "#6d9eeb",
 strokeWeight : 2
 };
// var symbol = {
// path : "m77.543304 13.627296l0 0c15.333511 15.550947 15.43222 40.651203
// 0.22047424 56.062996q-13.771652 13.952751 -27.543304 27.90551q-13.881893
// -14.078743 -27.76378 -28.157478l0 0c-15.333513 -15.550949 -15.432221
// -40.651207 -0.22047234 -56.062996l0 0c15.211746 -15.411789 39.973576
// -15.298979 55.307083 0.25196838z",
// fillColor : "#dce3e6",
// fillOpacity : 0.8,
// scale : 0.45,
// strokeColor : "#e06666", /* "#93c47d",/* "#666666", */
// strokeWeight : 2,
// strokeOpacity : 0.8,
// anchor : new google.maps.Point(50, 100)
// };
 this.location.marker = new google.maps.Marker({
 title : "Current location",
 map : this.map,
 position : latlng,
 icon : symbol,
 // icon : image,
 // icon : new google.maps.MarkerImage(image, null, null, null, new
 // google.maps.Size(40, 40)),
 draggable : false,
 visible : false,
 text : "Test",
 zIndex : 5,
 optimized : false
 });
// var image = {
// url : 'image/logo/logo_meny.png',
// size : new google.maps.Size(70, 70),
// anchor : new google.maps.Point(20, 45),
// scaledSize : new google.maps.Size(38, 38)
// };
		this.location.circle = new google.maps.Marker({
			map : this.map,
			visible : false,
			position : latlng,
			zIndex : 0,
			optimized : false
		});

		// this.markerLocation = new google.maps.Marker({
		// position: latlng,
		// icon: {
		// path: google.maps.SymbolPath.CIRCLE,
		// scale: 10
		// },
		// map: this.map,
		// visible : false
		// });

		// Place marker
		this.markerPlace = new google.maps.Marker({
			map : this.map,
			position : latlng,
			draggable : false,
			visible : false,
			animation : google.maps.Animation.DROP
		});

		this.getController().getEventHandler().handle(new MaploadedEvent());

	}

	// Initialize services
	if (this.services == null) {
		this.services = {
			places : new google.maps.places.PlacesService(this.map)
		};
	}
};

AapentHandler.prototype.doMapLoaded = function() {
	this.doGeolocationInit();
};

AapentHandler.prototype.doMapPlace = function(placeId) {
	var context = this;
	var place = this.getPlace(placeId);
	if (!place)
		return console.error("AapentHandler.doMapPlace: Place dosen't exist (%s)", placeId);

	var latLng = new google.maps.LatLng(place.location.lat, place.location.lng);

	// Only place marker if Place dosen't already have a marker
	if (!this.mapPlacesList.getItem(place.id)) {
		this.markerPlace.setPosition(latLng);
		this.markerPlace.setVisible(true);
		this.markerPlace.setTitle(place.name);
		this.markerPlace.placeId = placeId;
	} else {
		this.markerPlace.setVisible(false);
		this.markerPlace.placeId = null;
	}

// this.getController().getEventHandler().handle(new PositionEvent(latLng));
	
	google.maps.event.addListener(this.markerPlace, 'click', function() {
		if (this.placeId)
			context.getController().getEventHandler().handle(new PlaceEvent(this.placeId));
	});
	
	this.doMapViewport(latLng);
};

/**
 * @param latLng
 * @param {number|boolean}
 *            zoom
 */
AapentHandler.prototype.doMapViewport = function(latLng, zoom) {
	zoom = zoom ? (typeof zoom == "number" ? zoom : AapentHandler.MAP_USER_ZOOM) : false;
	if (!this.map)
		return console.error("AapentHandler.doMapViewport: Map not initliazed", latLng);
	
	if (zoom)
		this.map.setZoom(zoom);
	this.map.panTo(latLng);
};

// ... ... /MAP

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

AapentHandler.prototype.doSearch = function(searchString) {
	if (!searchString) {
		return this.doSearchReset();
	}

	var context = this;
	var time = new Date().getTime();

	// GOOGLE TEXT

	var callback = function(results, status) {
		if (status != google.maps.places.PlacesServiceStatus.OK) {
			context.handleSearch(null, "google_text", time);
			return console.warn("AapentHandler.doSearchSuggestion: Google text", status);
		}
		context.handleSearch(results, "google_text", time);
	};
	var request = {
		query : searchString,
		location : this.map.getCenter(),
		radius : AapentHandler.SEARCH_RADIUS
	};
	this.services.places.textSearch(request, callback);

	// /GOOGLE TEXT

	// AAPENT SEARCH

	var callback = {
		success : function(result) {
			// context.handleSearchSuggestions(result, searchString,
			// "aapent_places", time);
			context.handleSearch(result, "aapent", time);
		},
		error : function(error) {
			console.error("AapentHandler.doSearch: Aapent search", error);
		}
	}
	this.doRetrieveAapentPlacesSearch(searchString, this.map.getCenter(), callback, {
		'radius' : AapentHandler.SEARCH_RADIUS
	});

	// /AAPENT SEARCH
};

AapentHandler.prototype.doSearchReset = function() {
	this.searchResultsList.clear();
};

// ... ... /SEARCH


AapentHandler.prototype.doPlaceDirections = function(placeId) {
	var place = this.getPlace(placeId);
	if (!place)
		return console.error("AapentHandler.doPlaceDirections: Place dosen't exist (%d)", placeId);

	var to = [ place.location.lat, place.location.lng ];
	var url = Core.sprintf("http://maps.google.com/maps?q=%s", to.join(","));
	if (this.position) {
		var from = [ this.position.lat(), this.position.lng() ];
		url = Core.sprintf("http://maps.google.com/maps?saddr=%s&daddr=%s", from.join(","), to.join(","));
	}
	window.open(url, '_blank');
};

/**
 * @param latLng
 *            Null if to use map center
 */
AapentHandler.prototype.doPlacesNearby = function(latLng) {
	var context = this;
	latLng = latLng || this.map.getCenter();
	
	console.log("AapentHandler.doPlacesNearby", latLng);
	
	// AAPENT PLACES

	this.doRetrieveAapentPlaces(latLng, null, {
		radius : AapentHandler.SEARCH_RADIUS
	});

	// /AAPENT PLACES

	// GOOGLE NEARBY

	var callback = function(placesNearby, status) {
		if (status != google.maps.places.PlacesServiceStatus.OK) {
			return console.warn("AapentHandler.doPlacesNearby: Google nearby", status);
		}
		context.handlePlaces(placesNearby);
	};
	var request = {
		location : latLng,
		types : [ "grocery_or_supermarket", "liquor_store" ],
		radius : AapentHandler.SEARCH_RADIUS
	};
	this.services.places.nearbySearch(request, callback);

	// /GOOGLE NEARBY
	
};

AapentHandler.prototype.doPositionsAdd = function(latLng) {
	
	var isPositionSearch = false;
	if (this.searchPositions.length > 0)
	{
		var distanceClosest = null;
		for(var i in this.searchPositions)
		{
			var distance = google.maps.geometry.spherical.computeDistanceBetween(this.searchPositions[i], this.map.getCenter());
			if (distanceClosest === null || distance < distanceClosest)
				distanceClosest = distance;
		}		
		isPositionSearch = distanceClosest > AapentHandler.SEARCH_RADIUS / 2;
		
		if (isPositionSearch)
			console.log("AapentHandler.doPositionsAdd: Distance %d", distanceClosest, this.searchPositions.length, latLng);
	}
	else
		isPositionSearch = true;
	
	if (isPositionSearch) {
		this.searchPositions.push(latLng);
		this.doPlacesNearby(latLng);
	}
};


// ... /DO

// ... HANDLE

// ... ... MAP

AapentHandler.prototype.handleMapChanged = function() {
	var center = this.map.getCenter();

	this.doPositionsAdd(center);
	
	this.setMapSettings({
		lat : center.lat(),
		long : center.lng(),
		zoom : this.map.getZoom()
	});
};

// ... ... /MAP

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
	if (!this.map) 
		console.error("AapentHandler.handleGeolocationPosition: Map not initlized");
	
	var latlng = new google.maps.LatLng(geolocationPosition.coords.latitude.toFixed(5), geolocationPosition.coords.longitude.toFixed(5));
	this.position = latlng;

	this.location.marker.setVisible(true);
	this.location.marker.setPosition(latlng);

	// if (position.coords.accuracy && !isNaN(position.coords.accuracy)) {
// this.location.circle.setVisible(true);
// this.location.circle.setPosition(latlng);
	// this.location.circle.setRadius(position.coords.accuracy);
	// } else
	// this.location.circle.setVisible(false);

	if (this.geolocationCounter++ == 0)
		this.doMapViewport(latLng, true);
// this.searchPositions.push(latLng);
	
	this.doPositionsAdd(latLng);
	
		// this.getController().getEventHandler().handle(new
		// PositionEvent(latlng));
};

// ... ... /GEOLOCATION

// ... ... SEARCH

AapentHandler.prototype.handleSearch = function(placeResults, type, time) {
	var placeResultsObject = {};

	// Google Places
	if (type == "google_text") {
		for ( var i in placeResults) {
			var place = PlaceUtil.createPlaceFromGoogle(placeResults[i], this.placesDetailsList.getItem(placeResults[i].id));
			placeResultsObject[place.id] = place;
		}
	}
	// Aapent Places
	else {
		for ( var i in placeResults) {
			var place = PlaceUtil.createPlaceFromAapent(placeResults[i], this.getGroupPlace(placeResults[i].group));
			placeResultsObject[place.id] = place;
		}
	}

	// Add to Places list
	this.placesList.addAll(placeResultsObject);

	// Clear old search results
	if (this.searchTime !== null && this.searchTime < time)
		this.searchResultsList.clear();

	// No results or old results
	if (placeResultsObject == null || Core.countObject(placeResultsObject) == 0 || time < this.searchTime)
		return;

	// Place results ids
	var placeResultsIds = {};
	for ( var i in placeResultsObject) {
		placeResultsIds[placeResultsObject[i].id] = {
			id : placeResultsObject[i].id
		};
	}

	// Add to search results
	this.searchResultsList.addAll(placeResultsIds);

	this.searchTime = time;
};

// ... ... /SEARCH

AapentHandler.prototype.handlePlaces = function(places) {
	var placesObjects = {};
	var placesIds = {};
	for ( var i in places) {
		placesObjects[places[i].id] = PlaceUtil.createPlaceFromGoogle(places[i], this.placesDetailsList.getItem(places[i].id));
		placesIds[places[i].id] = {
			id : places[i].id
		};
	}

	this.placesList.addAll(placesObjects);
	this.mapPlacesList.addAll(placesIds);
};

// ... HANDLE

// CLASS

function PinImageMarker(options) {
	this.options = options || {};
	this.options.imageScale = this.options.imageScale || 1;
	
	// Pin symbol
	var symbol = {
		path : "m77.543304 13.627296l0 0c15.333511 15.550947 15.43222 40.651203 0.22047424 56.062996q-13.771652 13.952751 -27.543304 27.90551q-13.881893 -14.078743 -27.76378 -28.157478l0 0c-15.333513 -15.550949 -15.432221 -40.651207 -0.22047234 -56.062996l0 0c15.211746 -15.411789 39.973576 -15.298979 55.307083 0.25196838z",
		fillColor : "#dce3e6",
		fillOpacity : 1,
		scale : 0.45,
		strokeColor : this.options.strokeColor || "#AAAAAA", // "#e06666", /*
																// "#93c47d",/*
																// "#666666", */
		strokeWeight : 2,
		strokeOpacity : 0.8,
		anchor : new google.maps.Point(50, 100)
	};
	this.symbol = new google.maps.Marker({
		title : this.options.title,
		map : this.options.map,
		position : this.options.position,
		icon : symbol,
		visible : this.options.visible,
		zIndex : this.options.zIndex + 5,
		optimized : false,
		pinImage : this
	});
	
	// Pin image
	var image = {
		url : this.options.image, /* 'image/logo/logo_meny.png', */
		size : new google.maps.Size(70, 70),
		anchor : new google.maps.Point(16 - ((1 - this.options.imageScale) * 14),42 - ((1 - this.options.imageScale) * 14)), 
		// 9,35 - 16,42 - 20, 45), 10, 38 // (20 * this.options.imageScale,45 -
		// ((1 - this.options.imageScale) * 14))
		scaledSize : new google.maps.Size(45 * this.options.imageScale, 45 * this.options.imageScale, "%", "%") 
	// 38, 38,
	};
	this.image = new google.maps.Marker({
		title : this.options.title,
		map : this.options.map,
		position : this.options.position,
		icon : image,
		visible : this.options.visible,
		zIndex : this.options.zIndex + 10,
		optimized : false,
		pinImage : this,
		clickable : false
	});
}

PinImageMarker.prototype.setPosition = function(position) {
	this.options.position = position;
	this.symbol.setPosition(position);
	this.image.setPosition(position);
};

PinImageMarker.prototype.setVisible= function(visible) {
	this.options.visible = visible;
	this.symbol.setVisible(visible);
	this.image.setVisible(visible);
};

PinImageMarker.prototype.addListener= function(callback) {
	google.maps.event.addListener(this.symbol, 'click', function() {
		callback(this.pinImage);
	});
// google.maps.event.addListener(this.image, 'click', function() {
// callback(this.pinImage);
// });
};

// /CLASS
