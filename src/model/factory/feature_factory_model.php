<?php

class FeatureFactoryModel extends ClassCore
{

    // VARIABLES

    const TYPE_SPECIALDAYS = "specialdays";

    // /VARIABLES


    // CONSTRUCTOR


    // /CONSTRUCTOR


    // FUNCTIONS


    /**
     * @return FeatureModel
     */
    public static function createFeature( $type, $value )
    {

        // Initiate model
        $feature = new FeatureModel();

        $feature->setType( $type );
        $feature->setValue( Core::createJsonArray( Core::utf8Encode( Core::trimWhitespace( $value ) ) ) );

        // Return model
        return $feature;

    }

    // /FUNCTIONS


}

?>