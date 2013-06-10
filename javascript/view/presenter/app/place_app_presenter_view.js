// CONSTRUCTOR
PlaceAppPresenterView.prototype = new AbstractPresenterView();

function PlaceAppPresenterView(view) {
	AbstractPresenterView.apply(this, arguments);
	this.placeId = null;
	this.place = null;
	this.placeTemplate = null;
};

// VARIABLES

PlaceAppPresenterView.URL_STREETVIEW_API = "https://maps.googleapis.com/maps/api/streetview?size=400x100&location=%s,%s&sensor=false";
PlaceAppPresenterView.URL_STREETVIEW = "https://maps.google.com?q=%s,%s&layer=c";
PlaceAppPresenterView.URL_MAP = "https://maps.google.com?q=%s,%s";
PlaceAppPresenterView.URL_GOOGLE_PLUS = "https://plus.google.com/%s/about";

// /VARIABLES

// FUNCTIONS

// ... GET

/**
 * @returns {AapentAppMainView}
 */
PlaceAppPresenterView.prototype.getView = function() {
	return AbstractPresenterView.prototype.getView.call(this);
};

/**
 * @returns {AapentHandler}
 */
PlaceAppPresenterView.prototype.getAapentHandler = function() {
	return this.getView().getAapentHandler();
};

PlaceAppPresenterView.prototype.getTimesGroupElements = function() {
	return this.getRoot().find(".hours_wrapper .times_wrapper .times_group");
};

// ... /GET

// ... CREATE

PlaceAppPresenterView.prototype.createPhoneElement = function(phone) {
	return $("<a />", {
		href : "tel:" + phone.replace(/[^\d\+]+/g, ""),
		text : phone,
		target : "_blank"
	});
};

PlaceAppPresenterView.prototype.createEmailElement = function(email) {
	email = (email.split("@")[0]).length > 20 ? Core.sprintf( "%s..@%s", email.split("@")[0].substr(0, 18), email.split("@")[1] ) : email;
	return $("<a />", {
		href : "mailto:" + email,
		text : email,
		target : "_blank"
	});
};

PlaceAppPresenterView.prototype.createWebsiteElement = function(website) {
	var websiteText = website.replace(/http:|https:|\/\/|www\./g, "").split("/")[0];
	return $("<a />", {
		href : website,
		text : websiteText,
		target : "_blank"
	});
};

// ... /CREATE

// ... DO

PlaceAppPresenterView.prototype.doBindEventHandler = function() {
	AbstractPresenterView.prototype.doBindEventHandler.call(this);
	var context = this;
	
	this.getEventHandler().registerListener(PlaceEvent.TYPE,
			/**
			 * @param {PlaceEvent}
			 *            event
			 */
			function(event) {
		context.doPlaceDraw(event.getPlaceId());
	});

	// Search result list
	this.getAapentHandler().placeHandler.placesList.addNotifyOnChange(function(type, object) {
		switch (type) {
		case "add":
			if (object.id == context.placeId)
				context.doPlaceDraw(object.id);
			break;
		}
	});
};

PlaceAppPresenterView.prototype.doPlaceDraw = function(placeId) {
	var context = this;
	this.placeId = placeId;
	this.place = this.getAapentHandler().getPlace(placeId);
	if (!this.place)
		return console.error("PlaceAppPresenterView.doPlaceDraw: Place dosen't exist (%s)", placeId);
	this.getRoot().empty();

	console.log("PlaceAppPresenterView.doPlaceDraw", placeId, this.place);
	// var placeDetails = {};
	// // Google Place
	// if (this.place.reference) {
	// this.place = PlaceUtil.createPlaceFromGoogle(this.place);
	// var placeDetailsObject =
	// this.getAapentHandler().placesDetailsList.getItem(this.place.id);
	// if (placeDetailsObject)
	// this.place = PlaceUtil.createPlaceFromGoogle(placeDetailsObject);
	// }
	// // Aapent Place
	// else {
	// var group = this.getAapentHandler().getGroupPlace(this.place.group);
	// this.place = PlaceUtil.createPlaceFromAapent(this.place, group);
	// }
	// console.log("doPlaceDraw", placeId, this.place);

	var placeElement = this.placeTemplate.clone();

	// INFO

	var infoWrapper = placeElement.find(".info_wrapper");
	var contentWrapper = placeElement.find(".content");

	if (this.place.images.icon)
		contentWrapper.find(".icon img").attr("src", this.place.images.icon);

	if (this.place.name)
		contentWrapper.find(".name").text(this.place.name);

	if (this.place.info.addressFormatted || this.place.info.address)
		contentWrapper.find(".address").text(this.place.info.addressFormatted || this.place.info.address);
	else
		contentWrapper.find(".address").addClass("hide");
	
	contentWrapper.on("touchclick", { placeId : placeId },function(event){
		event.preventDefault();
		context.getView().doPlaceShowOnMap(event.data.placeId);
	});

	// ... CONTACT

	var contactWrapper = infoWrapper.find(".contact_wrapper");

	// Phone
	var phoneContact = contactWrapper.find(".contact_item[data-contact='phone']");
	if (this.place.info.phone)
		phoneContact.find(".value").html(this.createPhoneElement(this.place.info.phone));
	else
		phoneContact.remove();

	// Email
	var emailContact = contactWrapper.find(".contact_item[data-contact='email']");
	if (this.place.info.email)
		emailContact.find(".value").html(this.createEmailElement(this.place.info.email));
	else
		emailContact.remove();

	// Website
	var websiteContact = contactWrapper.find(".contact_item[data-contact='website']");
	if (this.place.info.link)
		websiteContact.find(".value").html(this.createWebsiteElement(this.place.info.link));
	else
		websiteContact.remove();
	
	if (contactWrapper.text() == "")
		contactWrapper.addClass("hide");

	// ... /CONTACT

	// /INFO

	// HOURS

	var hoursWrapper = placeElement.find(".hours_wrapper");
	
	var isAlcohol = jQuery.inArray("grocery_or_supermarket", this.place.types) > -1;
	if (isAlcohol)
		hoursWrapper.attr("data-alcohol", "true");
	
	var timesWrapper = hoursWrapper.find(".times_wrapper");

	// ... REGULAR

	var regularTimesGroup = hoursWrapper.find(".times_group[data-times-group='regular']");
	var timesRowTemplate = regularTimesGroup.find(".times_row").clone();
	regularTimesGroup.empty();
	var hoursCount = 0;

	if (this.place.hours.regular && Core.countObject(this.place.hours.regular) > 0) {
		var now = new Date();
		var today = now.getDay();
		var dayStart = PlaceUtil.DAY_STARTON;
		var day = dayStart;
		for ( var i = 0; i < PlaceUtil.DAYS_STR.length; i++) {
			day = (i + dayStart) % 7;
			var dayStr = PlaceUtil.DAYS_STR[day];
			var dayInt = PlaceUtil.DAYS_INT[dayStr];
			var dayName = PlaceUtil.DAYS_NAMES[dayInt];
			var timesRow = timesRowTemplate.clone();			
			
			timesRow.find(".day").text(dayName);
			
			if (this.place.hours.regular[dayStr] && typeof this.place.hours.regular[dayStr] == "object")
				timesRow.find(".hour_from").text(this.place.hours.regular[dayStr][0]);
			else if (this.place.hours.regular[dayStr] == "closed")
				timesRow.find(".hour_from").text("Closed");
			else
				timesRow.find(".hour_from").html("&nbsp;");
			if (this.place.hours.regular[dayStr] && typeof this.place.hours.regular[dayStr] == "object")
				timesRow.find(".hour_to").text(this.place.hours.regular[dayStr][1]);
			else
				timesRow.find(".hour_to").html("&nbsp;");
			
			if (this.place.hours.regular[dayStr] !== null)
				hoursCount++
			
			if (isAlcohol)
			{
				var alcoholDay = this.getAapentHandler().features.specialdays ? this.getAapentHandler().features.specialdays.value[dayStr].grocery_or_supermarket : null;
				if (alcoholDay && alcoholDay.alcohol == "closed") {
					timesRow.find(".hour_alcohol").html("&nbsp;");
					if (day == today)
						timesRow.find(".hour_alcohol").attr("data-alcohol-open", "false")
				}
				else if (alcoholDay && alcoholDay.alcohol && this.place.hours.regular[dayStr] && typeof this.place.hours.regular[dayStr] == "object") {
					timesRow.find(".hour_alcohol").text(alcoholDay.alcohol);
					if (day == today)
						timesRow.find(".hour_alcohol").attr("data-alcohol-open", parseInt(this.place.hours.regular[dayStr][0]) <= now.getHours() && now.getHours() <= parseInt(alcoholDay.alcohol) ? "true" : "false");
				}
				else
					timesRow.find(".hour_alcohol").html("&nbsp;");
			}
			
			if (day == today && typeof this.place.hours.isOpen == "boolean")
				timesRow.attr("data-open", this.place.hours.isOpen ? "open" : "closed");
			
			var relative = (dayStart + i - today);
			timesRow.attr("data-day", i).attr("data-day-relative", relative >= 0 ? relative : relative + 7);
			
			regularTimesGroup.append(timesRow);
		}
// for ( var i = 0; i < Core.countObject(this.place.hours.regular); i++) {
// var dayStr = PlaceUtil.DAYS_STR[(i + today) % 7];
// var dayInt = PlaceUtil.DAYS_INT[dayStr];
// var dayName = today == dayInt ? "Today" : PlaceUtil.DAYS_NAMES[dayInt];
// var timesRow = timesRowTemplate.clone();
// timesRow.find(".day").text(dayName);
// if (this.place.hours.regular[dayStr] && typeof
// this.place.hours.regular[dayStr] == "object")
// timesRow.find(".hour_from").text(this.place.hours.regular[dayStr][0]);
// else if (this.place.hours.regular[dayStr] == "closed")
// timesRow.find(".hour_from").text("Closed");
// else
// timesRow.find(".hour_from").html("&nbsp;");
// if (this.place.hours.regular[dayStr] && typeof
// this.place.hours.regular[dayStr] == "object")
// timesRow.find(".hour_to").text(this.place.hours.regular[dayStr][1]);
// else
// timesRow.find(".hour_to").html("&nbsp;");
// timesRow.find(".hour_alcohol").text("20:00");
// regularTimesGroup.append(timesRow);
// }
	}

	// ... /REGULAR

	// ... HOLIDAYS

	var holdayTimesGroup = hoursWrapper.find(".times_group[data-times-group='holiday']");
	var timesRowTemplate = holdayTimesGroup.find(".times_row").clone();
	holdayTimesGroup.empty();
	
	var specialDayType = jQuery.inArray("grocery_or_supermarket", this.place.types) > -1 ? "grocery_or_supermarket" : null;
	
	if (specialDayType) {
		var now = new Date();
		for(var i in this.getAapentHandler().features.specialdays.value)
		{
			var specialday = this.getAapentHandler().features.specialdays.value[i];
// console.log(i, specialday, !isNaN(parseInt(i)), now.getTime() <= parseInt(i),
// specialday[specialDayType]);
			if (!isNaN(parseInt(i)) && now.getTime() <= parseInt(i) && specialday[specialDayType])
			{
				var timesRow = timesRowTemplate.clone();
				
				timesRow.find(".day").text(specialday.name);
				
				if (specialday[specialDayType].hours) {					
					if (specialday[specialDayType].hours == "closed")
					{
						timesRow.find(".hour_from").text("Closed");				
						timesRow.find(".hour_to").html("&nbsp;");				
					}
					else if (specialday[specialDayType].hours)
					{
						timesRow.find(".hour_from").html("&nbsp;");				
						timesRow.find(".hour_to").text(specialday[specialDayType].hours);				
					}
				}
				else
				{
					timesRow.find(".hour_from").html("&nbsp;");				
					timesRow.find(".hour_to").html("&nbsp;");									
				}
				
				if (isAlcohol && specialday[specialDayType].alcohol)
				{
					if (specialday[specialDayType].alcohol == "closed")
						timesRow.find(".hour_alcohol").html("&nbsp;");				
					else if (specialday[specialDayType].alcohol)
						timesRow.find(".hour_alcohol").text(specialday[specialDayType].alcohol);							
				}
				else
					timesRow.find(".hour_alcohol").html("&nbsp;");
				
				holdayTimesGroup.append(timesRow);
			}
		}		
	}
	

	// ... /HOLIDAYS

	if (hoursCount == 0)
		hoursWrapper.addClass("hide");

	// More
	hoursWrapper.find(".hours_more_wrapper").on("touchclick", function(event) {
		event.preventDefault();
		if (hoursWrapper.attr("data-hours-more")) {
			hoursWrapper.removeAttr("data-hours-more");			
			context.doHoursSort("relative");
		} 
		else {
			hoursWrapper.attr("data-hours-more", "true");
			context.doHoursSort("day");
		}			
	});

	// /HOURS

	// MAP

	var mapWrapper = placeElement.find(".map_wrapper");

	// Streetview
	if (this.place.location.lat && this.place.location.lng) {
		var streetviewApiUrl = Core.sprintf(PlaceAppPresenterView.URL_STREETVIEW_API, this.place.location.lat, this.place.location.lng);
		mapWrapper.find(".streetview img").attr("src", streetviewApiUrl);
		var streetviewUrl = this.place.name && this.place.info.address ? Core.sprintf(PlaceAppPresenterView.URL_STREETVIEW, this.place.name, this.place.info.address) : Core
				.sprintf(PlaceAppPresenterView.URL_STREETVIEW, this.place.location.lat, this.place.location.lng);
		mapWrapper.find(".streetview").on("touchclick", {
			url : streetviewUrl
		}, function(event) {
			window.open(event.data.url, '_blank');
		});
	} else
		mapWrapper.find(".streetview").addClass("hide");

	// ... BUTTONS

	var buttons = mapWrapper.find(".buttons");

	// Directions
	var directionsButton = buttons.find(".button[data-button='directions']");
	if (this.place.location.lat && this.place.location.lng) {
		directionsButton.on("touchclick", {
			placeId : this.place.id
		}, function(event) {
			context.getView().getAapentHandler().doDirections(event.data.placeId);
		});
	} else
		directionsButton.addClass("hide");

	// Map
	var mapButton = buttons.find(".button[data-button='map']");
	var mapUrl = this.place.name && this.place.info.address ? Core.sprintf(PlaceAppPresenterView.URL_MAP, this.place.name, this.place.info.address) : (this.place.location.lat
			&& this.place.location.lng ? Core.sprintf(PlaceAppPresenterView.URL_MAP, this.place.location.lat, this.place.location.lng) : null);
	if (mapUrl) {
		mapButton.on("touchclick", {
			url : mapUrl
		}, function(event) {
			window.open(event.data.url, '_blank');
		});
	} else
		mapButton.addClass("hide");

	// Google plus
	var googlePlusButton = buttons.find(".button[data-button='google_plus']");
	if (this.place.google.plus) {
		// var url = Core.sprintf(PlaceAppPresenterView.URL_GOOGLE_PLUS,
		// this.place.googlePlus);
		googlePlusButton.on("touchclick", {
			url : this.place.google.plus
		}, function(event) {
			window.open(event.data.url, '_blank');
		});
	} else
		googlePlusButton.addClass("hide");

	// ... /BUTTONS

	// /MAP

	this.getRoot().append(placeElement);
	
	this.doHoursSort("relative");
};

PlaceAppPresenterView.prototype.doHoursSort = function(type) {
	var timesGroup = this.getTimesGroupElements().filter("[data-times-group='regular']").find(".times_row");
	
	timesGroup.sortElements(function(left, right) {
		left = $(left);
		right = $(right);
		var leftDay = parseInt(left.attr("data-day"));
		var rightDay = parseInt(right.attr("data-day"));
		var leftDayRelative = parseInt(left.attr("data-day-relative"));
		var rightDayRelative = parseInt(right.attr("data-day-relative"));
		return type == "relative" ? ( leftDayRelative > rightDayRelative ? 1 : -1 ) : ( leftDay > rightDay ? 1 : -1 );
	});
};

// ... /DO

PlaceAppPresenterView.prototype.draw = function(root) {
	AbstractPresenterView.prototype.draw.call(this, root);

	this.placeTemplate = this.getRoot().clone();
	this.getRoot().empty();
};

// /FUNCTIONS
