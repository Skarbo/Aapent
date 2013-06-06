<?php

class BunnprisPlaceWebsiteAlgorithmParser extends PlaceWebsiteAlgorithmParser
{

    // VARIABLES


    private static $JSON_PLACE_ID = "ID";
    private static $JSON_PLACE_NAME = "Title";
    private static $JSON_PLACE_INFO_ZIP = "PostCode";
    private static $JSON_PLACE_INFO_CITY = "City";
    private static $JSON_PLACE_INFO_ADDRESS = "Address";
    private static $JSON_PLACE_INFO_PHONE = "Phone";
    private static $JSON_PLACE_INFO_EMAIL = "Email";
    private static $JSON_PLACE_LOCATION_LAT = "PosLat";
    private static $JSON_PLACE_LOCATION_LONG = "PosLng";
    private static $JSON_PLACE_HOURS = "OpeningFormatted";
    private static $JSON_FEATURE_TIPPING = "Tipping";
    private static $JSON_FEATURE_POST = "Post";
    private static $JSON_FEATURE_RIKSTOTO = "Rikstoto";
    private static $JSON_PLACE_HOURS_SPECIALDAYS = array ( FeatureUtil::MAY_17 => "mai17",
            FeatureUtil::CHRISTMAS_1 => "jul1", FeatureUtil::CHRISTMAS_2 => "jul2" );

    private static $REGEX_PARSE_JSON = '/var departmentsData = (\[.+?\])\;top\.loadData/ims';
    private static $REGEX_HOURS_ROW = '/<tr>.+?<td>(.+?)<\/td>.+?<td>(.+?)<\/td>.+?<\/tr>/ims';
    private static $REGEX_HOURS_MON_FRI = '/Mandag.+?fredag/i';
    private static $REGEX_HOURS_SAT = '/L&oslash;rdag/i';
    private static $REGEX_HOURS_SUN = '/S&oslash;ndag/i';
    private static $REGEX_HOURS_CLOSED = '/stengt/i';
    private static $REGEX_HOURS_HOURS = '/(\d{1,2}).?-.?(\d{1,2})/i';

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

        $start = strpos( $html, "var departmentsData = " ) + strlen( "var departmentsData = " );
        $end = strrpos( $html, ";top.loadData(departmentsData);//]]>" );
        $html = substr( $html, $start, $end - $start );
        $html = Core::trimWhitespace( $html );

        $json = json_decode( $html, true );

        if ( !$json )
            throw new ParserException(
                    sprintf( "Could not decode json: %s (%d)", Core::jsonError( json_last_error() ), json_last_error() ) );

        $result = new PlaceAlgorithmResultParser();

        foreach ( $json as $placeJson )
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
        $idPlace = number_format( Core::arrayAt( $place, self::$JSON_PLACE_ID ), 0, '.', '' );
        $name = Core::arrayAt( $place, self::$JSON_PLACE_NAME );
        $group = GroupPlaceModel::$TYPE_BUNNPRIS;

        $locationLat = Core::arrayAt( $place, self::$JSON_PLACE_LOCATION_LAT, array () );
        $locationLong = Core::arrayAt( $place, self::$JSON_PLACE_LOCATION_LONG, array () );
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

        $info->email = Core::parseUnicode( Core::utf8Encode( Core::arrayAt( $place, self::$JSON_PLACE_INFO_EMAIL ) ) );
        $info->phone = Core::parseUnicode( Core::arrayAt( $place, self::$JSON_PLACE_INFO_PHONE ) );
        $info->address = Core::parseUnicode(
                Core::utf8Encode( Core::ucwords( Core::arrayAt( $place, self::$JSON_PLACE_INFO_ADDRESS ) ) ) );
        $info->zip = Core::parseUnicode( Core::utf8Encode( Core::arrayAt( $place, self::$JSON_PLACE_INFO_ZIP ) ) );
        $info->city = Core::parseUnicode(
                Core::utf8Encode( Core::ucwords( Core::arrayAt( $place, self::$JSON_PLACE_INFO_CITY ) ) ) );
        $info->country = "Norge";
        $info->addressFormatted = sprintf( "%s, %s, %s", $info->address, $info->city, $info->country );

        return $info;
    }

    /**
     * @param array $place
     * @return HoursPlaceContainer
     */
    private function parseGroupPlaceHours( array $place )
    {
        $hours = new HoursPlaceContainer();

        $hoursStr = Core::parseUnicode( Core::utf8Encode( Core::arrayAt( $place, self::$JSON_PLACE_HOURS ) ) );

        // REGULAR


        if ( ( $count = preg_match_all( self::$REGEX_HOURS_ROW, $hoursStr, $matches ) ) )
        {
            for ( $i = 0; $i < $count; $i++ )
            {
                $time = null;
                if ( preg_match( self::$REGEX_HOURS_HOURS, $matches[ 2 ][ $i ], $hourMatch ) )
                    $time = array ( $hourMatch[ 1 ] . ":00", $hourMatch[ 2 ] . ":00" );
                else if ( preg_match( self::$REGEX_HOURS_CLOSED, $matches[ 2 ][ $i ] ) )
                    $time = HoursPlaceContainer::CLOSED;

                if ( preg_match( self::$REGEX_HOURS_MON_FRI, $matches[ 1 ][ $i ] ) && $time )
                {
                    $hours->regular[ HoursPlaceContainer::MONDAY ] = $time;
                    $hours->regular[ HoursPlaceContainer::TUESDAY ] = $time;
                    $hours->regular[ HoursPlaceContainer::WEDNESDAY ] = $time;
                    $hours->regular[ HoursPlaceContainer::THURSDAY ] = $time;
                    $hours->regular[ HoursPlaceContainer::FRIDAY ] = $time;
                }
                else if ( preg_match( self::$REGEX_HOURS_SAT, $matches[ 1 ][ $i ] ) && $time )
                    $hours->regular[ HoursPlaceContainer::SATURDAY ] = $time;
                else if ( preg_match( self::$REGEX_HOURS_SUN, $matches[ 1 ][ $i ] ) && $time )
                    $hours->regular[ HoursPlaceContainer::SUNDAY ] = $time;
            }
        }

        // /REGULAR


        // SPECIALDAYS


        foreach ( self::$JSON_PLACE_HOURS_SPECIALDAYS as $specialdayConst => $specialdayKey )
        {
            if ( ( $speceialdayValue = Core::arrayAt( $place, $specialdayKey, null ) ) !== null )
            {
                $specialday = FeatureUtil::getSpecialDay( $specialdayConst );
                $hours->specialdays[ strval( $specialday ) ] = $speceialdayValue ? strtolower( date( "D", $specialday ) ) : HoursPlaceContainer::CLOSED;
            }
        }

        // /SPECIALDAYS


        return $hours;
    }

    /**
     * @param array $place
     * @return array
     */
    private function parseGroupPlaceFeatures( array $place )
    {
        $features = array ();

        if ( Core::arrayAt( self::$JSON_FEATURE_POST, $place ) )
            $features[] = FeaturesPlaceUtil::POST;
        if ( Core::arrayAt( self::$JSON_FEATURE_RIKSTOTO, $place ) )
            $features[] = FeaturesPlaceUtil::POST;
        if ( Core::arrayAt( self::$JSON_FEATURE_RIKSTOTO, $place ) )
            $features[] = FeaturesPlaceUtil::RIKSTOTTO;

        return $features;
    }

    // /FUNCTIONS


}

?>