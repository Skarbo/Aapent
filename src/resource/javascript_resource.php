<?php

class JavascriptResource extends AbstractJavascriptResource {

    // VARIABLES


    private $javascriptFile = "javascript_app.js.php?mode=%s";
    private $googleMapsApiUrl = "http://maps.googleapis.com/maps/api/js?key=%s&sensor=%s&callback=%s&libraries=%s&region=%s";
    private $googleMapsMarkerclusterer = "api/googlemaps/markerclusterer_googlemaps_api.js";
    private $googleMapsMarkerlabel = "api/googlemaps/markerlabel_googlemaps_api.js";

    // /VARIABLES


    // CONSTRUCTOR


    public function __construct() {
        parent::__construct();

        $this->javascriptFile = sprintf( "%s/%s", self::$ROOT_FOLDER, $this->javascriptFile );
        $this->googleMapsMarkerclusterer = sprintf( "%s/%s", self::$ROOT_FOLDER, $this->googleMapsMarkerclusterer );
        $this->googleMapsMarkerlabel = sprintf( "%s/%s", self::$ROOT_FOLDER, $this->googleMapsMarkerlabel );
    }

    // /CONSTRUCTOR


    // FUNCTIONS


    public function getJavascriptFile( $mode = null ) {
        return sprintf( $this->javascriptFile, $mode );
    }

    public function getGoogleMapsApiUrl( $apiKey, $callback, $libraries = "", $sensor = "false", $region = "" ) {
        return sprintf( $this->googleMapsApiUrl, $apiKey, $sensor, $callback, $libraries, $region );
    }

    public function getGoogleMapsMarkerclusterer() {
        return $this->googleMapsMarkerclusterer;
    }

    public function getGoogleMapsMarkerlabel() {
        return $this->googleMapsMarkerlabel;
    }

    // /FUNCTIONS


}

?>