<?php

class DaoContainer extends ClassCore
{

    // VARIABLES


    /**
     * @var DbApi
     */
    private $dbApi;

    /**
     * @var PlaceDao
     */
    private $placeDao;
    /**
     * @var GroupPlaceDao
     */
    private $groupPlaceDao;
    /**
     * @var QueueDao
     */
    private $queueDao;
    /**
     * @var FeatureDao
     */
    private $featureDao;

    // /VARIABLES


    // CONSTRUCTOR


    public function __construct( DbApi $dbApi )
    {
        $this->dbApi = $dbApi;

        $this->placeDao = new PlaceDbDao( $dbApi );
        $this->groupPlaceDao = new GroupPlaceDbDao( $dbApi );
        $this->queueDao = new QueueDbDao( $dbApi );
        $this->featureDao = new FeatureDbDao( $dbApi );
    }

    // /CONSTRUCTOR


    // FUNCTIONS


    /**
     * @return DbApi
     */
    public function getDbApi()
    {
        return $this->dbApi;
    }

    /**
     * @return PlaceDao
     */
    public function getPlaceDao()
    {
        return $this->placeDao;
    }

    /**
     * @return GroupPlaceDao
     */
    public function getGroupPlaceDao()
    {
        return $this->groupPlaceDao;
    }

    /**
     * @return QueueDao
     */
    public function getQueueDao()
    {
        return $this->queueDao;
    }

    /**
     * @return FeatureDao
     */
    public function getFeatureDao()
    {
        return $this->featureDao;
    }

    // /FUNCTIONS


}

?>