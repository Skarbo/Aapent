<?php

class GroupPlaceFactoryModel extends ClassCore
{

    // VARIABLES


    // /VARIABLES


    // CONSTRUCTOR


    // /CONSTRUCTOR


    // FUNCTIONS


    /**
     * @return GroupPlaceModel
     */
    public static function createGroupPlace( $name, $type, $info, $urls )
    {

        // Initiate model
        $groupPlace = new GroupPlaceModel();

        $groupPlace->setPlaceGroupName( $name );
        $groupPlace->setPlaceGroupType( $type );
        $groupPlace->setPlaceGroupInfo( Core::createJsonArray( $info ) );
        $groupPlace->setPlaceGroupUrls( Core::createJsonArray( Core::trimWhitespace( $urls ) ) );

        // Return model
        return $groupPlace;

    }

    // /FUNCTIONS


}

?>