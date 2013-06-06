<?php

class HoursPlaceContainer extends AbstractPlaceContainer
{

    // VARIABLES


    const MONDAY = "mon";
    const TUESDAY = "tue";
    const WEDNESDAY = "wed";
    const THURSDAY = "thu";
    const FRIDAY = "fri";
    const SATURDAY = "sat";
    const SUNDAY = "sun";

    const REGULAR = "regular";
    const CLOSED = "closed";

    public $regular = array ();
    public $specialdays = array ();

    // /VARIABLES


    // CONSTRUCTOR


    public function __construct( $arg = null )
    {
        $this->regular = array_fill_keys(
                array ( self::MONDAY, self::TUESDAY, self::WEDNESDAY, self::THURSDAY, self::FRIDAY, self::SATURDAY,
                        self::SUNDAY ), null );

        parent::__construct( $arg );
    }

    // /CONSTRUCTOR


    // FUNCTIONS


    // /FUNCTIONS


}