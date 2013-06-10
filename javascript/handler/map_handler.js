/**
 * @param {AapentHandler}
 *            aapentHandler
 * @returns MapHandler
 */
function MapHandler(aapentHandler) {
	this.aapentHandler = aapentHandler;
	this.map = null;
	
	/** Current location marker */
	this.markerLocation = null;
	/** Place marker, for Place not on map */
	this.markerPlace = null;
	/** Places markers */
	this.markersPlaces = {};
	this.markerPlacesClusterer = null;
	
	/** Places to be displayed on map (ids) */
	this.mapPlacesList = new ListAdapter();
};

// CONSTANTS

MapHandler.LATLNG_DEFAULT = [ 61.308167, 8.833008 ];
MapHandler.LATLNG_BOUND_DEFAULT = [ [ 63.802803, 9.964600 ], [ 63.851262, 12.205811 ], [ 58.586509, 11.898193 ], [ 58.540670, 5.460205 ] ];

MapHandler.ID_CANVAS = "map_canvas";
MapHandler.ZOOM_DEFAULT = 4;
MapHandler.ZOOM_VIEWPORT = 17;

MapHandler.SYMBOL_LOCATION = "m0 50.0l0 0c0 -27.614237 22.385763 -50.0 50.0 -50.0l0 0c13.260826 0 25.978523 5.267842 35.35534 14.644661c9.376816 9.37682 14.644661 22.094513 14.644661 35.35534l0 0c0 27.614235 -22.385765 50.0 -50.0 50.0l0 0c-27.614237 0 -50.0 -22.385765 -50.0 -50.0z";
MapHandler.SYMBOL_PLACE = "m77.543304 13.627296l0 0c15.333511 15.550947 15.43222 40.651203 0.22047424 56.062996q-13.771652 13.952751 -27.543304 27.90551q-13.881893 -14.078743 -27.76378 -28.157478l0 0c-15.333513 -15.550949 -15.432221 -40.651207 -0.22047234 -56.062996l0 0c15.211746 -15.411789 39.973576 -15.298979 55.307083 0.25196838z";

MapHandler.Z_INDEX_LOCATION = 5;
MapHandler.Z_INDEX_PLACE = 5;
MapHandler.Z_INDEX_PLACE_AAPENT = 100;
MapHandler.Z_INDEX_PLACE_GOOGLE = 50;

MapHandler.MARKER_CLUSTERER_PLACES_GRID = 30;
MapHandler.MARKER_CLUSTERER_MAX_ZOOM = 15;

// /CONSTANTS

// FUNCTIONS

// ... DO

MapHandler.prototype.doInit = function() {
	var context = this;

	if (!this.map) {
		var mapSettings = this.aapentHandler.getSettings().map || {};
		
		// MAP
		
		var latLng = new google.maps.LatLng(MapHandler.LATLNG_DEFAULT[0], MapHandler.LATLNG_DEFAULT[1]);
		if (mapSettings.lat && mapSettings.lng)
			latLng = new google.maps.LatLng(mapSettings.lat, mapSettings.lng);

		var mapOptions = {
			zoom : mapSettings.zoom || MapHandler.ZOOM_DEFAULT,
			center : latLng,
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
		this.map = new google.maps.Map(document.getElementById(MapHandler.ID_CANVAS), mapOptions);

		// Fit to bounds if no map settings
		if (!mapSettings.lat && !mapSettings.long) {
			var latLngBounds = new google.maps.LatLngBounds();
			latLngBounds.extend(new google.maps.LatLng(MapHandler.LATLNG_BOUND_DEFAULT[0][0], MapHandler.LATLNG_BOUND_DEFAULT[0][1]));
			latLngBounds.extend(new google.maps.LatLng(MapHandler.LATLNG_BOUND_DEFAULT[1][0], MapHandler.LATLNG_BOUND_DEFAULT[1][1]));
			latLngBounds.extend(new google.maps.LatLng(MapHandler.LATLNG_BOUND_DEFAULT[2][0], MapHandler.LATLNG_BOUND_DEFAULT[2][1]));
			latLngBounds.extend(new google.maps.LatLng(MapHandler.LATLNG_BOUND_DEFAULT[3][0], MapHandler.LATLNG_BOUND_DEFAULT[3][1]));
			this.map.fitBounds(latLngBounds);
		}

		google.maps.event.addListener(this.map, 'idle', function() {
			context.handleChanged();
		});

		// /MAP

		// MARKERS
		
		// Place markers clusterer
		this.markerPlacesClusterer = new MarkerClusterer(this.map, [], {
			gridSize: MapHandler.MARKER_CLUSTERER_PLACES_GRID,
			maxZoom : MapHandler.MARKER_CLUSTERER_MAX_ZOOM
		});
		
		// Location marker
		 var locatinSymbol = {
			 path : MapHandler.SYMBOL_LOCATION,
			 fillColor : "#6d9eeb",
			 fillOpacity : 0.8,
			 scale : 0.2,
			 strokeColor : "#6d9eeb",
			 strokeWeight : 2
		 };
		 this.markerLocation = new google.maps.Marker({
			 title : "Current location",
			 map : this.map,
			 position : latLng,
			 icon : locatinSymbol,
			 draggable : false,
			 visible : false,
			 zIndex : MapHandler.Z_INDEX_LOCATION,
			 optimized : false
		 });

		// Place marker
		this.markerPlace = new google.maps.Marker({
			map : this.map,
			position : latLng,
			draggable : false,
			visible : false,
			animation : google.maps.Animation.DROP,
			zIndex : MapHandler.Z_INDEX_PLACE
		});
		
		google.maps.event.addListener(this.markerPlace, 'click', function() {
			if (this.placeId)
				context.aapentHandler.getEventHandler().handle(new PlaceEvent(this.placeId));
		});
		
		// /MARKERS

		// MapLoaded event
		this.aapentHandler.controller.getEventHandler().handle(new MaploadedEvent());

	}

	// Initialize services
	if (this.aapentHandler.services == null) {
		this.aapentHandler.services = {
			places : new google.maps.places.PlacesService(this.map)
		};
	}
	
	this.mapPlacesList.addNotifyOnChange(function(type, object) {		
		console.log("MapPlacesList", type, object);
		switch (type) {
		case "add":
			context.doPlaceAdd(object);
			break;
		case "addall":
			context.doPlacesAdd(object);
			break;
		case "remove":
			context.doPlaceRemove(object);
			break;
		}
	});
};

MapHandler.prototype.doLoaded = function() {
	this.doGeolocationInit();
};

/**
 * @param latLng
 * @param {number|boolean}
 *            zoom
 */
MapHandler.prototype.doViewport = function(latLng, zoom) {
	zoom = zoom ? (typeof zoom == "number" ? zoom : MapHandler.ZOOM_VIEWPORT) : false;
	if (!this.map)
		return console.error("MapHandler.doViewport: Map not initliazed", latLng);
	
	if (zoom)
		this.map.setZoom(zoom);
	this.map.panTo(latLng);
};

MapHandler.prototype.doLocationSet = function(latLng) {
	this.markerLocation.setVisible(true);
	this.markerLocation.setPosition(latLng);
};

// ... ... PLACE

MapHandler.prototype.doPlaceSet = function(placeId) {
	var context = this;
	var place = this.aapentHandler.getPlace(placeId);
	if (!place)
		return console.error("MapHandler.doPlaceSet: Place dosen't exist (%s)", placeId);

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
	
	this.doViewport(latLng);
};


MapHandler.prototype.doPlacesAdd = function(placeIds) {
	for ( var i in placeIds) {
		this.doPlaceAdd(placeIds[i].id);
	}
};

MapHandler.prototype.doPlaceAdd = function(placeId) {
	var context = this;
	var place = this.aapentHandler.getPlace(placeId);
	if (!place)
		return console.error("MapHandler.handleMapPlace: Place dosn't exist (%s)", placeId);
	if (!this.map)
		return console.error("MapHandler.handleMapPlace: Map is not initilized");

	if (this.markersPlaces[place.id]) {
		return; // Already placed		
	}
	
	 // Pin symbol
	 var symbol = {
		 path : MapHandler.SYMBOL_PLACE,
		 fillColor : "#dce3e6",
		 fillOpacity : 1,
		 scale : 0.45,
		 strokeColor : typeof place.hours.isOpen == "boolean" ? (place.hours.isOpen ? "#6aa84f" : "#e06666") : "#AAAAAA",
		 strokeWeight : 2,
		 strokeOpacity : 0.8,
		 anchor : new google.maps.Point(50, 100)
	 };
	
	var marker = new MarkerWithLabel({
		position : place.location.latLng,
		title : place.name,
		 icon : symbol,
		placeId : place.id,
		zIndex : place.isGoogle ? MapHandler.Z_INDEX_PLACE_GOOGLE : MapHandler.Z_INDEX_PLACE_AAPENT,
		 optimized : false,
	   labelContent: "<img src='" + place.images.pin + "' style='height: 30px; width: 30px;' title='" + place.name + "' />",
	   labelAnchor: new google.maps.Point(15, 40),
	   labelClass: "labels", // the CSS class for the label
	   labelStyle: {opacity: 1.0}
	 });

	google.maps.event.addListener(marker, 'click', function() {
		if (this.placeId)
			context.aapentHandler.getEventHandler().handle(new PlaceEvent(this.placeId));
	});
	
	this.markerPlacesClusterer.addMarker(marker);
	this.markersPlaces[place.id] = marker;
};

MapHandler.prototype.doPlaceRemove = function(placeId) {
	if (this.markersPlaces[placeId])
		this.markersPlaces[placeId].setMap(null);
};

// ... ... /PLACE

// ... /DO

// ... HANDLE


MapHandler.prototype.handleChanged = function() {
	var center = this.map.getCenter();

	this.aapentHandler.doPositionsAdd(center);
	
	this.aapentHandler.setSettings({ map : {	
			lat : center.lat(),
			lng : center.lng(),
			zoom : this.map.getZoom()
		}
	});
};

// ... /HANDLE
