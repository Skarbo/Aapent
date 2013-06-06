<?php

interface PlaceDao extends StandardDao
{

    // VARIABLES


    const MAX_RADIUS = 10; // km
    const MAX_COUNT = 300;

    // /VARIABLES


    // CONSTRUCTOR


    // /CONSTRUCTOR


    // FUNCTIONS


    /**
     * @param double $lat
     * @param double $long
     * @param integer $radius In km.
     * @param integer $count
     * @return PlaceListModel
     */
    public function getLocation( $lat, $long, $radius = self::MAX_RADIUS, $count = self::MAX_COUNT );

    /**
     * @param string $search
     * @param double $lat
     * @param double $long
     * @param integer $radius In km.
     * @param integer $count
     * @return PlaceListModel
     */
    public function searchLocation( $search, $lat, $long, $radius = self::MAX_RADIUS, $count = self::MAX_COUNT );

    /**
     * @param integer $foreignId
     * @return integer Removed
     */
    public function removeForeign( $foreignId );

    // /FUNCTIONS


}

?>