<?php

class RimiPlaceWebsiteAlgorithmParser extends PlaceWebsiteAlgorithmParser
{

    // VARIABLES


    private static $JSON_SHOPS = "Shops";
    private static $JSON_SHOP_ID = "Id";
    private static $JSON_SHOP_NAME = "Name";
    private static $JSON_SHOP_INFO_REGION = "Region";
    private static $JSON_SHOP_INFO_ADDRESS = "Address";
    private static $JSON_SHOP_INFO_CITY = "City";
    private static $JSON_SHOP_INFO_ZIP = "Zip";
    private static $JSON_SHOP_INFO_PHONE = "Phone";
    private static $JSON_SHOP_INFO_MUNICIPAL = "Municipal";
    private static $JSON_SHOP_INFO_COUNTY = "County";
    private static $JSON_SHOP_HOURS_MONDAYFRIDAY = "OpeningHoursMondayToFriday";
    private static $JSON_SHOP_HOURS_SATURDAY = "OpeningHoursSaturday";
    private static $JSON_SHOP_HOURS_SUNDAY = "OpeningHoursSunday";
    private static $JSON_SHOP_FEATURE_POST = "Post";
    private static $JSON_SHOP_FEATURE_MYPACK = "MyPack";
    private static $JSON_SHOP_FEATURE_TIPPING = "Tipping";
    private static $JSON_SHOP_LOCATION_LAT = "Latitude";
    private static $JSON_SHOP_LOCATION_LONG = "Longitude";

    private static $REGEX_HOURS = '/(\d{2}\:\d{2}).+(\d{2}\:\d{2})/i';
    private static $REGEX_HOURS_CLOSED = '/.*closed.*/i';
    private static $REGEX_TRUE = "/.*true.*/i";

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
        $html = substr( $html, strpos( $html, "{" ), strlen( $html ) );

        $json = json_decode( $html, true );

        if ( !$json )
            throw new ParserException( sprintf( "Could not decode json: %s", Core::jsonError( json_last_error() ) ) );

        $result = new PlaceAlgorithmResultParser();
        $shopsJson = Core::arrayAt( $json, self::$JSON_SHOPS, array () );

        foreach ( $shopsJson as $shopJson )
        {
            $shop = $this->parseGroupPlaceShop( $shopJson );

            if ( $shop )
                $result->getPlaces()->add( $shop );
        }

        return $result;
    }

    /**
     * @param array $shop
     * @return PlaceModel
     */
    private function parseGroupPlaceShop( array $shop )
    {
        $idPlace = Core::arrayAt( $shop, self::$JSON_SHOP_ID );
        $name = Core::arrayAt( $shop, self::$JSON_SHOP_NAME );
        $group = GroupPlaceModel::$TYPE_RIMI;

        $locationLat = Core::arrayAt( $shop, self::$JSON_SHOP_LOCATION_LAT );
        $locationLong = Core::arrayAt( $shop, self::$JSON_SHOP_LOCATION_LONG );

        $info = $this->parseGroupPlaceInfo( $shop );
        $hours = $this->parseGroupPlaceHours( $shop );
        $features = $this->parseGroupPlaceFeatures( $shop );

        $place = PlaceFactoryModel::createPlace( $name, $group, $info, $locationLat, $locationLong, $hours, $features,
                $idPlace );

        return $place;
    }

    /**
     * @param array $shop
     * @return HoursPlaceContainer
     */
    private function parseGroupPlaceHours( array $shop )
    {
        $hours = new HoursPlaceContainer();
        $hoursMondayToFriday = Core::arrayAt( $shop, self::$JSON_SHOP_HOURS_MONDAYFRIDAY );
        $hoursSaturday = Core::arrayAt( $shop, self::$JSON_SHOP_HOURS_SATURDAY );
        $hoursSunday = Core::arrayAt( $shop, self::$JSON_SHOP_HOURS_SUNDAY );

        // REGULAR
        $h = preg_match( self::$REGEX_HOURS, $hoursMondayToFriday, $result ) ? array ( $result[ 1 ],
                $result[ 2 ] ) : HoursPlaceContainer::CLOSED;
        $hours->regular[ HoursPlaceContainer::MONDAY ] = $h;
        $hours->regular[ HoursPlaceContainer::TUESDAY ] = $h;
        $hours->regular[ HoursPlaceContainer::WEDNESDAY ] = $h;
        $hours->regular[ HoursPlaceContainer::THURSDAY ] = $h;
        $hours->regular[ HoursPlaceContainer::FRIDAY ] = $h;

        $h = preg_match( self::$REGEX_HOURS, $hoursSaturday, $result ) ? array ( $result[ 1 ], $result[ 2 ] ) : HoursPlaceContainer::CLOSED;
        $hours->regular[ HoursPlaceContainer::SATURDAY ] = $h;

        $h = preg_match( self::$REGEX_HOURS, $hoursSunday, $result ) ? array ( $result[ 1 ], $result[ 2 ] ) : HoursPlaceContainer::CLOSED;
        $hours->regular[ HoursPlaceContainer::SUNDAY ] = $h;

        return $hours;
    }

    /**
     * @param array $shop
     * @return InfoPlaceContainer
     */
    private function parseGroupPlaceInfo( array $shop )
    {
        $info = new InfoPlaceContainer();

        $info->address = Core::utf8Encode( Core::ucwords( Core::arrayAt( $shop, self::$JSON_SHOP_INFO_ADDRESS ) ) );
        $info->city = Core::utf8Encode( Core::ucwords( Core::arrayAt( $shop, self::$JSON_SHOP_INFO_CITY ) ) );
        $info->county = Core::utf8Encode( Core::ucwords( Core::arrayAt( $shop, self::$JSON_SHOP_INFO_COUNTY ) ) );
        $info->municipal = Core::utf8Encode( Core::ucwords( Core::arrayAt( $shop, self::$JSON_SHOP_INFO_MUNICIPAL ) ) );
        $info->phone = Core::utf8Encode( Core::arrayAt( $shop, self::$JSON_SHOP_INFO_PHONE ) );
        $info->zip = Core::utf8Encode( Core::arrayAt( $shop, self::$JSON_SHOP_INFO_ZIP ) );
        $info->country = "Norge";
        $info->addressFormatted = sprintf( "%s, %s, %s", $info->address, $info->city, $info->country );

        return $info;
    }

    /**
     * @param array $shop
     * @return array
     */
    private function parseGroupPlaceFeatures( array $shop )
    {
        $features = array ();

        if ( preg_match( self::$REGEX_TRUE, Core::arrayAt( $shop, self::$JSON_SHOP_FEATURE_MYPACK ) ) )
            $features[] = FeaturesPlaceUtil::PACKAGE;
        if ( preg_match( self::$REGEX_TRUE, Core::arrayAt( $shop, self::$JSON_SHOP_FEATURE_TIPPING ) ) )
            $features[] = FeaturesPlaceUtil::TIPPING;
        if ( preg_match( self::$REGEX_TRUE, Core::arrayAt( $shop, self::$JSON_SHOP_FEATURE_POST ) ) )
            $features[] = FeaturesPlaceUtil::POST;

        return $features;
    }

    // /FUNCTIONS


}

?>