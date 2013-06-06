<?php

class GroupPlaceDbResource
{

    // VARIABLES


    private $table = "place_group";

    private $fieldPlaceGroupId = "place_group_id";
    private $fieldPlaceGroupName = "place_group_name";
    private $fieldPlaceGroupType = "place_group_type";
    private $fieldPlaceGroupInfo = "place_group_info";
    private $fieldPlaceGroupUrls = "place_group_urls";
    private $fieldPlaceGroupUpdated = "place_group_updated";
    private $fieldPlaceGroupRegistered = "place_group_registered";

    // /VARIABLES


    // CONSTRUCTOR


    // /CONSTRUCTOR


    // FUNCTIONS


    public function getTable()
    {
        return Core::constant( "DB_PREFIX" ) . $this->table;
    }

    public function getFieldPlaceGroupId()
    {
        return $this->fieldPlaceGroupId;
    }

    public function getFieldPlaceGroupName()
    {
        return $this->fieldPlaceGroupName;
    }

    public function getFieldPlaceGroupInfo()
    {
        return $this->fieldPlaceGroupInfo;
    }

    public function getFieldPlaceGroupUpdated()
    {
        return $this->fieldPlaceGroupUpdated;
    }

    public function getFieldPlaceGroupRegistered()
    {
        return $this->fieldPlaceGroupRegistered;
    }

    // /FUNCTIONS


    public function getFieldPlaceGroupType()
    {
        return $this->fieldPlaceGroupType;
    }

    public function getFieldPlaceGroupUrls()
    {
        return $this->fieldPlaceGroupUrls;
    }

}

?>