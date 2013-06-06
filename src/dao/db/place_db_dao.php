<?php

class PlaceDbDao extends StandardDbDao implements PlaceDao
{

    // VARIABLES


    private static $EXPRESSION_DISTANCE = "3956 * 2 * ASIN(SQRT(POWER(SIN((%lat1%- %lat2%) * pi()/180 / 2), 2) +COS(%lat1% * pi()/180) *COS(%lat2% * pi()/180) *POWER(SIN((%lon1% - %lon2%) * pi()/180 / 2), 2) )) * 1.609344";

    // /VARIABLES


    // CONSTRUCTOR


    // /CONSTRUCTOR


    // FUNCTIONS


    // ... GET


    /**
     * @see StandardDbDao::getTable()
     */
    protected function getTable()
    {
        return Resource::db()->place()->getTable();
    }

    /**
     * @see StandardDbDao::getPrimaryField()
     */
    protected function getPrimaryField()
    {
        return Resource::db()->place()->getFieldId();
    }

    /**
     * @see StandardDbDao::getForeignField()
     */
    protected function getForeignField()
    {
        return Resource::db()->place()->getFieldGroup();
    }

    /**
     * @return SelectQueryDbCore
     */
    private function getLocationQuery( $lat, $long, $radius, $count )
    {
        $distanceExpression = str_replace( array ( "%lat1%", "%lon1%", "%lat2%", "%lon2%" ),
                array ( sprintf( "%0.5f", $lat ), sprintf( "%0.5f", $long ),
                        Resource::db()->place()->getFieldLocationLat(), Resource::db()->place()->getFieldLocationLong() ),
                self::$EXPRESSION_DISTANCE );

        $selectQuery = $this->getSelectQuery();
        $selectQuery->getQuery()->addExpression(
                SB::as_( $distanceExpression, Resource::db()->place()->getfieldAliasDistance() ) );
        $selectQuery->getQuery()->setLimit( $count );
        $selectQuery->getQuery()->setOrderBy(
                array ( array ( Resource::db()->place()->getFieldAliasDistance(), SB::$ASC ) ) );
        $selectQuery->getQuery()->setHaving( SB::lte( Resource::db()->place()->getFieldAliasDistance(), $radius ) );

        return $selectQuery;
    }

    /**
     * @see StandardDbDao::getInsertUpdateFieldsBinds()
     */
    protected function getInsertUpdateFieldsBinds( StandardModel $model, $foreignId = null, $isInsert = false )
    {

        $fields = array ();
        $binds = array ();
        $model = PlaceModel::get_( $model );

        $fields[ Resource::db()->place()->getFieldName() ] = ":name";
        $binds[ "name" ] = Core::utf8Decode( $model->getName() );

        if ( !is_null( $model->getIdPlace() ) )
        {
            $fields[ Resource::db()->place()->getFieldIdPlace() ] = ":id_place";
            $binds[ "id_place" ] = $model->getIdPlace();
        }
        else
            $fields[ Resource::db()->place()->getFieldIdPlace() ] = SB::$NULL;

        if ( $foreignId )
        {
            $fields[ Resource::db()->place()->getFieldGroup() ] = ":group";
            $binds[ "group" ] = $foreignId;
        }
        else
            $fields[ Resource::db()->place()->getFieldGroup() ] = SB::$NULL;

        $fields[ Resource::db()->place()->getFieldInfo() ] = ":info";
        $binds[ "info" ] = Core::createJson( $model->getInfo() );
        $fields[ Resource::db()->place()->getFieldLocationLat() ] = ":locationLat";
        $binds[ "locationLat" ] = $model->getLocationLat();
        $fields[ Resource::db()->place()->getFieldLocationLong() ] = ":locationLong";
        $binds[ "locationLong" ] = $model->getLocationLong();
        $fields[ Resource::db()->place()->getFieldHours() ] = ":hours";
        $binds[ "hours" ] = Core::createJson( $model->getHours() );
        $fields[ Resource::db()->place()->getFieldFeatures() ] = ":features";
        $binds[ "features" ] = Core::createJson( $model->getFeatures() );

        if ( !$isInsert )
            $fields[ Resource::db()->place()->getFieldUpdated() ] = SB::$CURRENT_TIMESTAMP;

        return array ( $fields, $binds );

    }

    /**
     * @see StandardDbDao::getInitiatedList()
     */
    protected function getInitiatedList()
    {
        return new PlaceListModel();
    }

    /**
     * @see PlaceDao::getLocation()
     */
    public function getLocation( $lat, $long, $radius = self::MAX_RADIUS, $count = self::MAX_COUNT )
    {
        $radius = $radius ? $radius : self::MAX_RADIUS;
        $selectQuery = $this->getLocationQuery( $lat, $long, $radius, $count );

        $result = $this->getDbApi()->query( $selectQuery );

        return $this->createList( $result->getRows() );
    }

    // ... /GET


    // ... CREATE


    /**
     * @see StandardDbDao::createModel()
     */
    protected function createModel( array $modelArray )
    {

        $model = PlaceFactoryModel::createPlace( Core::arrayAt( $modelArray, Resource::db()->place()->getFieldName() ),
                Core::arrayAt( $modelArray, Resource::db()->place()->getFieldGroup() ),
                Core::arrayAt( $modelArray, Resource::db()->place()->getFieldInfo() ),
                Core::arrayAt( $modelArray, Resource::db()->place()->getFieldLocationLat() ),
                Core::arrayAt( $modelArray, Resource::db()->place()->getFieldLocationLong() ),
                Core::arrayAt( $modelArray, Resource::db()->place()->getFieldHours() ),
                Core::arrayAt( $modelArray, Resource::db()->place()->getFieldFeatures() ),
                Core::arrayAt( $modelArray, Resource::db()->place()->getFieldIdPlace() ) );

        $model->setDistance(
                !is_null( Core::arrayAt( $modelArray, Resource::db()->place()->getFieldAliasDistance() ) ) ? doubleval(
                        Core::arrayAt( $modelArray, Resource::db()->place()->getFieldAliasDistance() ) ) : null );
        $model->setId( intval( Core::arrayAt( $modelArray, $this->getPrimaryField() ) ) );
        $model->setUpdated(
                Core::trimWhitespace( Core::arrayAt( $modelArray, Resource::db()->place()->getFieldUpdated() ) ) );
        $model->setRegistered(
                Core::trimWhitespace( Core::arrayAt( $modelArray, Resource::db()->place()->getFieldRegistered() ) ) );

        return $model;

    }

    // ... /CREATE


    /**
     * @see PlaceDao::searchLocation()
     */
    public function searchLocation( $search, $lat, $long, $radius = self::MAX_RADIUS, $count = self::MAX_COUNT )
    {
        $radius = $radius ? $radius : self::MAX_RADIUS;
        $selectQuery = $this->getLocationQuery( $lat, $long, $radius, $count );
        $selectQuery->getQuery()->addWhere(
                SB::or_( SB::like( Resource::db()->place()->getFieldName(), ":search" ),
                        SB::like( Resource::db()->place()->getFieldInfo(), ":search" ) ) );

        $selectQuery->addBind( array ( "search" => $search ) );

        $result = $this->getDbApi()->query( $selectQuery );

        return $this->createList( $result->getRows() );
    }

    /**
     * @see PlaceDao::removeForeign()
     */
    public function removeForeign( $foreignId )
    {
        $delete_query = new DeleteQueryDbCore(
                new DeleteSqlbuilderDbCore( $this->getTable(), SB::equ( $this->getForeignField(), ":id" ) ),
                array ( "id" => $foreignId ) );

        $result = $this->getDbApi()->query( $delete_query );

        return $result->getAffectedRows();
    }

    // /FUNCTIONS


}

?>