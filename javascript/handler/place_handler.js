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
 * @returns {Object} Place, converted from Google Place or Aapent Place, null of
 *          not exist
 */
PlaceHandler.prototype.getPlace = function(placeId) {
	return this.placesList.getItem(placeId);
};

PlaceHandler.prototype.getDuplicatePlace = function(place) {
	var places = {};
	if (place.isGoogle)
		places = this.placesAapent;
	else
		places = this.placesGoogle;
		
	var placeTemp = null, title = null, titleTemp = null;
	for(var i in places)
	{
		placeTemp = this.getPlace(places[i]);
		if (placeTemp && place.group == placeTemp.group)
		{
			title = place.name.replace(PlaceHandler.REGEX_PLACE_MATCH, "").replace(/\s+/, " ").trim();
			titleTemp = placeTemp.name.replace(PlaceHandler.REGEX_PLACE_MATCH, "").replace(/\s+/, " ").trim();
// console.log("GetDuplicatePlace", place.id, title, titleTemp, title ==
// titleTemp);
			if (title == titleTemp)
			{
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

// ... HANDLE

PlaceHandler.prototype.handleRetrievedAapentPlaces = function(data) {
	var places = data.places;

	var placesObjects = {}, place = null, placeIds = {};
	for ( var i in places) {		
		if (this.isPlace(places[i].id))
			continue;
		
		place = this.createPlace(places[i]);		
		placesObjects[place.id] = place // PlaceUtil.createPlaceFromAapent(place,
													// this.aapentHandler.getGroupPlace(place.group));
		this.placesAapent[place.id] = place.id;				
		
		var placeDuplicate = this.getDuplicatePlace(place);
		if (placeDuplicate)
		{
			console.log(place.id, placeDuplicate, place.name);
			this.mergePlaces(place, placeDuplicate);
			this.aapentHandler.mapHandler.mapPlacesList.remove(placeDuplicate);
		}
		else
		{
			placeIds[place.id] = {
					id : place.id
			};
		}
	}

	this.placesList.addAll(placesObjects);
	this.aapentHandler.mapHandler.mapPlacesList.addAll(placeIds);
};

PlaceHandler.prototype.handleRetrievedPlaceDetail = function(placeDetail) {
	if (!placeDetail)
		return console.error("PlaceHandler.handleRetrievedPlaceDetail: Place detail not given", placeDetail);
	var place = this.getPlace(placeDetail.id);
	this.placesDetailsList.add(place.id, placeDetail);

	if (place) {
		place = this.createPlace(place.google.place); // ;
											// PlaceUtil.createPlaceFromGoogle(place.google.place,
											// placeDetail);
	} else {
		place = this.createPlace(placeDetail); // PlaceUtil.createPlaceFromGoogle(placeDetail);
	}

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
		
		if (!this.isPlace(placeResults.id))
		{		
			place = this.createPlace(placeResults[i]); // PlaceUtil.createPlaceFromGoogle(placeResults[i],
															// this.placesDetailsList.getItem(placeResults[i].id));
			placeResultsObject[place.id] = place;
		
			if (type == "google_text") {
				this.placesGoogle[place.id] = place.id;			
			}
			else {
				this.placesAapent[place.id] = place.id;			
			}
		
			var placeDuplicate = this.getDuplicatePlace(place);
			if (placeDuplicate) {
				this.mergePlaces(place, placeDuplicate);			
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
		
		var place = this.createPlace(places[i]); // PlaceUtil.createPlaceFromGoogle(places[i],
																	// this.placesDetailsList.getItem(places[i].id));
		placesObjects[place.id] = place;
		
		this.getDuplicatePlace(place);
		this.placesGoogle[place.id] = place.id;
		
		var placeDuplicate = this.getDuplicatePlace(place);
		if (placeDuplicate)
		{
			this.mergePlaces(place, placeDuplicate);
			this.aapentHandler.mapHandler.mapPlacesList.remove(place.id);
		}
		else
		{
			placesIds[place.id] = {
				id : place.id
			};			
		}
	}

	this.placesList.addAll(placesObjects);
	this.aapentHandler.mapHandler.mapPlacesList.addAll(placesIds);
};

// ... HANDLE

// ... CREATE

PlaceHandler.prototype.createPlace = function(place)
{
	return place.reference ? this.createPlaceFromGoogle(place) : this.createPlaceFromAapent(place);
};

/**
 * @param {Object}
 *            googlePlace
 * @return {Object} Place object
 */
PlaceHandler.prototype.createPlaceFromGoogle = function(googlePlace) {	
	if (!googlePlace)
		return null;
	
	var googlePlaceDetail = this.placesDetailsList.getItem(googlePlace.id) || {};
	var place = jQuery.extend(true, {}, PlaceUtil.PLACE_DEFAULT);

	place.isGoogle = true;
	place.id = googlePlace.id;

	// Name
	place.name = googlePlace.name;

	// Location
	place.location.lat = googlePlace.geometry.location.lat();
	place.location.lng = googlePlace.geometry.location.lng();
	place.location.latLng = googlePlace.geometry.location;

	// Hours
	if (googlePlaceDetail.opening_hours && googlePlaceDetail.opening_hours.periods) {
		place.hours.regular = jQuery.extend(true, {}, PlaceUtil.DAYS_DEFAULT);
		for(var i in googlePlaceDetail.opening_hours.periods) {
			var day = PlaceUtil.DAYS_STR[googlePlaceDetail.opening_hours.periods[i].close.day];
			if (day) {
				var open = googlePlaceDetail.opening_hours.periods[i].open.time;
				var close = googlePlaceDetail.opening_hours.periods[i].close.time;
				place.hours.regular[day] = [  open.substr(0,2) + ":" + open.substr(2,2), close.substr(0,2) + ":" + close.substr(2,2)];
			}
		}		
	}	
	place.hours.isOpen = googlePlace.opening_hours && googlePlace.opening_hours.open_now != undefined ? googlePlace.opening_hours.open_now : PlaceUtil.isOpen(place);
	
	// Info
	 if (googlePlace.address_components) {
		 for ( var i in googlePlace.address_components) {
			 var component = googlePlace.address_components[i];
			 if (jQuery.inArray("street_number", component.types) > -1)
				 place.info.address = (place.info.address ? place.info.address + " " : "") + component.long_name;
			 if (jQuery.inArray("route", component.types) > -1)
				 place.info.address = component.long_name + (place.info.address ? " " + place.info.address : "");
			 if (jQuery.inArray("locality", component.types) > -1) 
				 place.info.city = component.long_name;
			 if (jQuery.inArray("postal_code", component.types) > -1)
				 place.info.zip = component.long_name;
			 if (jQuery.inArray("country", component.types) > -1)
				 place.info.country = component.long_name;
		 }
	 }

	place.info.addressFormatted = googlePlace.vicinity || googlePlace.formatted_address || googlePlaceDetail.vicinity || googlePlaceDetail.formatted_address || null;
	place.info.phone = googlePlace.formatted_phone_number ||  googlePlaceDetail.formatted_phone_number || googlePlace.international_phone_number || googlePlaceDetail.international_phone_number || null;
	if (place.info.address)
		place.info.address = googlePlace.vicinity || googlePlaceDetail.vicinity || place.info.addressFormatted || null;

	// Link
	place.info.link = googlePlace.website || googlePlaceDetail.website || null;

	// Images
	place.images.icon = googlePlace.icon || googlePlaceDetail.icon || null;
	place.images.pin = place.images.icon;

	// Google
	place.google.reference = googlePlace.reference || googlePlaceDetail.reference || null;
	place.google.plus = googlePlace.url || googlePlaceDetail.url || null;
	if (Core.countObject(googlePlaceDetail) > 0)
		place.google.detail = googlePlaceDetail;
	place.google.place = googlePlace;

	// Types
	place.types = googlePlace.types || [];
	
	// GROUP MATCH
	
	place.group = this.matchPlaceToGroup(place);
	var group = this.aapentHandler.getGroupPlace(place.group);
	if (place.group && group) {		
		// Images
		place.images.icon = group.info.icon || place.images.icon || null;
		place.images.pin = group.info.pin || place.images.pin || null;
	}
	
	// /GROUP MATCH

	return place;
};

/**
 * @param {Object}
 *            aapentPlace
 * @return {Object} Place object
 */
PlaceHandler.prototype.createPlaceFromAapent = function(aapentPlace) {
	if (!aapentPlace)
		return null;
	
	var group = this.aapentHandler.getGroupPlace(aapentPlace.group) || { info : {}};
	var googlePlaceDetail = {} ;// this.placesDetailsList.getItem(aapentPlace.google.reference)
								// || {};
	var place = jQuery.extend(true, {}, PlaceUtil.PLACE_DEFAULT);
	
	place.isAapent = true;
	place.id = aapentPlace.id;
	place.group = aapentPlace.group;

	// Name
	place.name = aapentPlace.name;

	// Location
	place.location.lat = aapentPlace.locationLat;
	place.location.lng = aapentPlace.locationLong;
	place.location.latLng = new google.maps.LatLng(place.location.lat, place.location.lng);
	
	// Hours
	if (aapentPlace.hours.regular)
		place.hours.regular = aapentPlace.hours.regular;
	place.hours.isOpen = PlaceUtil.isOpen(place);
	
	// Info
	place.info.address = aapentPlace.info.address;	
	place.info.link = aapentPlace.info.link || group.info.link || null;
	place.info.phone = aapentPlace.info.phone || group.info.phone|| null;
	place.info.email = aapentPlace.info.email || group.info.email || null;
	place.info.addressFormatted = aapentPlace.info.addressFormatted || null;

	// Images
	place.images.icon = group.info.icon || null;
	place.images.pin = group.info.pin || null;

	// Types
	place.types = group.info.types || [];

	// Google
	if (Core.countObject(googlePlaceDetail) > 0) {
		place.google.reference = googlePlaceDetail.reference;
		place.google.plus = googlePlaceDetail.url || null;
		place.google.detail = googlePlaceDetail;
	}

	return place;
};

// ... /CREATE



PlaceHandler.prototype.mergePlaces = function(place, placeMergeId) {
	var placeMerge = this.getPlace(placeMergeId);
	if (!placeMerge)
		return;
	if (Core.countObject(place.hours.regular) == 0 && Core.countObject(placeMerge.hours.regular) > 0)
	{
		place.hours.regular = placeMerge.hours.regular;
	}
	else if (Core.countObject(place.hours.regular) > 0 && Core.countObject(placeMerge.hours.regular) == 0)
	{
		placeMerge.hours.regular = place.hours.regular;
	}
	
	if (place.hours.isOpen === null && placeMerge.hours.isOpen !== null)
	{
		place.hours.isOpen = placeMerge.hours.isOpen;
	}
	else if (placeMerge.hours.isOpen === null && place.hours.isOpen !== null)
	{
		placeMerge.hours.isOpen = place.hours.isOpen;
	}
	
	if (place.isGoogle)
	{
		place.aapent.id = placeMerge.id;
		
// placeMerge.google = place.google;
		placeMerge.google.id = place.id;
	}
	else if (place.isAapent)
	{		
		placeMerge.aapent.id = place.id;
		
// place.google = placeMerge.google; TODO Fix merge places
		place.google.id = placeMerge.id;
	}
}

PlaceHandler.prototype.matchPlaceToGroup = function(place) {
	if (!place)
		return null;

	var group = null;
	for ( var i in this.aapentHandler.groupPlacesList.list) {
		group = this.aapentHandler.groupPlacesList.list[i];
		if (group.info.matchPlace) {
			if (!group.info.matchPlaceObject)
				group.info.matchPlaceObject = new RegExp(group.info.matchPlace, "g");

			if (place.name.match(group.info.matchPlaceObject))
				return group.id;
		}
	}

	return null;
};
