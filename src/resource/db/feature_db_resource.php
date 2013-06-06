<?php

class FeatureDbResource
{

    // VARIABLES


    private $table = "feature";

    private $fieldType = "feature_type";
    private $fieldValue = "feature_value";
    private $fieldUpdated = "feature_updated";
    private $fieldRegistered = "feature_registered";

    // /VARIABLES


    // CONSTRUCTOR


    // /CONSTRUCTOR


    // FUNCTIONS

	public function getTable()
    {
        return Core::constant( "DB_PREFIX" ) . $this->table;
    }

    public function getFieldType()
    {
        return $this->fieldType;
    }

    public function getFieldValue()
    {
        return $this->fieldValue;
    }

    public function getFieldUpdated()
    {
        return $this->fieldUpdated;
    }

    public function getFieldRegistered()
    {
        return $this->fieldRegistered;
    }


    // /FUNCTIONS


}

?>