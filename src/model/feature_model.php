<?php

class FeatureModel extends Model implements StandardModel
{

    // VARIABLES


    const TYPE = "type";
    const VALUE = "value";
    const UPDATED = "updated";
    const REGISTERED = "registered";

    public $type;
    public $value;
    private $updated;
    private $registered;

    // /VARIABLES


    // CONSTRUCTOR


    // /CONSTRUCTOR


    // FUNCTIONS


    /**
     * @see StandardModel::getForeignId()
     */
    public function getForeignId()
    {
        return null;
    }

    /**
     * @see StandardModel::getId()
     */
    public function getId()
    {
        return $this->getType();
    }

    /**
     * @see StandardModel::setId()
     */
    public function setId( $id )
    {
        $this->setType( $id );
    }

    public function getType()
    {
        return $this->type;
    }

    public function setType( $type )
    {
        $this->type = $type;
    }

    public function getValue()
    {
        return $this->value;
    }

    public function setValue( $value )
    {
        $this->value = $value;
    }

    public function getUpdated()
    {
        return $this->updated;
    }

    public function setUpdated( $updated )
    {
        $this->updated = $updated;
    }

    public function getRegistered()
    {
        return $this->registered;
    }

    public function setRegistered( $registered )
    {
        $this->registered = $registered;
    }

    /**
     * @see StandardModel::getLastModified()
     */
    public function getLastModified()
    {
        return max( $this->getUpdated(), $this->getRegistered() );
    }

    // ... STATIC


    /**
     * @param FeatureModel $get
     * @return FeatureModel
     */
    public static function get_( $get )
    {
        return parent::get_( $get );
    }

    // ... /STATIC


    // /FUNCTIONS


}

?>