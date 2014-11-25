/*!
 *
 * MLB Popout Plugin
 *
 * Dependencies: jQuery 1.5.1+, jQuery UI 1.8+ and Modernizr ( csstransforms3d & touch capable feature detection )
 * Version 1.0.1
 * Author @Cornally
 *
 *  Bind to your trigger element to trigger the generation of a popout.
 *
 *  Popouts are used to provide additional information or a subset of
 *  task-specific features that may be actionable or simply informative.
 *  The major difference between tooltips and popouts is the trigger event
 *  and the volume of information that can be displayed. Popouts are trigged
 *  by a click/touch and can display larger amounts of information as a result.
 *  They are closed when the trigger is clicked for a second time, the body of the
 *  page is clicked (area outside of active popout), or the "ESC" key is pressed.
 *
 * Based On: jQuery UI Widget-factory plugin boilerplate (for 1.8/9+) by @addyosmani
 *
 */

;(function ( $, window, document, undefined ) {

    $.widget( "mlb.popout" , {

        //Options to be used as defaults
        options: {
            sName: null, // Construct for poput, if none provided iterate by 1
            sContent: 'Please add content to your popout.', // Content
            asClasses: null, // Add these classes to your generated popout
            bAnimate: true, // Should the popout use css animations?
            bFixedWrapper: false, // Is your popout positioned inside of a fixed element?  Calculate the "top" position differently
            sWidth: 'auto', // Apply inline width to popout
            sHeight: 'auto', // Apply inline height to popout
            sAppendTo: 'body', // Append popout here.  This is useful for housekeeping.
            bTouchDevice: Modernizr.touch, // Detect touch device
            fnInitComplete: null, // Completion callback
            fnOnShow: null, // On show callback
            fnOnHide: null, // On hide callback
        },

        //Setup widget (eg. element creation, apply theming
        // , bind events etc.)
        _create: function () {

            // _create will automatically run the first time
            // this widget is called. Widget setup code goes here.

            element = $(this.element);

            // Store each instance in an array.  This is helpful
            // for keeping tabs on the number of instantiated
            $.mlb.popout.instances.push(this.element);

            // Construct popout id from sPopoutName.
            var popoutId = this._setId( this.options.sName );
            
            // Popout classes
            var popoutArray = [];
            var popoutClasses = "";
            
            // Push classes passed in to 'asClasses'
            if ( this.options.asClasses !== null ) {
                popoutArray = this.options.asClasses;
            }
            
            if ( this.options.bAnimate ) {
                popoutArray.push("popout","animate");
            } else {
                popoutArray.push("popout");
            }
            
            popoutClasses = popoutArray.join(" ");

            // Enable listeners
            this._enableListeners( this.element );
            
            // Detect type of content passed in to 'sContent'
            if (typeof this.options.sContent === 'string'){
            	popoutContent = this.options.sContent;
            } else {
              popoutContent = '';
            }
            
            //Construct popout (concat for readability)
            var p;
            p  = '<div id="' + popoutId + '" class="' + popoutClasses + '" style="width:' + this.options.sWidth + '; height:' + this.options.sHeight + ';">';
            p +=      '<div class="popout-arrow"></div>';
            p +=      '<div class="popout-content clearfix">';
            p +=            popoutContent;
            p +=      '</div>';
            p += '</div>';
            
            
            // Append popout
            if ($('#' + popoutId).length === 0) {
                $(p).appendTo( this.options.sAppendTo );
            }
            
            // Insert content if an object was passed in to 'sContent'
            if (typeof this.options.sContent !== 'string'){
              $('#' + popoutId).find('div.popout-content').append(this.options.sContent);
            }
            
            
            // Store the popoutId on the original element for later
            element.data('outputId' , popoutId);
            
            
            // Add trigger class
            element.addClass('popout-trigger');

            
            // Fire event when popout is created
            if ( this.options.fnInitCallback !== null ) {
                this._trigger('fnInitComplete');
            }
        
        },
        
        // Set the id of the generated popout with consideration to the sName option (if supplied).
        // Also, avoid generating duplicates by appending incremental numbers when necessary.
        
        _setId: function( name ) {
            
            // If sName option is populated, generate a unique incremented id
            if ( name !== null ) {
                
                var popoutId = 'popout-' + name.replace(/\s+/g, '-').toLowerCase();
                
                var popoutIdCount = $('#' + popoutId).length;
                
                if ( popoutIdCount !== 0 ) {
                    
                    var i = 1;
                    
                    var incrementedPopoutId = popoutId + "-" + (popoutIdCount + i);
                    
                    // Increment for a unique id
                    while ( $('#' + incrementedPopoutId).length === 1 ) {
  
                        i++;
                        incrementedPopoutId = popoutId + "-" + (popoutIdCount + i);
                        
                    }
                    
                    return incrementedPopoutId;
                
                } else {
                    
                    return popoutId;
                
                }
                
            }

            
            // If sName option is not populated
            else {
                
                var popoutId = 'popout-' + ( $(':mlb-popout').length + 1 );
                
                return popoutId;
                
            }
            
        },
        

        _enableListeners: function( element ) {

            // If the environment is touch capable, bind to touch events.
            if ( this.options.bTouchDevice ){
               pointerDown = 'touchstart.popout';
            } else {
                pointerDown = 'click.popout';
            }

            //Construct popout id from sName
            var popoutId = this._setId( this.options.sName );
            
            element.on( pointerDown , function(e) {

                // Prevent execution of default on trigger
                e.preventDefault();
                e.stopPropagation();

                // Current instance of the popout
                var popout = $('#' + popoutId);
                
                // If your trigger has an "active" treatment, you can style it using
                // the "active" class
                if (element.hasClass('active')) {

                  // Hide popout
                  element.popout('hide');

                  // Remove bindings
                  $('body').off('click.popout');
                  $(window).off('resize.popout');
                  $(document).off('keyup.popout');
                  
                  // Create trigger on open
                  element.data('popout')._trigger('fnOnHide');

                } else {

                  // Show popout (hide all open old ones first)
                  element.popout('hide');

                  // Trigger is active
                  element.addClass('active');

                  // Add open class
                  popout.addClass('open');
                  
                  // Set position of popout
                  element.popout('position');

                  // Clicking body closes popout
                  $('body').on(pointerDown, function(e) {
                	  if($(e.target).parents('#ui-datepicker-div').length==0&&$(e.target).parents('.ui-autocomplete').length==0){
                		  if(!$(e.target).closest('.popout').hasClass('open')) {
                			  element.popout('hide');
                		  }
                    }
                  });

                  // "ESC" key closes popout
                  $(document).on('keyup.popout', function(e){
                    if (e.keyCode == 27) { element.popout('hide'); }
                  });

                  // Reposition popout on device resize
                  $(window).on('resize.popout', function() {
                    element.popout('position');
                  });
                  
                  // Reposition popout on device rotation
                  $(window).on('orientationchange.popout', function() {
                    element.popout('position');
                  });
                  
                  // Set position of popout, called a second time in case content has wrapped
                  // This fixes the issue with unspecified widths and triggers in the lower
                  // right of the viewport.
                  element.popout('position');
                  
                  // Create trigger on open
                  element.data('popout')._trigger('fnOnShow');

                }
            });
        },

        _disableListeners: function( element ) {
            element.off('touchstart.popout');
            element.off('click.popout');
            $('body').off('touchstart.popout');
            $('body').off('click.popout');
            $(document).off('keyup.popout');
            $(window).off('resize.popout');
            $(window).off('orientationchange.popout');
        },

        position: function() {

            element = $(this.element);

            // Grab the element's outputted popout from a data attribute
            var popout = $('#' + element.data('outputId'));
            
            // Clear existing position classes
            popout.removeClass('popout-top-left popout-top-right popout-top-center popout-center-left popout-center-center popout-center-right popout-bottom-left popout-bottom-center popout-bottom-right');
            
            // Establish a minimum width based on the size of the triggering element
            var minPopoutWidth = parseInt(this.element.outerWidth() / 2) + 16;
            if ( parseInt(this.options.sWidth) < minPopoutWidth ) {
                popout.css( 'width' , minPopoutWidth + 'px' );
            }

            // Trigger distance from top
            var viewportOffsetY = element.offset().top - $(window).scrollTop();

            // Trigger distance from left
            var viewportOffsetX = element.offset().left - $(window).scrollLeft();

            // 1/3 of viewport width
            var viewportThirdX = parseInt($(window).width()/3);

            // 1/3 of viewport height
            var viewportThirdY = parseInt($(window).height()/3);

            // Take margins/padding on the popout's trigger into account so arrow centers properly
            var elementMarginAndPaddingSizeX = 0;

            // Adjust the final X if necessary
            var adjustX = 0;

            // Adjust the final Y if necessary
            var adjustY = 0;

            // Final popout absolute position
            var targetLeft = 0;
            var targetTop = 0;

            // Final arrow absolute position
            var arrowLeft = 0;
            var arrowTop = 0;

            // Find position in viewport and style accordingly
            if(viewportOffsetY < viewportThirdY) {
              // Top Third
              if (viewportOffsetX < viewportThirdX) {

                // Top Left
                popout.addClass('popout-top-left');

                adjustX = 0;
                targetLeft = element.offset().left + adjustX;
                arrowLeft = (element.outerWidth()/2) - 7;

              } else if (viewportOffsetX < viewportThirdX*2){

                // Top Center
                popout.addClass('popout-top-center');

                adjustX = popout.outerWidth()/2 - element.outerWidth()/2;
                targetLeft = element.offset().left - adjustX;
                arrowLeft = Math.abs(popout.outerWidth()/2) - 7;

              } else {

                // Top Right
                popout.addClass('popout-top-right');

                adjustX = element.outerWidth() - popout.outerWidth();
                targetLeft = element.offset().left + adjustX;
                arrowLeft = Math.abs(popout.outerWidth()) - (element.outerWidth()/2) - 7;

              }

              if ( Modernizr.csstransforms3d ) adjustY = -15; //Move up so translate3d animation down ends up in the right place

              if( this.options.bFixedWrapper ) {
                targetTop = element[0].getBoundingClientRect().top + element.outerHeight() - 2 + adjustY;
              }
              else {
                targetTop = element.offset().top + element.outerHeight() - 2 + adjustY;
              }

              arrowTop = 1;

            } else if (viewportOffsetY < viewportThirdY*2){
              // Center
              if (viewportOffsetX < viewportThirdX) {

                // Center Left
                popout.addClass('popout-center-left');

                adjustX = 0;
                targetLeft = element.offset().left + adjustX;
                arrowLeft = (element.outerWidth()/2) - 7;

              } else if (viewportOffsetX < viewportThirdX*2){

                // Center Center
                popout.addClass('popout-center-center');

                adjustX = popout.outerWidth()/2 - element.outerWidth()/2;
                targetLeft = element.offset().left - adjustX;
                arrowLeft = Math.abs(popout.outerWidth()/2) - 7;

              } else {

                // Center Right
                popout.addClass('popout-center-right');
                
                adjustX = element.outerWidth() - popout.outerWidth();
                targetLeft = element.offset().left + adjustX;
                arrowLeft = Math.abs(popout.outerWidth()) - (element.outerWidth()/2) - 7;

              }

              if ( Modernizr.csstransforms3d ) adjustY = -15; //Move up so translate3d animation down ends up in the right place
              targetTop = element.offset().top + element.outerHeight() - 2 + adjustY;
              arrowTop = 1;

            } else {
              // Bottom Third
              if (viewportOffsetX < viewportThirdX){

                // Bottom Left
                popout.addClass('popout-bottom-left');

                adjustX = 0;
                targetLeft = element.offset().left + adjustX;
                arrowLeft = (element.outerWidth()/2) - 7;

              } else if (viewportOffsetX < viewportThirdX*2){

                // Bottom Center
                popout.addClass('popout-bottom-center');

                adjustX = popout.outerWidth()/2 - element.outerWidth()/2;
                targetLeft = element.offset().left - adjustX;
                arrowLeft = Math.abs(popout.outerWidth()/2) - 7;

              } else {

                // Bottom Right
                popout.addClass('popout-bottom-right');

                adjustX = element.outerWidth() - popout.outerWidth();
                targetLeft = element.offset().left + adjustX;
                arrowLeft = Math.abs(popout.outerWidth()) - (element.outerWidth()/2) - 7;

              }

              if ( Modernizr.csstransforms3d ) adjustY = 15; //Move up so translate3d animation down ends up in the right place

              if( this.options.bFixedWrapper ) {
                targetTop = element[0].getBoundingClientRect().top - popout.outerHeight() - 2 + adjustY;
              }
              else {
                targetTop = element.offset().top - popout.outerHeight() - 2 + adjustY;
              }
              
              arrowTop = popout.outerHeight() - 3;

            }

            // Position with jQuery
            $('.popout-arrow', popout).css({'left' : arrowLeft , 'top' : arrowTop});
            popout.css({'left' : targetLeft , 'top' : targetTop});

        },

        hide: function() {

            // If the environment is touch capable, bind to touch events.
            if ( this.options.bTouchDevice ){
               pointerDown = 'touchstart.popout';
            } else {
                pointerDown = 'click.popout';
            }

            $('body').off(pointerDown);
            $(window).off('resize.popout');
            $(document).off('keyup.popout');
            
            $('.popout').removeClass('open').css({ 'left' : '' , 'top' : '' });
            $('.popout-trigger').removeClass('active b-active');
        },


        // Destroy an instantiated plugin and clean up
        // modifications the widget has made to the DOM
        destroy: function ( element ) {

            // this.element.removeStuff();
            // For UI 1.8, destroy must be invoked from the
            // base widget
            $.Widget.prototype.destroy.call(this);
            // For UI 1.9, define _destroy instead and don't
            // worry about
            // calling the base widget

            element = $(this.element);

            // Kill plugin
            this._disableListeners( element );
            $(this.element).removeClass('popout-trigger active');
            $("#popout-" + this.options.sName.replace(/\s+/g, '-').toLowerCase()).remove();

            // Remove from list of plugin instances
            $.mlb.popout.instances.pop(this.element);
        },

        // Respond to any changes the user makes to the option method
        _setOption: function ( key, value ) {

            switch (key) {

            case "bAnimate":

                // Fire event
                this._trigger('change');

                break;
            default:
                break;
            }

            // For UI 1.8, _setOption must be manually invoked
            // from the base widget
            $.Widget.prototype._setOption.apply( this, arguments );
            // For UI 1.9 the _super method can be used instead
            // this._super( "_setOption", key, value );

        },

    });

    $.extend($.mlb.popout, {
        instances: []
    });

})( jQuery, window, document );
