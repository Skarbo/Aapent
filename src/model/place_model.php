<?php

class PlaceModel extends Model implements StandardModel
{

    // VARIABLES


    const ID = "id";
    const NAME = "name";
    const INFO = "info";
    const LOCATIONLAT = "locationLat";
    const LOCATIONLONG = "locationLong";
    const HOURS = "hours";
    const FEATURES = "features";
    const UPDATED = "updated";
    const REGISTERED = "registered";
    const GROUP = "group";

    const INFO_ADDRESS = "address";
    const INFO_CITY = "city";
    const INFO_ZIP = "zip";
    const INFO_PHONE = "phone";
    const INFO_COUNTY = "county";

    public $id;
    public $idPlace;
    public $group;
    public $name;
    public $info;
    public $locationLat;
    public $locationLong;
    public $hours;
    public $features = array ();
    public $distance;
    private $updated;
    private $registered;

    // /VARIABLES


    // CONSTRUCTOR


    public function __construct( $a = array() )
    {
        parent::__construct( $a );

        $this->info = new InfoPlaceContainer( Core::arrayAt( $a, self::INFO, array () ) );
        $this->hours = new HoursPlaceContainer( Core::arrayAt( $a, self::HOURS, array () ) );
    }

    // /CONSTRUCTOR


    // FUNCTIONS


    /**
     * @see StandardModel::getForeignId()
     */
    public function getForeignId()
    {
        return $this->getGroup();
    }

    public function getId()
    {
        return $this->id;
    }

    public function setId( $id )
    {
        $this->id = $id;
    }

    public function getName()
    {
        return $this->name;
    }

    public function setName( $name )
    {
        $this->name = $name;
    }

    /**
     * @return InfoPlaceContainer
     */
    public function getInfo()
    {
        return $this->info;
    }

    /**
     * @param InfoPlaceContainer $info
     */
    public function setInfo( InfoPlaceContainer $info )
    {
        $this->info = $info;
    }

    public function getLocationLat()
    {
        return $this->locationLat;
    }

    public function setLocationLat( $locationLat )
    {
        $this->locationLat = $locationLat;
    }

    public function getLocationLong()
    {
        return $this->locationLong;
    }

    public function setLocationLong( $locationLong )
    {
        $this->locationLong = $locationLong;
    }

    /**
     * @return HoursPlaceContainer
     */
    public function getHours()
    {
        return $this->hours;
    }

    /**
     * @param HoursPlaceContainer $hours
     */
    public function setHours( HoursPlaceContainer $hours )
    {
        $this->hours = $hours;
    }

    public function getFeatures()
    {
        return $this->features;
    }

    public function setFeatures( $features )
    {
        $this->features = $features;
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

    public function getGroup()
    {
        return $this->group;
    }

    public function setGroup( $group )
    {
        $this->group = $group;
    }

    /**
     * @see StandardModel::getLastModified()
     */
    public function getLastModified()
    {
        return null;
    }

    // ... STATIC


    /**
     * @param PlaceModel $get
     * @return PlaceModel
     */
    public static function get_( $get )
    {
        return parent::get_( $get );
    }

    // ... /STATIC


    // /FUNCTIONS


    public function getIdPlace()
    {
        return $this->idPlace;
    }

    public function setIdPlace( $idPlace )
    {
        $this->idPlace = $idPlace;
    }

    /**
     * @return field_type
     */
    public function getDistance()
    {
        return $this->distance;
    }

    /**
     * @param field_type $distance
     */
    public function setDistance( $distance )
    {
        $this->distance = $distance;
    }

}

?>