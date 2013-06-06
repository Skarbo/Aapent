<?php

class FeatureListModel extends StandardListModel
{

    // VARIABLES


    // /VARIABLES


    // CONSTRUCTOR


    // /CONSTRUCTOR


    // FUNCTIONS


    /**
     * @see IteratorCore::get()
     * @return FeatureModel
     */
    public function get( $i )
    {
        return parent::get( $i );
    }

    /**
     * @see IteratorCore::add()
     * @return FeatureModel
     */
    public function add( $add )
    {
        parent::add( $add );
    }

    /**
     * @see IteratorCore::current()
     * @return FeatureModel
     */
    public function current()
    {
        return parent::current();
    }

    // ... STATIC


    /**
     * @param FeatureListModel $get
     * @return FeatureListModel
     */
    public static function get_( $get )
    {
        return $get;
    }

    // ... /STATIC


// /FUNCTIONS


}

?>