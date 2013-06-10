<?php

class AapentAppMainController extends AppMainController {

    // VARIABLES


    public static $CONTROLLER_NAME = "aapent";

    // /VARIABLES


    // CONSTRUCTOR


    // /CONSTRUCTOR


    // FUNCTIONS


    /**
     * @see MainController::getLastModified()
     */
    public function getLastModified() {
        return max( filemtime( __FILE__ ), parent::getLastModified() );
    }

    /**
     * @see AbstractMainController::after()
     */
    public function after() {
        parent::after();

        $this->addJavascriptFile( Resource::javascript()->getJqueryApiFile() );
        $this->addJavascriptFile( Resource::javascript()->getJavascriptFile( $this->getMode() ) );
        $this->addJavascriptFile( Resource::javascript()->getGoogleMapsMarkerclusterer() );
//         $this->addJavascriptFile( Resource::javascript()->getGoogleMapsMarkerlabel() );
        $this->addCssFile( Resource::css()->getCssFile( $this->getMode() ) );
        $this->addHead(
                Xhtml::link()->href( Resource::css()->getFontRoboto() )->rel( LinkXhtml::$REL_STYLESHEET )->type(
                        LinkXhtml::$TYPE_CSS ) );

        $this->addMetaTag(
                Xhtml::meta()->name( MetaXhtml::$NAME_VIEWPORT )->content(
                        Core::cc( ", ", MetaXhtml::$CONTENT_VIEWPORT_INITIALSCALE_1,
                                MetaXhtml::$CONTENT_VIEWPORT_USERSCALABLE_NO ) ) );
        $this->addMetaTag( Xhtml::meta()->attr( "charset", "utf-8" ) );

        $codeBody = <<<EOD
    eventHandler = new EventHandler();
    view = new %s("%s");
    controller = new %s(eventHandler, %d, %s);
    controller.render(view);
EOD;

        $codeBody = sprintf( $codeBody, "AapentAppMainView", AapentAppMainView::$ID_APP_WRAPPER,
                "AapentAppMainController", $this->getMode(), json_encode( array () ) );

        $code = <<<EOD
var eventHandler, view, controller;
$(document).ready(function() {
	%s
});

(function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
(i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
})(window,document,'script','//www.google-analytics.com/analytics.js','ga');

ga('create', '%s', '%s');
ga('send', 'pageview');
EOD;

        $this->addJavascriptCode( sprintf( $code, $codeBody, "UA-16538668-5", "krisskarbo.com" ) );
        $this->addJavascriptMap();
    }

    /**
     * @see AbstractController::request()
     */
    public function request() {

    }

    // /FUNCTIONS


}

?>