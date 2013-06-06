<?php

class PlaceListModel extends StandardListModel
{

    // VARIABLES


    // /VARIABLES


    // CONSTRUCTOR


    // /CONSTRUCTOR


    // FUNCTIONS


    /**
     * @see IteratorCore::get()
     * @return PlaceModel
     */
    public function get( $i )
    {
        return parent::get( $i );
    }

    /**
     * @see IteratorCore::add()
     * @return PlaceModel
     */
    public function add( $add )
    {
        parent::add( $add );
    }

    /**
     * @see IteratorCore::current()
     * @return PlaceModel
     */
    public function current()
    {
        return parent::current();
    }

    // ... STATIC


    /**
     * @param PlaceListModel $get
     * @return PlaceListModel
     */
    public static function get_( $get )
    {
        return $get;
    }

    // ... /STATIC


// /FUNCTIONS


}

?>