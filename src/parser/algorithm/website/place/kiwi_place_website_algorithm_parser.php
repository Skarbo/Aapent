<?php

class KiwiPlaceWebsiteAlgorithmParser extends PlaceWebsiteAlgorithmParser
{

    // VARIABLES


    private static $JSON_PLACE = "store";
    private static $JSON_PLACE_ID = "id";
    private static $JSON_PLACE_NAME = "name";
    private static $JSON_PLACE_INFO_LINK = "link";
    private static $JSON_PLACE_INFO_ZIP = "zipcode";
    private static $JSON_PLACE_INFO_ZIPCITY = "zipcitycode";
    private static $JSON_PLACE_INFO_VISITADDRESS = "visitaddress";
    private static $JSON_PLACE_INFO_PHONE = "phone";
    private static $JSON_PLACE_INFO_EMAIL = "email";
    private static $JSON_PLACE_LOCATION = "location";
    private static $JSON_PLACE_LOCATION_LAT = "latitude";
    private static $JSON_PLACE_LOCATION_LONG = "longitude";
    private static $JSON_PLACE_SERVICES = "services";
    private static $JSON_PLACE_HOURS = "openinghours";
    private static $JSON_PLACE_HOURS_DAYS = "days";
    private static $JSON_PLACE_HOURS_DAYS_LABEL = "label";
    private static $JSON_PLACE_HOURS_DAYS_FROM = "from";
    private static $JSON_PLACE_HOURS_DAYS_TO = "to";

    private static $HOURS_DAYS_LABEL_WEEKDAYS = "Hverdager";
    private static $HOURS_DAYS_LABEL_SATURDAY = "Lørdag";
    private static $HOURS_DAYS_LABEL_SUNDAY = "Søndag";

    private static $REGEX_FEATURES_BANK = '/BIB FULL/i';
    private static $REGEX_FEATURES_TIPPING = '/TIPPING/i';

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
            throw new ParserException( sprintf( "Could not decode json: %s", Core::jsonError( json_last_error() ) ) );

        $result = new PlaceAlgorithmResultParser();

        foreach ( $json as $placeJson )
        {
            $place = $this->parseGroupPlacePlace( Core::arrayAt( $placeJson, self::$JSON_PLACE ) );

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
        $idPlace = number_format( Core::arrayAt( $place, self::$JSON_PLACE_ID ), 0, '.', '' );
        $name = Core::arrayAt( $place, self::$JSON_PLACE_NAME );
        $group = GroupPlaceModel::$TYPE_KIWI;

        $locationLat = Core::arrayAt( Core::arrayAt( $place, self::$JSON_PLACE_LOCATION, array () ),
                self::$JSON_PLACE_LOCATION_LAT );
        $locationLong = Core::arrayAt( Core::arrayAt( $place, self::$JSON_PLACE_LOCATION, array () ),
                self::$JSON_PLACE_LOCATION_LONG );

        $info = $this->parseGroupPlaceInfo( $place );
        $hours = $this->parseGroupPlaceHours( $place );
        $features = $this->parseGroupPlaceFeatures( $place );

        $place = PlaceFactoryModel::createPlace( $name, $group, $info, $locationLat, $locationLong, $hours, $features,
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

        $info->email = Core::utf8Encode( Core::arrayAt( $place, self::$JSON_PLACE_INFO_EMAIL ) );
        $info->link = Core::utf8Encode( Core::arrayAt( $place, self::$JSON_PLACE_INFO_LINK ) );
        $info->phone = Core::arrayAt( $place, self::$JSON_PLACE_INFO_PHONE );
        $info->address = Core::utf8Encode(
                Core::ucwords( Core::arrayAt( $place, self::$JSON_PLACE_INFO_VISITADDRESS ) ) );
        $info->zip = Core::utf8Encode( Core::arrayAt( $place, self::$JSON_PLACE_INFO_ZIP ) );
        $info->city = Core::utf8Encode( Core::ucwords( Core::arrayAt( $place, self::$JSON_PLACE_INFO_ZIPCITY ) ) );
        $info->country = "Norge";
        $info->addressFormatted = sprintf("%s, %s, %s", $info->address, $info->city, $info->country);

        return $info;
    }

    /**
     * @param array $place
     * @return HoursPlaceContainer
     */
    private function parseGroupPlaceHours( array $place )
    {
        $hours = new HoursPlaceContainer();

        $hoursDays = Core::arrayAt( $place, self::$JSON_PLACE_HOURS, array () );

        // REGULAR
        $days = Core::arrayAt( $hoursDays, self::$JSON_PLACE_HOURS_DAYS );
        foreach ( $days as $day )
        {
            $from = Core::arrayAt( $day, self::$JSON_PLACE_HOURS_DAYS_FROM );
            $to = Core::arrayAt( $day, self::$JSON_PLACE_HOURS_DAYS_TO );
            $h = array ( $from, $to );

            if ( !$from || !$to )
                $h = HoursPlaceContainer::CLOSED;

            switch ( Core::arrayAt( $day, self::$JSON_PLACE_HOURS_DAYS_LABEL ) )
            {
                case self::$HOURS_DAYS_LABEL_WEEKDAYS :
                    $hours->regular[ HoursPlaceContainer::MONDAY ] = $h;
                    $hours->regular[ HoursPlaceContainer::TUESDAY ] = $h;
                    $hours->regular[ HoursPlaceContainer::WEDNESDAY ] = $h;
                    $hours->regular[ HoursPlaceContainer::THURSDAY ] = $h;
                    $hours->regular[ HoursPlaceContainer::FRIDAY ] = $h;
                    break;
                case self::$HOURS_DAYS_LABEL_SATURDAY :
                    $hours->regular[ HoursPlaceContainer::SATURDAY ] = $h;
                    break;
                case self::$HOURS_DAYS_LABEL_SUNDAY :
                    $hours->regular[ HoursPlaceContainer::SUNDAY ] = $h;
                    break;
            }
        }

        return $hours;
    }

    /**
     * @param array $place
     * @return array
     */
    private function parseGroupPlaceFeatures( array $place )
    {
        $features = array ();

        $services = Core::arrayAt( $place, self::$JSON_PLACE_SERVICES );
        if ( preg_match( self::$REGEX_FEATURES_BANK, $services ) )
            $features[] = FeaturesPlaceUtil::BANK;
        if ( preg_match( self::$REGEX_FEATURES_TIPPING, $services ) )
            $features[] = FeaturesPlaceUtil::TIPPING;

        return $features;
    }

    // /FUNCTIONS


}

?>