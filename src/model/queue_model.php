<?php

class QueueModel extends Model implements StandardModel
{

    // VARIABLES


    const ID = "id";
    const TYPE = "type";
    const PRIORITY = "priority";
    const ARGUMENTS = "arguments";
    const OCCURENCE = "occurence";
    const ERROR = "error";
    const UPDATED = "updated";
    const REGISTERED = "registered";

    const PRIORITY_LOW = 0;
    const PRIORITY_MEDIUM = 1;
    const PRIORITY_HIGH = 2;

    public static $PRIORITIES = array ( self::PRIORITY_LOW, self::PRIORITY_MEDIUM, self::PRIORITY_HIGH );

    const TYPE_GROUP_PLACE = "group_place";
    const TYPE_PLACE = "place";

    public static $TYPES = array ( self::TYPE_GROUP_PLACE, self::TYPE_PLACE );

    public static $ARGUMENT_GROUP_PLACE = "group_place";
    public static $ARGUMENT_PLACE = "places";

    private $id;
    private $type;
    private $priority;
    private $arguments = array ();
    private $occurence;
    private $error;
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

    public function setId( $id )
    {
        $this->id = $id;
    }

    public function getType()
    {
        return $this->type;
    }

    public function setType( $type )
    {
        $this->type = $type;
    }

    public function getPriority()
    {
        return $this->priority;
    }

    public function setPriority( $priority )
    {
        $this->priority = $priority;
    }

    public function getArguments()
    {
        return $this->arguments;
    }

    public function setArguments( $arguments )
    {
        $this->arguments = $arguments;
    }

    public function getOccurence()
    {
        return $this->occurence;
    }

    public function setOccurence( $occurence )
    {
        $this->occurence = $occurence;
    }

    public function getError()
    {
        return $this->error;
    }

    public function setError( $error )
    {
        $this->error = $error;
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
        return null;
    }

    // ... STATIC


    /**
     * @param QueueModel $get
     * @return QueueModel
     */
    public static function get_( $get )
    {
        return parent::get_( $get );
    }

    // ... /STATIC


    // /FUNCTIONS


}

?>