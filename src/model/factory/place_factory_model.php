<?php

class PlaceFactoryModel extends ClassCore
{

    // VARIABLES


    // /VARIABLES


    // CONSTRUCTOR


    // /CONSTRUCTOR


    // FUNCTIONS


    /**
     * @return PlaceModel
     */
    public static function createPlace( $name, $group, $info, $locationLat, $locationLong, $hours, $features, $idPlace = null )
    {
        $place = new PlaceModel();

        $place->setName( Core::utf8Encode( $name ) );
        $place->setGroup( $group );
        $place->setInfo( new InfoPlaceContainer( $info ) );
        $place->setLocationLat( is_numeric( $locationLat ) ? doubleval( $locationLat ) : null );
        $place->setLocationLong( is_numeric( $locationLong ) ? doubleval( $locationLong ) : null );
        $place->setHours( new HoursPlaceContainer( $hours ) );
        $place->setFeatures( Core::createJsonArray( $features, array() ) );
        $place->setIdPlace( $idPlace );

        return $place;
    }

    // /FUNCTIONS


}

?>