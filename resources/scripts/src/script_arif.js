(function($)
{
  "use strict";

  $(document).ready(function()
  {
    if ( $( '.number-stat' ).length > 0 )
    {

      //
      // Get connection count
      setInterval(function()
      {
        $.ajax({
           url: 'https://neo.org/Home/GetConnectionCount',
           type: 'POST',
           dataType: 'json',
           data: {
              format: 'json'
           },
           error: function() {
           },
           success: function(data)
           {
             $( '.left-info-stat .top-stat-info .number-stat' ).text( data );
           }
        });
      },
      5000);

      //
      // Get block count
      setInterval(function()
      {
        $.ajax({
           url: 'https://neo.org/Home/GetBlockCount',
           type: 'POST',
           dataType: 'json',
           data: {
              format: 'json'
           },
           error: function() {
           },
           success: function(data)
           {
             $( '.right-info-stat .top-stat-info .number-stat' ).text( data );
           }
        });
      },
      5000);

      //
      // Get date
      var from = moment( '2015-11-27' );
      var now = moment();
      var diff = now.diff( from, 'days');
      $( '.left-info-stat .bottom-stat-info .number-stat' ).text( diff );

      var from = moment( '2016-10-17' );
      var now = moment();
      var diff = now.diff( from, 'days');
      $( '.right-info-stat .bottom-stat-info .number-stat' ).text( diff );
    }

    //
    // Timeline slider
    //
    var tmSlider =
    {
      slides: [],
      width: 0,
      height: 0,
      totalWidth: 0,
      count: 0,
      countDisplay: 4,
      index: 1,
      duration: 1000,
      onProcess: false,

      //
      // Init
      //
      init: function()
      {
        var self = this;

        //prepare
        this.slides = [];
        $( '.timeline--slider .timeline--node--group' ).each( function()
        {
          self.slides.push( $(this).get(0) );
        });


        this.count = this.slides.length;
        if ( this.count < 1 ) {
          return false;
        }

        //
        //resize
        self.resize();
        $(window).resize(function()
        {
          self.resize();
        });

        //
        //nav
        this.nav();

        //
        //pan
        this.pan();
      },

      //
      // resize
      //
      resize: function()
      {
        this.getSize();
        this.prepareSlider();
      },

      //
      // Prepare slide
      //
      prepareSlider: function()
      {
        //set container width
        var slider = $( '.timeline--slider--inner' );
        var total  = this.totalWidth + ( this.width * 2 );
        slider.width( total );

        //set item width
        $( '.timeline--slider .timeline--node--group' ).width( this.width );
      },

      //
      // Get slider size
      //
      getSize: function()
      {
        //get width
        var winWidth = $(window).width();
        var itemWidth = winWidth/this.countDisplay;
        this.width = itemWidth;
        this.totalWidth = this.width * this.count;
      },

      //
      // Slider nav
      //
      nav: function()
      {
        var self = this;
        $( '.timeline--nav a' ).click( function()
        {
          self.onProcess = true;

          var link = $(this);
          var year = link.attr( 'href' ).replace( '#', '' );

          $( '.timeline--nav a' ).removeClass( 'active' );
          link.addClass( 'active' );

          var tofind = false;
          var index = 0;
          for ( var i = 0; i < self.slides.length; i++ )
          {
            var slide = $( self.slides[i] );
            var nodes = $( '.timeline--node', slide );

            for ( var j = 0; j < self.slides.length; j++ )
            {
              var node = nodes[j];
              var nodeYear = $(node).attr( 'data-year' );
              if ( nodeYear == year ) {
                index = i;
                tofind = true;
                break;
              }
            }
            if ( tofind ) {
              tofind = false;
              break;
            }
          }

          //animating slide
          self.goto( index );
        });
      },

      //
      // pan
      //
      pan: function()
      {
        var self = this;
        var slider, sliderLeft;
        new Hammer( $('.timeline--slider')[0], {
          domEvents: true
        });

        $('.timeline--slider').on( "panstart", function( e )
        {
          slider = $( ".timeline--slider--inner" );
          sliderLeft = parseInt( slider.css( "x" ), 10 );
        });

        $('.timeline--slider').on( "panend", function( e )
        {
          var left = parseInt( slider.css( "x" ), 10 );
          left = Math.abs( left );

          var slice = left/self.width;
          var prevIndex = Math.floor( slice );
          var nextIndex = Math.ceil( slice );

          var halfWidth = self.width/2;
          var prevWidth = prevIndex * self.width;
          var nextWidth = nextIndex * self.width;
          var nextHalf = prevWidth + halfWidth;

          if ( left > nextHalf ) {
            self.goto( nextIndex );
            var goindex = nextIndex;
          } else {
            self.goto( prevIndex );
            var goindex = prevIndex;
          }

          //activing nav
          var currentGroup = self.slides[goindex];
          var currentNode = $( '.timeline--node:last-child', currentGroup );
          var currentYear = currentNode.attr( 'data-year' );

          $( '.timeline--nav a' ).removeClass( 'active' );
          $( '.timeline--nav a[href="#'+currentYear+'"]' ).addClass( 'active' );

        });

        var winWidth = $(window).width();
        var sliderWidth = self.totalWidth;
        $('.timeline--slider').on( "pan", function( e )
        {
          if ( sliderWidth > winWidth )
          {
            var maxLeft = (sliderWidth - winWidth) + self.width;
            var delta = sliderLeft + e.originalEvent.gesture.deltaX;
            if ( delta >= (-1*maxLeft) && delta <= 0 ) {
               slider.css( {
                "x": delta
              });
            }
          }
        });
      },

      //
      // Go to next slider
      //
      goto: function( index )
      {
        if ( typeof this.slides[index] !== 'undefined' )
        {
          var slide = this.slides[index];
          if ( slide )
          {
            this.index = index;
            //sliding
            this.sliding( slide, index );
          }
        }
      },

      //
      // Sliding to next slide
      //
      sliding: function( next, index )
      {
        var self = this;
        var left = ( this.width * index ) * -1;

        $( '.timeline--slider--inner' ).transition({
          x: left,
          duration: self.duration,
          complete: function()
          {
            this.onProcess = false;
          }
        });
      },
    };
    tmSlider.init();


  });

})(jQuery);
