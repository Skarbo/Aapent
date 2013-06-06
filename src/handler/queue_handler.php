<?php

class QueueHandler extends Handler
{

    // VARIABLES


    /**
     * @var DaoContainer
     */
    private $daoContainer;

    // /VARIABLES


    // CONSTRUCTOR


    public function __construct( DaoContainer $daoContainer )
    {
        $this->daoContainer = $daoContainer;
    }

    // /CONSTRUCTOR


    // FUNCTIONS


    /**
     * @param QueueModel $queue
     * @return QueueModel
     */
    public function addQueue( QueueModel $queue )
    {
        $queues = $this->daoContainer->getQueueDao()->getAll();

        $queueDuplicate = $this->getQueueDuplicate( $queue, $queues );

        $queueId = null;
        if ( $queueDuplicate )
        {
            $queueMerged = $this->mergeQueue( $queueDuplicate, $queue );

            $this->daoContainer->getQueueDao()->edit( $queueMerged->getId(), $queueMerged, null );

            $queueId = $queueMerged->getId();
        }
        else
        {
            $queueId = $this->daoContainer->getQueueDao()->add( $queue, null );
        }

        return $this->daoContainer->getQueueDao()->get( $queueId );
    }

    /**
     * @return QueueModel
     */
    public function getQueueNext()
    {
        $queues = $this->daoContainer->getQueueDao()->getAll();

        return $queues->get( 0 );
    }

    /**
     * @param QueueModel $queue
     * @param QueueListModel $queues
     * @return QueueModel
     */
    private function getQueueDuplicate( QueueModel $queue, QueueListModel $queues )
    {
        for ( $queues->rewind(); $queues->valid(); $queues->next() )
        {
            $queueTemp = $queues->current();

            if ( $queueTemp->getType() == $queue->getType() && Core::arrayAt( $queue->getArguments(),
                    QueueModel::$ARGUMENT_GROUP_PLACE ) == Core::arrayAt( $queueTemp->getArguments(),
                    QueueModel::$ARGUMENT_GROUP_PLACE ) )
            {
                return $queueTemp;
            }
        }
        return null;
    }

    /**
     * @param QueueModel $queue
     * @param QueueModel $queueMerge
     * @return QueueModel
     */
    private function mergeQueue( QueueModel $queue, QueueModel $queueMerge )
    {
//         $queue->setArguments( array_merge_recursive( $queue->getArguments(), $queueMerge->getArguments() ) );
        $queue->setArguments($queueMerge->getArguments());

        return $queue;
    }

    // /FUNCTIONS


}

?>