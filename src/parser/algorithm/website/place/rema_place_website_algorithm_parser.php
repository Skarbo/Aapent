<?php

class RemaPlaceWebsiteAlgorithmParser extends PlaceWebsiteAlgorithmParser
{

    // VARIABLES


    private static $JSON_RELATIONS = "relations";
    private static $JSON_PLACE_PIN = "pin";
    private static $JSON_PLACE_PIN_ID = "id";
    private static $JSON_PLACE_PIN_NAME = "name";
    private static $JSON_PLACE_PIN_LOCATION = "latlng";
    private static $JSON_PLACE_PIN_LOCATION_LAT = "lat";
    private static $JSON_PLACE_PIN_LOCATION_LONG = "lng";

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
            throw new ParserException(
                    sprintf( "Could not decode json: %s (%d)", Core::jsonError( json_last_error() ), json_last_error() ) );

        $jsonRelations = Core::arrayAt( $json, self::$JSON_RELATIONS );
        $jsonPlaces = Core::arrayAt( $jsonRelations, Core::arrayAt( array_keys( $jsonRelations ), 0 ) );

        $result = new PlaceAlgorithmResultParser();
        foreach ( $jsonPlaces as $jsonPlace )
        {
            $place = $this->parseGroupPlacePlace( Core::arrayAt( $jsonPlace, self::$JSON_PLACE_PIN ) );
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
        $idPlace = Core::arrayAt( $place, self::$JSON_PLACE_PIN_ID );
        $name = Core::arrayAt( $place, self::$JSON_PLACE_PIN_NAME );
        $group = GroupPlaceModel::$TYPE_REMA;

        $locationLat = Core::arrayAt( Core::arrayAt( $place, self::$JSON_PLACE_PIN_LOCATION, array () ),
                self::$JSON_PLACE_PIN_LOCATION_LAT );
        $locationLong = Core::arrayAt( Core::arrayAt( $place, self::$JSON_PLACE_PIN_LOCATION, array () ),
                self::$JSON_PLACE_PIN_LOCATION_LONG );

        $place = PlaceFactoryModel::createPlace( $name, $group, null, $locationLat, $locationLong, null, null,
                $idPlace );

        return $place;
    }

    // /FUNCTIONS


}

?>