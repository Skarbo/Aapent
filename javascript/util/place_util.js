function PlaceUtil() {
};

PlaceUtil.DAY_STARTON = 1;

PlaceUtil.DAYS_STR = [
	"sun",
	"mon",
	"tue",
	"wed",
	"thu",
	"fri",
	"sat"
];

PlaceUtil.DAYS_INT = {
	"sun" : 0,
	"mon" : 1,
	"tue" : 2,
	"wed" : 3,
	"thu" : 4,
	"fri" : 5,
	"sat" : 6
};

PlaceUtil.DAYS_NAMES = [
	"Sunday",
	"Monday",
	"Tuesday",
	"Wednesday",
	"Thursday",
	"Friday",
	"Saturday"
];

PlaceUtil.DAYS_DEFAULT = {
	"sun" : "closed",
	"mon" : "closed",
	"tue" : "closed",
	"wed" : "closed",
	"thu" : "closed",
	"fri" : "closed",
	"sat" : "closed"
};

PlaceUtil.PLACE_DEFAULT = {
	id : null,
	isAapent : false,
	isGoogle : false,
	name : null,
	group : null,
	location : {
		lat : null,
		lng : null
	},
	info : {
		address : null,
		phone : null,
		link : null
	},
	hours : {
		regular : {},
		holiday : {},
		isOpen : null
	},
	images : {
		icon : null,
		pin : null		
	},
	google : {
		id : null,
		reference : null,
		plus : null,
		detail : null,
		place : null
	},
	aapent : {
		id : null
	},
	types : []
};

/**
 * @param {Object}
 *            googlePlace
 * @param {Object}
 *            googlePlaceDetail
 * @return {Object} Place object
 */
PlaceUtil.createPlaceFromGoogle = function(googlePlace, googlePlaceDetail) {
	googlePlaceDetail = googlePlaceDetail || {};
	if (!googlePlace)
		return null;
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
	place.hours.isOpen = googlePlace.opening_hours && googlePlace.opening_hours.is_open != undefined ? googlePlace.opening_hours.is_open : PlaceUtil.isOpen(place);
	
	// Info
// place.info = {
// address : null,
// phone : null,
// link : null
// };
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
	// } else
	place.info.addressFormatted = googlePlace.vicinity || googlePlace.formatted_address || googlePlaceDetail.vicinity || googlePlaceDetail.formatted_address || null;
	place.info.phone = googlePlace.formatted_phone_number ||  googlePlaceDetail.formatted_phone_number || googlePlace.international_phone_number || googlePlaceDetail.international_phone_number || null;
	if (place.info.address)
		place.info.address = googlePlace.vicinity || googlePlaceDetail.vicinity || place.info.addressFormatted || null;

	// Link
	place.info.link = googlePlace.website || googlePlaceDetail.website || null;

	// Icon
	place.images.icon = googlePlace.icon || googlePlaceDetail.icon || null;

	// Pin
	place.images.pin = place.images.icon;

	// Google
	place.google.reference = googlePlace.reference || googlePlaceDetail.reference || null;
	place.google.plus = googlePlace.url || googlePlaceDetail.url || null;
	if (Core.countObject(googlePlaceDetail) > 0)
		place.google.detail = googlePlaceDetail;
	place.google.place = googlePlace;

	// Types
	place.types = googlePlace.types || [];

	return place;
};

/**
 * @param {Object}
 *            aapentPlace
 * @return {Object} Place object
 */
PlaceUtil.createPlaceFromAapent = function(aapentPlace, group, googlePlaceDetail) {
	if (!aapentPlace)
		return null;
	group = group || { info : {}};
	googlePlaceDetail = googlePlaceDetail || {};
	
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
		place.reference = googlePlaceDetail.reference;
		place.plus = googlePlaceDetail.url || null;
		place.detail = googlePlaceDetail;
	}

	return place;
};

PlaceUtil.isGooglePlace = function(place) {
	return !(!(place.reference));
};

/**
 * @returns {Boolean} True if open, false if closed, null if unknown
 */
PlaceUtil.isOpen = function(place) {
	if (!place)
		return null;
	var hours = this.getHours(place);
	if (hours == "closed")
		return false;
	if (!hours)
		return null;
	var time = new Date();
	var hoursFrom = parseInt(hours[0].split(":")[0]);
	var hoursTo = parseInt(hours[1].split(":")[0]);
	if (hoursFrom > hoursTo)
		hoursTo += 24;
	return time.getHours() >= hoursFrom && time.getHours() <= hoursTo;
	
//	var from = new Date();
//	from.setHours(parseInt(hoursFrom[0]));
//	from = from.setMinutes(parseInt(hoursFrom[1]));
//	var to = new Date();
//	to.setHours(parseInt(hoursTo[0]));
//	to = to.setMinutes(parseInt(hoursTo[1]));
//	return time.getTime() >= from && time.getTime() <= to;
};

/**
 * @returns {Array} Array(From, To)|String("Closed")|null
 */
PlaceUtil.getHours = function(place) {
	if (!place || !place.hours || !place.hours.regular)
		return null;
	var time = new Date();
	var day = PlaceUtil.DAYS_STR[time.getDay()];
	return place.hours.regular[day];
};

PlaceUtil.getAddress = function(place) {
	if (!place || !place.info)
		return "";
	return place.info.address + (place.info.county ? ", " + place.info.county : "");
};
