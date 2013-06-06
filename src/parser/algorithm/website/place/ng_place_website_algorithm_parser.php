<?php

abstract class NgPlaceWebsiteAlgorithmParser extends PlaceWebsiteAlgorithmParser
{

    // VARIABLES


    private static $JSON_PLACES = "d";
    private static $JSON_PLACE_ID = "MarketId";
    private static $JSON_PLACE_NAME = "Name";
    private static $JSON_PLACE_INFO_ADDRESS = "Address";
    private static $JSON_PLACE_INFO_LINK = "Url";
    private static $JSON_PLACE_INFO_ZIP = "PostalCode";
    private static $JSON_PLACE_LOCATION_LAT = "Latitude";
    private static $JSON_PLACE_LOCATION_LONG = "Longitude";

    private static $REGEX_ADDRESS = '/^([A-Z0-9ØÆÅ\s]+)\s(.+)/';



    // /VARIABLES


    // CONSTRUCTOR


    // /CONSTRUCTOR


    // FUNCTIONS


    /**
     * @see WebsiteAlgorithmParser::getParseType()
     */
    public function getParseType()
    {
        return self::PARSER_TYPE_HTML;
    }

    protected abstract function getPlaceType();

    // ... GROUP PLACE


    /**
     * @see PlaceWebsiteAlgorithmParser::parseGroupPlace()
     */
    public function parseGroupPlace( $html )
    {
        if ( !$html )
            throw new ParserException( "Raw HTML is null" );
        $html = Core::trimWhitespace( $html );
        $json = json_decode( $html, true );

        if ( !$json )
            throw new ParserException( sprintf( "Could not decode json: %s", Core::jsonError( json_last_error() ) ) );

        $result = new PlaceAlgorithmResultParser();
        $placesJson = Core::arrayAt( $json, self::$JSON_PLACES );

        foreach ( $placesJson as $placeJson )
        {
            $place = $this->parseGroupPlacePlace( $placeJson );

            if ( $place )
                $result->getPlaces()->add( $place );
        }

        return $result;
    }

    /**
     * @param array $place
     * @return PlaceModel
     */
    private function parseGroupPlacePlace( array $place )
    {
        $idPlace = Core::arrayAt( $place, self::$JSON_PLACE_ID );
        $name = Core::arrayAt( $place, self::$JSON_PLACE_NAME );
        $group = $this->getPlaceType();

        $info = $this->parseGroupPlaceInfo( $place );

        $locationLat = Core::arrayAt( $place, self::$JSON_PLACE_LOCATION_LAT );
        $locationLong = Core::arrayAt( $place, self::$JSON_PLACE_LOCATION_LONG );

        $place = PlaceFactoryModel::createPlace( $name, $group, $info, $locationLat, $locationLong, null, null,
                $idPlace );

        return $place;
    }

    /**
     * @param array $place
     * @return InfoPlaceContainer
     */
    private function parseGroupPlaceInfo( array $place )
    {
        $info = new InfoPlaceContainer();

        if ( preg_match( self::$REGEX_ADDRESS, Core::arrayAt( $place, self::$JSON_PLACE_INFO_ADDRESS ), $addressRegex ) )
        {
            $info->city = Core::utf8Encode( Core::ucwords( $addressRegex[ 1 ] ) );
            $info->address = Core::utf8Encode( Core::ucwords( $addressRegex[ 2 ] ) );
            $info->country = "Norge";
            $info->addressFormatted = sprintf( "%s, %s, %s", $info->address, $info->city, $info->country );
        }

        $info->link = Core::arrayAt( $place, self::$JSON_PLACE_INFO_LINK );
        $info->zip = Core::arrayAt( $place, self::$JSON_PLACE_INFO_ZIP );

        return $info;
    }

    // ... GROUP PLACE


    // /FUNCTIONS


}

?>