// CONSTRUCTOR
AapentAppMainController.prototype = new AppMainController();

function AapentAppMainController(eventHandler, mode, query) {
	AppMainController.apply(this, arguments);
	this.aapentHandler = new AapentHandler(this);
	this.googleServices = null;
}

// /CONSTRUCTOR

// VARIABLES

// /VARIABLES

// FUNCTIONS

// ... GET

/**
 * @return {AapentAppMainView}
 */
AapentAppMainController.prototype.getView = function() {
	return AppMainController.prototype.getView.call(this);
};

/**
 * @return {AapentHandler}
 */
AapentAppMainController.prototype.getAapentHandler = function() {
	return this.aapentHandler;
};

/**
 * @return {Object}
 */
AapentAppMainController.prototype.getGoogleServices = function() {
	return this.googleServices;
};

// ... /GET

AapentAppMainController.prototype.setGoogleServices = function(googleServices) {
	this.googleServices = googleServices;
};

// ... DO

AapentAppMainController.prototype.doBindEventHandler = function() {
	AppMainController.prototype.doBindEventHandler.call(this);
	var context = this;

//	this.getEventHandler().registerListener(MapinitEvent.TYPE,
//	/**
//	 * @param {MapinitEvent}
//	 *            event
//	 */
//	function(event) {
//		context.getAapentHandler().doMapInit();
//	});
//
//	this.getEventHandler().registerListener(MaploadedEvent.TYPE,
//	/**
//	 * @param {MaploadedEvent}
//	 *            event
//	 */
//	function(event) {
//		context.getAapentHandler().doMapLoaded();
//	});

//	this.getEventHandler().registerListener(PositionEvent.TYPE,
//	/**
//	 * @param {PositionEvent}
//	 *            event
//	 */
//	function(event) {
//		context.getAapentHandler().doMapViewport(event.getLanLon());
//	});
};

// ... /DO

// ... RENDER

/**
 * @param {AapentAppMainView}
 *            view
 */
AapentAppMainController.prototype.render = function(view) {
	AppMainController.prototype.render.call(this, view);
	
//	this.getAapentHandler().doRetrieveAapent({});
	this.getAapentHandler().doInit();
};

// ... /RENDER

// /FUNCTIONS
