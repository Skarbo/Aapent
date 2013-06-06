<?php

class GroupPlaceModel extends Model implements StandardModel
{

    // VARIABLES


    public static $TYPE_RIMI = "rimi";
    public static $TYPE_KIWI = "kiwi";
    public static $TYPE_MENY = "meny";
    public static $TYPE_JOKER = "joker";
    public static $TYPE_SPAR = "spar";
    public static $TYPE_BUNNPRIS = "bunnpris";
    public static $TYPE_REMA = "rema";

    const ID = "placeGroupId";
    const NAME = "placeGroupName";
    const TYPE = "placeGroupType";
    const INFO = "placeGroupInfo";
    const URLS = "placeGroupUrls";
    const UPDATED = "placeGroupUpdated";
    const REGISTERED = "placeGroupRegistered";

    public static $URL_TYPE_GROUP = "group";
    public static $URL_TYPE_PLACE = "place";
    public static $URL_METHOD = "method";
    public static $URL_METHOD_POST = "POST";
    public static $URL_POST = "post";
    public static $URL_URL = "url";

    public $id;
    public  $name;
    public  $type;
    public  $info;
    private $urls;
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

    public function getId()
    {
        return $this->id;
    }

    public function setId( $placeGroupId )
    {
        $this->id = $placeGroupId;
    }

    public function getPlaceGroupName()
    {
        return $this->name;
    }

    public function setPlaceGroupName( $placeGroupName )
    {
        $this->name = $placeGroupName;
    }

    public function getPlaceGroupInfo()
    {
        return $this->info;
    }

    public function setPlaceGroupInfo( $placeGroupInfo )
    {
        $this->info = $placeGroupInfo;
    }

    public function getPlaceGroupUpdated()
    {
        return $this->updated;
    }

    public function setPlaceGroupUpdated( $placeGroupUpdated )
    {
        $this->updated = $placeGroupUpdated;
    }

    public function getPlaceGroupRegistered()
    {
        return $this->registered;
    }

    public function setPlaceGroupRegistered( $placeGroupRegistered )
    {
        $this->registered = $placeGroupRegistered;
    }

    /**
     * @see StandardModel::getLastModified()
     */
    public function getLastModified()
    {
        return max($this->getPlaceGroupRegistered(), $this->getPlaceGroupUpdated());
    }

    // ... STATIC


    /**
     * @param GroupPlaceModel $get
     * @return GroupPlaceModel
     */
    public static function get_( $get )
    {
        return parent::get_( $get );
    }

    // ... /STATIC


    // /FUNCTIONS


    public function getPlaceGroupType()
    {
        return $this->type;
    }

    public function setPlaceGroupType( $placeGroupType )
    {
        $this->type = $placeGroupType;
    }

    public function getPlaceGroupUrls()
    {
        return $this->urls;
    }

    public function setPlaceGroupUrls( $placeGroupUrls )
    {
        $this->urls = $placeGroupUrls;
    }

}

?>