function PlaceUtil() {
};

PlaceUtil.DAY_STARTON = 1;

PlaceUtil.DAYS_STR = [ "sun", "mon", "tue", "wed", "thu", "fri", "sat" ];

PlaceUtil.DAYS_INT = {
	"sun" : 0,
	"mon" : 1,
	"tue" : 2,
	"wed" : 3,
	"thu" : 4,
	"fri" : 5,
	"sat" : 6
};

PlaceUtil.DAYS_NAMES = [ "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday" ];

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
 * @param {Place} place
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
};

/**
 * @param {Place} place
 * @returns {Array} Array(From, To)|String("Closed")|null
 */
PlaceUtil.getHours = function(place) {
	if (!place || !place.hours || !place.hours.regular)
		return null;
	var time = new Date();
	var day = PlaceUtil.DAYS_STR[time.getDay()];
	return place.hours.regular[day];
};
