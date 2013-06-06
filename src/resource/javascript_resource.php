<?php

class JavascriptResource extends AbstractJavascriptResource
{

    // VARIABLES


    private $javascriptFile = "javascript_app.js.php?mode=%s";
    private $googleMapsApiUrl = "http://maps.googleapis.com/maps/api/js?key=%s&sensor=%s&callback=%s&libraries=%s&region=%s";

    // /VARIABLES


    // CONSTRUCTOR


    public function __construct()
    {
        parent::__construct();

        $this->javascriptFile = sprintf( "%s/%s", self::$ROOT_FOLDER, $this->javascriptFile );
    }

    // /CONSTRUCTOR


    // FUNCTIONS


    public function getJavascriptFile( $mode = null )
    {
        return sprintf( $this->javascriptFile, $mode );
    }

    public function getGoogleMapsApiUrl( $apiKey, $callback, $libraries = "", $sensor = "false", $region = "" )
    {
        return sprintf( $this->googleMapsApiUrl, $apiKey, $sensor, $callback, $libraries, $region );
    }

    // /FUNCTIONS


}

?>