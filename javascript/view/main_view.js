// CONSTRUCTOR
MainView.prototype = new AbstractMainView();

function MainView() {
	AbstractMainView.apply(this, arguments);
	this.resizeTimer = null;
};

// /CONSTRUCTOR

// VARIABLES

// /VARIABLES

// FUNCTIONS

// ... GET

/**
 * @return {MainController}
 */
MainView.prototype.getController = function() {
	return AbstractMainView.prototype.getController.call(this);
};

// ... /GET

// ... HANDLE

MainView.prototype.handleResize = function() {
	var landscape = window.orientation == -90 || window.orientation == 90 ? true : false;
	if (landscape)
		$("body").addClass("landscape").removeClass("portrait");
	else
		$("body").addClass("portrait").removeClass("landscape");
};

// ... /HANDLE

// ... DO

MainView.prototype.doBindEventHandler = function() {
	AbstractMainView.prototype.doBindEventHandler.call(this);
	var context = this;

	// EVENTS
	
	this.getEventHandler().registerListener(MapinitEvent.TYPE,
	/**
	 * @param {ResizeEvent}
	 *            event
	 */
	function(event) {
		context.handleResize();
	});
	
	// /EVENTS

	// RESIZE

	var supportsOrientationChange = "onorientationchange" in window;
	var orientationEvent = supportsOrientationChange ? "orientationchange" : "resize";
	window.addEventListener(orientationEvent, function() {
		if (context.resizeTimer)
			clearTimeout(context.resizeTimer);
		context.resizeTimer = setTimeout(function() {
			context.getEventHandler().handle(new ResizeEvent());
		}, 10);
	}, false);

	// /RESIZE

};

MainView.prototype.after = function() {
	AbstractMainView.prototype.after.call(this);
	
	this.getEventHandler().handle(new ResizeEvent());
};

MainView.prototype.draw = function(controller) {
	AbstractMainView.prototype.draw.call(this, controller);
};

// ... /DO

// /FUNCTIONS
