<?php

class PlaceDbResource
{

    // VARIABLES


    private $table = "place";

    private $fieldId = "place_id";
    private $fieldIdPlace = "place_id_place";
    private $fieldName = "place_name";
    private $fieldInfo = "place_info";
    private $fieldLocationLat = "place_location_lat";
    private $fieldLocationLong = "place_location_long";
    private $fieldHours = "place_hours";
    private $fieldFeatures = "place_features";
    private $fieldUpdated = "place_updated";
    private $fieldRegistered = "place_registered";
    private $fieldGroup = "place_group";

    private $fieldAliasDistance = "place_distance";

    // /VARIABLES


    // CONSTRUCTOR


    // /CONSTRUCTOR


    // FUNCTIONS


    public function getTable()
    {
        return Core::constant( "DB_PREFIX" ) . $this->table;
    }

    public function getFieldId()
    {
        return $this->fieldId;
    }

    public function getFieldName()
    {
        return $this->fieldName;
    }

    public function getFieldInfo()
    {
        return $this->fieldInfo;
    }

    public function getFieldLocationLat()
    {
        return $this->fieldLocationLat;
    }

    public function getFieldLocationLong()
    {
        return $this->fieldLocationLong;
    }

    public function getFieldHours()
    {
        return $this->fieldHours;
    }

    public function getFieldFeatures()
    {
        return $this->fieldFeatures;
    }

    public function getFieldUpdated()
    {
        return $this->fieldUpdated;
    }

    public function getFieldRegistered()
    {
        return $this->fieldRegistered;
    }

    public function getFieldGroup()
    {
        return $this->fieldGroup;
    }

    // /FUNCTIONS


    public function getFieldIdPlace()
    {
        return $this->fieldIdPlace;
    }

    /**
     * @return string
     */
    public function getFieldAliasDistance()
    {
        return $this->fieldAliasDistance;
    }

}

?>