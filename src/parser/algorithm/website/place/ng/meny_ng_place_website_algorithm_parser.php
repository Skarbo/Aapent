<?php

class MenyNgPlaceWebsiteAlgorithmParser extends NgPlaceWebsiteAlgorithmParser
{

    // VARIABLES


    private static $REGEX_HOURS_WEEKDAYS = '/Hverdager/i';
    private static $REGEX_HOURS_STAURDAY = '/L&#248;rdag/i';
    private static $REGEX_HOURS_SUNDAY = '/S&#248;ndag/i';
    private static $REGEX_HOURS_HOURS = '/(\d{2}:\d{2}).?-.?(\d{2}:\d{2})/i';
    private static $REGEX_HOURS_CLOSED = '/stengt/i';

    private static $HTML_REGEX_HOURS = '/pningstider.+?<p>(.+?)<\/p>/ims';
    private static $HTML_REGEX_HOURS_GROUP = '/(.+?)\:(.+?)<br \/>/ims';
    private static $HTML_REGEX_INFO_PHONE = '/Telefon:.+?<a.+?>(\d+)<\/a>/ims';
    private static $HTML_REGEX_INFO_EMAIL = '/Epost:.+?<a.+?>(.+?)<\/a>/ims';

    // <p>Hverdager:&nbsp;10:00 - 21:00<br />L&#248;rdag:&nbsp;09:00 - 18:00<br /> S&#248;ndag:&nbsp;stengt<br /> </p>


    // /VARIABLES


    // CONSTRUCTOR


    // /CONSTRUCTOR


    // FUNCTIONS


    /**
     * @see NgPlaceWebsiteAlgorithmParser::getPlaceType()
     */
    protected function getPlaceType()
    {
        return GroupPlaceModel::$TYPE_MENY;
    }

    /**
     * @see PlaceWebsiteAlgorithmParser::isAddSinglePlaceToQueue()
     */
    public function isAddSinglePlaceToQueue()
    {
        return true;
    }

    /**
     * @see PlaceWebsiteAlgorithmParser::getSinglePlaceUrl()
     */
    public function getSinglePlaceUrl( PlaceModel $place, $url )
    {
        return sprintf( $url,
                str_replace( array ( " ", "æ", "ø", "å", "Æ", "Ø", "Å" ), array ( "-", "a", "o", "a", "A", "O", "A" ),
                        $place->getName() ) );
    }

    // ... PLACE


    /**
     * @see PlaceWebsiteAlgorithmParser::parsePlace()
     */
    public function parsePlace( $html )
    {
        if ( !$this->place )
            throw new ParserException( "Place not set" );

            // Hours
        if ( preg_match( self::$HTML_REGEX_HOURS, $html, $hoursMatches ) )
        {

            if ( preg_match_all( self::$HTML_REGEX_HOURS_GROUP, Core::trimWhitespace( $hoursMatches[ 1 ] ),
                    $hoursGroupMatches ) )
            {
                $hours = new HoursPlaceContainer();

                for ( $i = 0; $i < count( $hoursGroupMatches ); $i++ )
                {
                    $time = null;
                    if ( preg_match( self::$REGEX_HOURS_HOURS, $hoursGroupMatches[ 2 ][ $i ], $hourMatch ) )
                        $time = array ( $hourMatch[ 1 ], $hourMatch[ 2 ] );
                    else if ( preg_match( self::$REGEX_HOURS_CLOSED, $hoursGroupMatches[ 2 ][ $i ] ) )
                        $time = HoursPlaceContainer::CLOSED;

                    if ( preg_match( self::$REGEX_HOURS_WEEKDAYS, $hoursGroupMatches[ 1 ][ $i ] ) && $time )
                    {
                        $hours->regular[ HoursPlaceContainer::MONDAY ] = $time;
                        $hours->regular[ HoursPlaceContainer::TUESDAY ] = $time;
                        $hours->regular[ HoursPlaceContainer::WEDNESDAY ] = $time;
                        $hours->regular[ HoursPlaceContainer::THURSDAY ] = $time;
                        $hours->regular[ HoursPlaceContainer::FRIDAY ] = $time;
                    }
                    else if ( preg_match( self::$REGEX_HOURS_STAURDAY, $hoursGroupMatches[ 1 ][ $i ] ) && $time )
                        $hours->regular[ HoursPlaceContainer::SATURDAY ] = $time;
                    else if ( preg_match( self::$REGEX_HOURS_SUNDAY, $hoursGroupMatches[ 1 ][ $i ] ) && $time )
                        $hours->regular[ HoursPlaceContainer::SUNDAY ] = $time;
                }

                $this->place->setHours( $hours );
            }
        }

        // Info
        if ( preg_match( self::$HTML_REGEX_INFO_EMAIL, $html, $infoEmail ) )
            $this->place->info->email = Core::trimWhitespace( $infoEmail[ 1 ] );
        if ( preg_match( self::$HTML_REGEX_INFO_PHONE, $html, $infoPhone ) )
            $this->place->info->phone = Core::trimWhitespace( $infoPhone[ 1 ] );

        $result = new PlaceAlgorithmResultParser();
        $result->getPlaces()->add( $this->place );

        return $result;
    }

    // ... /PLACE


    // /FUNCTIONS


}

?>