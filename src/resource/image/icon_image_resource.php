<?php

class IconImageResource extends ClassCore
{

    // VARIABLES


    private $locationSvg = "location";
    private $listSvg = "list";
    private $markerSvg = "marker";
    private $searchSvg = "search";

    private static $SVG = "svg.php?svg=%s%s";

    // /VARIABLES


    // CONSTRUCTOR


    // /CONSTRUCTOR


    // FUNCTIONS


    // /FUNCTIONS


    public static function getSvg( $svg, $stroke = null, $fill = null )
    {
        return sprintf( self::$SVG, $svg,
                sprintf( "%s%s", $fill ? sprintf( "&fill=%s", urlencode( $fill ) ) : "",
                        $stroke ? sprintf( "&stroke=%s", urlencode( $stroke ) ) : "" ) );
    }

    public function getLocationSvg( $stroke = null, $fill = null )
    {
        return self::getSvg( $this->locationSvg, $stroke, $fill );
    }

    public function getListSvg( $stroke = null, $fill = null )
    {
        return self::getSvg( $this->listSvg, $stroke, $fill );
    }

    public function getMarkerSvg( $stroke = null, $fill = null )
    {
        return self::getSvg( $this->markerSvg, $stroke, $fill );
    }

    public function getSearchSvg( $stroke = null, $fill = null )
    {
        return self::getSvg( $this->searchSvg, $stroke, $fill );
    }

    // ... ROOM


    // ... /ROOM


}

?>