/**
 * @param {Object}
 *            place
 * @param {ListAdapter}
 *            placesList
 * @param {ListAdapter}
 *            groupPlacesList
 * @param {ListAdapter}
 *            placesDetailsList
 * @returns
 */
function Place(place, placesList, groupPlacesList, placesDetailsList) {
	this.place = place;	
	this.placesList = placesList;
	this.groupPlacesList = groupPlacesList;
	this.placesDetailsList = placesDetailsList;
	
	this.id = null;
	this.isAapent = false;
	this.isGoogle = false;
	this.name = null;
	this.group = null;
	this.location = null;
	this.info = {
		address : null,
		phone : null,
		link : null,
		email : null
	};
	this.hours = {
		regular : {},
		holiday : {},
		isOpen : null
	};
	this.images = {
		icon : null,
		pin : null
	};
	this.types = [];
	this.google = {
		id : null,
		reference : null,
		plus : null
	};
	this.aapent = {
		id : null
	};
	
	if (this.place.reference)
		this.createFromGoogle();
	else
		this.createFromAapent();
};

Place.TYPE_ESTABLISHMENT = "establishment";

Place.prototype.isType = function(type) {		
	return jQuery.inArray(type, this.types) > -1;
};

// ... CREATE

Place.prototype.createFromGoogle = function() {		
	this.isGoogle = true;
	this.id = this.place.id;
	this.name = this.place.name;
	this.location = this.place.geometry.location;

	this.hours.isOpen = this.place.opening_hours && this.place.opening_hours.open_now != undefined ? this.place.opening_hours.open_now : null;

// if (this.place.address_components) {
// for ( var i in this.place.address_components) {
// var component = this.place.address_components[i];
// if (jQuery.inArray("street_number", component.types) > -1)
// this.info.address = (this.info.address ? this.info.address + " " : "") +
// component.long_name;
// if (jQuery.inArray("route", component.types) > -1)
// this.info.address = component.long_name + (this.info.address ? " " +
// this.info.address : "");
// if (jQuery.inArray("locality", component.types) > -1)
// this.info.city = component.long_name;
// if (jQuery.inArray("postal_code", component.types) > -1)
// this.info.zip = component.long_name;
// if (jQuery.inArray("country", component.types) > -1)
// this.info.country = component.long_name;
// }
// }

	this.info.address = this.place.vicinity || this.place.formatted_address || null;
	this.info.phone = this.place.formatted_phone_number || this.place.international_phone_number || null;
	this.info.link = this.place.website || null;
// if (this.info.address) {
// this.info.address = this.place.vicinity || googlePlaceDetail.vicinity
// || this.info.addressFormatted || null;
// }


	this.images.icon = this.place.icon || null;
	this.images.pin = this.images.icon;
	
	this.types = this.place.types || [];

	this.google.id = this.id;
	this.google.reference = this.place.reference || null;
	this.google.plus = this.place.url || null;	
	
	// Match group
	this.group = this.matchPlaceToGroup();
	var group = this.groupPlacesList.getItem(this.group);
	if (this.group && group) {
		this.images.icon = group.info.icon || this.images.icon || null;
		this.images.pin = group.info.pin || this.images.pin || null;
	}
};

Place.prototype.createFromAapent = function() {	
	var group = this.groupPlacesList.getItem(this.place.group) || { info : {}};

	this.isAapent = true;
	this.id = this.place.id;
	this.group = this.place.group;	

	this.name = this.place.name;

	this.location = new google.maps.LatLng(this.place.locationLat, this.place.locationLong);
	
	if (this.place.hours.regular)
		this.hours.regular = this.place.hours.regular;
	this.hours.isOpen = PlaceUtil.isOpen(this);
	
// this.info.address = this.place.info.address;
	this.info.link = this.place.info.link || group.info.link || null;
	this.info.phone = this.place.info.phone || group.info.phone|| null;
	this.info.email = this.place.info.email || group.info.email || null;
	this.info.address = this.place.info.addressFormatted || null;

	this.images.icon = group.info.icon || null;
	this.images.pin = group.info.pin || null;

	this.types = group.info.types || [];
};


// ... /CREATE

// ... MERGE

Place.prototype.mergePlaceDetail = function(placeDetail) {	
	if (placeDetail.opening_hours && placeDetail.opening_hours.periods) {
		for(var i in placeDetail.opening_hours.periods) {
			var day = PlaceUtil.DAYS_STR[placeDetail.opening_hours.periods[i].close.day];
			if (day && this.hours.regular[day] == null) {
				var open = placeDetail.opening_hours.periods[i].open.time;
				var close = placeDetail.opening_hours.periods[i].close.time;
				this.hours.regular[day] = [  open.substr(0,2) + ":" + open.substr(2,2), close.substr(0,2) + ":" + close.substr(2,2)];
			}
		}		
	}
	if (this.isOpen == null)
	{
		this.isOpen = PlaceUtil.isOpen(this);
		if (this.hours.isOpen == null)
		{
			this.isOpen = placeDetail.opening_hours && typeof placeDetail.opening_hours.open_now != 'undefined' ? placeDetail.opening_hours.open_now : null;								
		}
	}
	
	this.info.link = this.info.link || placeDetail.website || null;
	
	this.google.id = this.google.id || placeDetail.id || null;
	this.google.reference = this.google.reference || placeDetail.reference || null;
	this.google.plus = this.google.plus || placeDetail.url || null;		
};

Place.prototype.mergePlace = function(placeMerge) {	
	if (!placeMerge)
		return console.error("Place.mergePlace: Place merge empty");
	
	if (this.isGoogle)
	{
		this.aapent.id = placeMerge.id;
		placeMerge.google.id = this.id;		
	}
	else
	{
		this.google.id = placeMerge.id;
		placeMerge.aapent.id = this.id;
	}
	
	this.group = this.group || placeMerge.group;	
	this.name = this.name || placeMerge.name;
	this.location = this.location || placeMerge.location;
		
	for(var day in this.hours.regular)
	{
		this.hours.regular[day] = this.hours.regular[day] || placeMerge.hours.regular[day] || null;
	}
	
	this.hours.isOpen = this.hours.isOpen != null ? this.hours.isOpen : ( placeMerge.hours.isOpen != null ? placeMerge.hours.isOpen : PlaceUtil.isOpen(this) );
	
	this.info.link = this.info.link || placeMerge.info.link;
	this.info.phone = this.info.phone || placeMerge.info.phone;
	this.info.email = this.info.email || placeMerge.info.email;
	this.info.address = this.info.address || placeMerge.info.address;

	this.images.icon = this.images.icon || placeMerge.info.icon;
	this.images.pin = this.images.icon || placeMerge.info.pin;

	this.types = this.types.length > 0 ? this.types : placeMerge.types;
	
	this.google.id = this.google.id || placeMerge.google.id || null;
	this.google.reference = this.google.reference || placeMerge.google.reference || null;
	this.google.plus = this.google.plus || placeMerge.google.url || null;
}

// ... /MERGE

// ... MATCH


Place.prototype.matchPlaceToGroup = function(place) {
	var group = null;
	for ( var i in this.groupPlacesList.list) {
		group = this.groupPlacesList.list[i];
		if (group.info.matchPlace) {
			if (!group.info.matchPlaceObject)
				group.info.matchPlaceObject = new RegExp(group.info.matchPlace, "g");

			if (this.name.match(group.info.matchPlaceObject))
				return group.id;
		}
	}

	return null;
};

// ... /MATCH
