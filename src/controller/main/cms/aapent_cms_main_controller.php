<?php

class AapentCmsMainController extends CmsMainController
{

    // VARIABLES


    public static $CONTROLLER_NAME = "aapent";

    /**
     * @var QueueHandler
     */
    private $queueHandler;
    /**
     * @var GroupPlaceListModel
     */
    private $placeGroups;
    /**
     * @var QueueListModel
     */
    private $queues;

    // /VARIABLES


    // CONSTRUCTOR


    /**
     * @see MainController::__construct()
     */
    public function __construct( Api $api, View $view )
    {
        parent::__construct( $api, $view );

        $this->queueHandler = new QueueHandler( $this->getDaoContainer() );
        $this->placeGroups = new GroupPlaceListModel();
        $this->queues = new QueueListModel();
    }

    // /CONSTRUCTOR


    // FUNCTIONS


    /**
     * @return GroupPlaceListModel
     */
    public function getPlaceGroups()
    {
        return $this->placeGroups;
    }

    /**
     * @return QueuesListModel
     */
    public function getQueues()
    {
        return $this->queues;
    }

    /**
     * @see AbstractController::request()
     */
    public function request()
    {
        $this->placeGroups = $this->getDaoContainer()->getGroupPlaceDao()->getAll();
        $this->queues = $this->getDaoContainer()->getQueueDao()->getAll();

        // Add queue
        if ( Core::arrayAt( self::getQuery(), "addqueue" ) )
        {
            $queue = QueueFactoryModel::createQueue( QueueModel::TYPE_GROUP_PLACE, QueueModel::PRIORITY_MEDIUM,
                    array ( QueueModel::$ARGUMENT_GROUP_PLACE => Core::arrayAt( self::getPost(), "group_place_id" ) ) );

            $result = $this->queueHandler->addQueue( $queue );

            if ( $result )
                self::redirect( "?" );
        }

        // Execute queue
        if ( Core::arrayAt( self::getQuery(), "executequeue" ) )
        {
            $queue = $this->queueHandler->getQueueNext();

            if ( $queue )
                $this->handleQueue( $queue );
            self::redirect( "?" );
        }

        // Delete queue
        if ( Core::arrayAt( self::getQuery(), "deletequeue" ) )
        {
            $result = $this->getDaoContainer()->getQueueDao()->remove(
                    Core::arrayAt( self::getQuery(), "deletequeue" ) );

            if ( $result )
                self::redirect( "?" );
        }
    }

    private function handleQueue( QueueModel $queue )
    {
        $placeWebsiteHandler = new PlaceWebsiteHandler( $this->getDaoContainer() );

        // Queue: Group Place
        if ( $queue->getType() == QueueModel::TYPE_GROUP_PLACE )
        {
            $placeGroup = $this->getDaoContainer()->getGroupPlaceDao()->get(
                    Core::arrayAt( $queue->getArguments(), QueueModel::$ARGUMENT_GROUP_PLACE ) );

            if ( !$placeGroup )
            {
                self::redirect( "?&fail=Place Group does not exist" );
                return;
            }

            $placeResult = $placeWebsiteHandler->handleGroup( $placeGroup );

            if ( $placeResult )
            {
                $this->getDaoContainer()->getQueueDao()->remove( $queue->getId() );
                self::redirect( "?&success=Place Group parsed" );
            }
            else
                self::redirect( "?&fail=Error while parsing website" );
        }
        // Queue: Place
        else if ( $queue->getType() == QueueModel::TYPE_PLACE )
        {
            $arguments = $queue->getArguments();
            $placeGroup = $this->getDaoContainer()->getGroupPlaceDao()->get(
                    Core::arrayAt( $arguments, QueueModel::$ARGUMENT_GROUP_PLACE ) );
            $placeIds = Core::arrayAt( $arguments, QueueModel::$ARGUMENT_PLACE );

            if ( !$placeGroup )
            {
                self::redirect( "?&fail=Place Group does not exist" );
                return;
            }

            $placeResult = $placeWebsiteHandler->handlePlaces( $placeGroup, $placeIds );

            if ( $placeResult )
            {
                $placeIds = array_merge(array(), array_diff( $placeIds, $placeResult->getPlaces()->getIds() ) );
                if ( empty( $placeIds ) )
                {
                    $this->getDaoContainer()->getQueueDao()->remove( $queue->getId() );
                }
                else
                {
                    $arguments[ QueueModel::$ARGUMENT_PLACE ] = $placeIds;
                    $queue->setArguments( $arguments );
                    $this->queueHandler->addQueue( $queue );
                }

                self::redirect( "?&success=Places parsed" );
            }
            else
                self::redirect( "?&fail=Error while parsing website" );
        }

    }

    /*
     * $api = new AapentApi( AbstractApi::MODE_TEST );
$api->setDebug( array ( AbstractApi::MODE_TEST => DebugHandler::LEVEL_LOW ) );
$api->setKillHandler( new CmsKillHandler() );

$isDbSave = Core::arrayAt( $_GET, "dbSave" );
$daoContainer = new DaoContainer( $api->getDbApi() );

$placeGroups = GroupPlaceListModel::get_( $daoContainer->getGroupPlaceDao()->getAll() );
$placeWebsiteHandler = new PlaceWebsiteHandler( $daoContainer );

if ( $isDbSave )
    $daoContainer->getPlaceDao()->removeAll();

for ( $placeGroups->rewind(); $placeGroups->valid(); $placeGroups->next() )
{
    $placeGroup = $placeGroups->current();
    $placeResult = $placeWebsiteHandler->handle( $placeGroup );

    echo sprintf( "Place group: %s, Places: %d<br />", $placeGroup->getPlaceGroupName(),
            $placeResult->getPlaces()->size() );

    if ( $isDbSave )
    {
        for ( $placeResult->getPlaces()->rewind(); $placeResult->getPlaces()->valid(); $placeResult->getPlaces()->next() )
        {
            $place = $placeResult->getPlaces()->current();
            $daoContainer->getPlaceDao()->add( $place, $placeGroup->getId() );
        }
    }
}
     */

    // /FUNCTIONS


}

?>