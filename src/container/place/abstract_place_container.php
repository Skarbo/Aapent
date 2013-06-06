<?php

abstract class AbstractPlaceContainer extends ClassCore
{

    // VARIABLES


    // /VARIABLES


    // CONSTRUCTOR


    public function __construct( $arg = null )
    {
        $vars = is_array( $arg ) ? $arg : ( is_object( $arg ) ? get_object_vars( $arg ) : Core::createJsonArray( $arg,
                array () ) );

        foreach ( $vars as $key => $value )
        {
            $this->$key = $value;
        }
    }

    // /CONSTRUCTOR


    // FUNCTIONS


    // /FUNCTIONS


}