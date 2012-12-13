(function($){ 

    var methods = {

        init: function( options ) {

            var settings = {
                'fields': [ 'Field 1', 'Field 2', 'Field 3' ],
                'gridcolor': 'rgba(0,0,0,0.4)',
                'dotcolor': 'rgba(0,0,0,.6)',
                'strokewidth': 4,
                'handlewidth': 4,
                'increments': 10,
                'minrad': 10
            }

            return this.each( function() {

                if ( this.tagName.toUpperCase() != 'DIV' ) {
                    return false;
                }
                if ( options ) { 
                    $.extend( settings, options );
                }

                var canvasfg;
                var canvasbg;
                var canvasfixed;
                var outercontainer;
                var container;
                var contextfg;
                var contextbg;
                var contextfixed;
                var cx;
                var cy;
                var radius;
                var minrad = settings['minrad'];
                var activedata = {};
                var fixeddata = [];
                var increments = settings['increments'];
                var stroke = settings['strokewidth'];
                var handle = settings['handlewidth'];
                var mousepressed = false;
                var activedrag = 0;
                var mouseinmove = false;

                outercontainer = $(this).get(0);
                container = $('<div class="spidergraph" style="width:100%;height:100%;padding:0;margin:0;border:0" />').get(0);
                $(outercontainer).children().remove();
                $(outercontainer).append($(container));
                
                cx = Math.floor( ($(container).width() / 2) - (handle / 2) );
                cy = Math.floor( ($(container).height() / 2) - (handle / 2) );
                radius = $(container).width();
                if ( $(container).height() < $(container).width() ) {
                    radius = $(container).height();
                }
                radius = Math.floor( radius / 2 - 50 );

                canvasfg = $('<canvas>').get(0);
                $(canvasfg).css( { position: 'absolute', top: '0px', left: '0px' } );   
                canvasbg = $('<canvas>').get(0);
                $(canvasbg).css( { position: 'absolute', top: '0px', left: '0px' } );
                canvasfixed = $('<canvas>').get(0);
                $(canvasfixed).css( { position: 'absolute', top: '0px', left: '0px' } );
                canvasbg.width = $(container).width();
                canvasfg.width = $(container).width();
                canvasfixed.width = $(container).width();
                canvasbg.height = $(container).height();
                canvasfg.height = $(container).height();
                canvasfixed.height = $(container).height();
                $(container).append( $( canvasbg ) );
                $(container).append( $( canvasfixed ) );
                $(container).append( $( canvasfg ) );

                contextfg = canvasfg.getContext("2d");
                contextbg = canvasbg.getContext("2d");
                contextfixed = canvasbg.getContext("2d");


                $(this).data('spidergraph', {
                    'settings': settings,
                    'outercontainer': outercontainer,
                    'activedata': activedata,
                    'fixeddata': fixeddata,
                    'canvasbg': canvasbg,
                    'canvasfg': canvasfg,
                    'canvasfixed': canvasfixed,
                    'cx': cx,
                    'cy': cy,
                    'radius': radius
                });

                var data = $(this).data('spidergraph');
                var $sg = $(this);


                var setactivedrag = function(e) {
                    var mx = Math.floor((e.pageX-$(container).offset().left));
                    var my = Math.floor((e.pageY-$(container).offset().top));

                    var dx = mx-cx;
                    var dy = my-cy;

                    var dr = Math.sqrt( dx * dx + dy * dy );
                    var rad = Math.atan( dx / (0-dy)  );
                    var deg = rad * 180 / Math.PI;
        

                    if ( dy > 0 ) {
                        //bottom
                        deg += 180;
                    }
                    if ( dy <= 0 && dx < 0 ) {
                        //top left;
                        deg += 360;
                    }

                    var closest = 180;
                    var closestidx = 0;
                    degstep = 360 / (settings.fields.length);
                    for ( var x=0; x<settings.fields.length; x++ ) {

                        //find the closest segment to our click;
                        var sdeg = (x*degstep);

                        var diff = (Math.abs( deg - sdeg )) % 360;
                        if ( diff > 180 ) {
                            diff = 360 - diff;
                        }

                        if ( diff < closest ) {
                            closestidx = x;
                            closest = diff;
                        }
                    }

                    activedrag = closestidx;

                }
 
                var handlemove = function(e) {
                    var mx = Math.floor((e.pageX-$(container).offset().left));
                    var my = Math.floor((e.pageY-$(container).offset().top));

                    var dx = mx-cx;
                    var dy = my-cy;
    
                    var dr = Math.sqrt( dx * dx + dy * dy );
                    var rad = Math.atan( dx / (0-dy)  );
                    var deg = rad * 180 / Math.PI;
        

                    if ( dy > 0 ) {
                        //bottom
                        deg += 180;
                    }
                    if ( dy <= 0 && dx < 0 ) {
                        //top left;
                        deg += 360;
                    }

                    var closest = 180;
                    var closestidx = 0;
                    degstep = 360 / (settings.fields.length);
                    for ( var x=0; x<settings.fields.length; x++ ) {

                        //find the closest segment to our click;
                        var sdeg = (x*degstep);

                        var diff = (Math.abs( deg - sdeg )) % 360;
                        if ( diff > 180 ) {
                            diff = 360 - diff;
                        }

                        if ( diff < closest ) {
                            closestidx = x;
                            closest = diff;
                        }
                    }

                    if ( closestidx != activedrag ) {
                        //  return;
                    }

                    var newval = (dr / radius) * increments;
                    newval = Math.floor((newval) );
                    if ( newval > increments ) {
                        newval = increments;
                    } else if ( newval < 0 ) {
                        newval = 0;
                    };

                    if ( data.activedata.data ) {
                        data.activedata.data[activedrag] = newval;
                        $sg.trigger('spiderdatachange', [ data.activedata.data ]);
                        drawActiveData( $sg, data.canvasfg );
                    }

                }


                var supportsTouch = 'createTouch' in document;
                var clickEvent = supportsTouch ? 'click' : 'click';
                var pressEvent = supportsTouch ? 'touchstart' : 'mousedown';
                var moveEvent = supportsTouch ? 'touchmove' : 'mousemove';
                var releaseEvent = supportsTouch ? 'touchend' : 'mouseup';

                var correctCoordinates = function( ev ) {
                    if ( supportsTouch ) {
                        ev.pageX = ev.originalEvent.targetTouches[0].pageX;
                        ev.pageY = ev.originalEvent.targetTouches[0].pageY;
                    }
                };

                $(container).bind( pressEvent, function(e) {
                    mousepressed = true;
                    correctCoordinates( e );

                    if ( e.correctedX != 0 && e.correctedY != 0 ) {
                        mouseinmove = true;
                        setactivedrag( e );
                        handlemove( e );
                    }
                    /*correctCoordinates( e );
                    setactivedrag( e );
                    handlemove( e );
                    */
                }); 
                $(container).bind( releaseEvent, function(e) {
                    mousepressed = false;
                }); 
                $(window).bind( releaseEvent, function(e) {
                    mousepressed = false;
                }); 
                $(container).bind( moveEvent, function(e) {
                    correctCoordinates( e );
                    //alert('touches: ' + e.pageX + ' ' + e.pageY );
                    if ( mousepressed && mouseinmove ) {
                        handlemove( e );
                    } else if ( mousepressed ) {
                        alert('loc: ' + ev.pageX + ' ' + ev.pageY ); 
                        mouseinmove = true;
                        setactivedrag( e );
                        handlemove( e );
                    }
                });


                
                drawGrid( $(this), canvasbg );

                


            }); //end return this.each


        },

        addlayer: function( layerdata ) {
        
            var data = $(this).data('spidergraph');
            data.fixeddata[data.fixeddata.length] = layerdata;
        
            drawFixedData( $(this), data.canvasfixed );

        },

        redraw: function( ) {
        
            var data = $(this).data('spidergraph');

            drawGrid( $(this), data.canvasbg );
            drawFixedData( $(this), data.canvasfixed );
            drawActiveData( $(this), data.canvasfg );

        },

        resetdata: function() {
            var data = $(this).data('spidergraph');
            data.fixeddata = [];
            data.activedata = {};
            drawGrid( $(this), data.canvasbg );
            drawFixedData( $(this), data.canvasfixed );
            drawActiveData( $(this), data.canvasfg );
        },

        setactivedata: function( activedata ) {
            var data = $(this).data('spidergraph');
            data.activedata = activedata;
            drawActiveData( $(this), data.canvasfg );
        }


    }; //end spidergraph methods

    jQuery.fn.spidergraph = function( method ) {
        if ( methods[method] ) {
            return methods[ method ].apply( this, Array.prototype.slice.call( arguments, 1 ));
        } else if ( typeof method === 'object' || ! method ) {
            return methods.init.apply( this, arguments );
        } else {
            $.error( 'Method ' +  method + ' does not exist on jQuery.spidergraph' );
        }   
    };




    function drawGrid( $sg, canvas ) {

        var context = canvas.getContext("2d");
        var data = $sg.data('spidergraph');
        var degstep = 360 / data.settings.fields.length;
        var cx = data.cx;
        var cy = data.cy;
        var radius = data.radius;
        var increments = data.settings.increments;
        var minrad = data.settings.minrad;
    
        context.clearRect( 0, 0, canvas.width, canvas.height );
        for ( var x=0; x<increments; x++ ) {
            drawCircle( context, cx, cy, (x+1) / increments* radius + minrad, data.settings.gridcolor, .3 );
        }
        for ( var x=0; x<data.settings.fields.length; x++ ) {
            var deg = (x*degstep) * Math.PI / 180;
            var dr = increments / increments * radius + minrad;
            var dx = Math.sin( deg ) * dr;
            var dy = 0 - (Math.cos( deg ) * dr);
        
            drawLine( context, cx, cy, dx + cx, dy + cy, data.settings.gridcolor, .3 );
        }

        $sg.find('.diagramText').remove();

        for ( var x=0; x<data.settings.fields.length; x++ ) {
            var deg = (x*degstep) * Math.PI / 180;
            var dr = increments / increments * radius + minrad  + 10;
            var dx = Math.sin( deg ) * dr;
            var dy = 0 - (Math.cos( deg ) * dr);
        
            var text = data.settings.fields[x];
            var adjx = data.cx;
            var adjy = data.cy;
            $newtext = $('<div>');
            $newtext.text(text);
            $newtext.addClass('diagramText');
        
            $newtext.css( { display:'block', position: 'absolute', left: (adjx + dx) + 'px', top: adjy + dy + 'px' 
 } );
            $sg.prepend( $newtext );
        
            //var adjustx = Math.cos( deg );
            var adjustx = ($newtext.width() / 2) + ( Math.cos( deg + Math.PI/2 ) * $newtext.width() / 2 );
            var adjusty = ($newtext.height() / 2) + ( Math.cos( deg ) * $newtext.height() / 2 );

//alert( Math.cos( deg + Math.PI/2 ) );

            $newtext.css( { display:'block', position: 'absolute', left: (adjx + dx - adjustx) + 'px', top: (adjy +
 dy - adjusty ) + 'px'  } );
        
        }

        drawDot( context, cx, cy, data.settings.handlewidth, data.settings.dotcolor );

    }   

    function drawFixedData( $sg, canvas ) {
        var context = canvas.getContext("2d");
        var data = $sg.data('spidergraph');
    
        context.clearRect( 0, 0, canvas.width, canvas.height );
   
        for ( var i in data.fixeddata ) {
        
            layerdata = data.fixeddata[i];
            drawDataSet( $sg, canvas, layerdata );
        
        }
    }

    function drawActiveData( $sg, canvas ) {
        var context = canvas.getContext("2d");
        var data = $sg.data('spidergraph'); 
        context.clearRect( 0, 0, canvas.width, canvas.height );
        
        if ( data == null || data.activedata == null || data.activedata.data == null ) {
            return;
        }

        layerdata = data.activedata;
        drawDataSet( $sg, canvas, layerdata );
    }

    function drawDataSet( $sg, canvas, layerdata ) {
        var context = canvas.getContext("2d");
        var data = $sg.data('spidergraph');
        var degstep = 360 / data.settings.fields.length;
        var cx = data.cx;
        var cy = data.cy;
        var radius = data.radius;
        var increments = data.settings.increments;
        var minrad = data.settings.minrad;

        context.strokeStyle = layerdata.strokecolor;
        context.fillStyle = layerdata.fillcolor;
        context.lineWidth = data.settings.strokewidth;
        context.beginPath();


        //draw bezier
        for ( var x=0; x< data.settings.fields.length ; x++ ) {
            var coords = getCoords($sg, layerdata.data, x);
            var ncoords = getCoords($sg, layerdata.data, (x+1) % data.settings.fields.length );
            var nncoords = getCoords($sg, layerdata.data,  (x+2) % data.settings.fields.length );
            var pcoords = getCoords($sg, layerdata.data,  x-1 >= 0 ? x-1 : data.settings.fields.length -1 );        
            var curvemage = Math.sqrt( (nncoords.x-coords.x) * (nncoords.x-coords.x) + (nncoords.y-coords.y) * (nncoords.y-coords.y)  );    
            curvemage = (curvemage*.2) * (0.2*( ((layerdata.data[x] + 2)/increments + 4)) );
            var curvemaga = Math.sqrt( (ncoords.x-pcoords.x) * (ncoords.x-pcoords.x) + (ncoords.y-pcoords.y) * (ncoords.y-pcoords.y)  );
            curvemaga = (curvemaga*.2) * (0.2*(((layerdata.data[(x+1) %data.settings.fields.length] + 2)/increments + 4)) );
    
            var exitnorm = Math.sqrt( (ncoords.x - pcoords.x) * (ncoords.x - pcoords.x) + (ncoords.y - pcoords.y) * (ncoords.y - pcoords.y) );
            exitnorm = curvemage/exitnorm;
            var appnorm = Math.sqrt( (nncoords.x - coords.x) * (nncoords.x - coords.x) + (nncoords.y - coords.y) * (nncoords.y - coords.y) );
            appnorm = curvemaga/appnorm;

            exit = { x: (ncoords.x - pcoords.x)*exitnorm + coords.x, y: (ncoords.y - pcoords.y)*exitnorm + coords.y};
            approach = { x: ncoords.x - (nncoords.x - coords.x)*appnorm, y: ncoords.y - (nncoords.y - coords.y)*appnorm };

//alert ( exitnorm );
//exit = ncoords;
//exit = approach;

            if ( x == 0 ) {
                context.moveTo( Math.floor(coords.x+cx), Math.floor(coords.y+cy) );
            }
            drawBezierShapePart( context,
                coords.x + cx, coords.y + cy,
                exit.x + cx, exit.y + cy,
                approach.x + cx, approach.y + cy,
                ncoords.x + cx, ncoords.y + cy,
                layerdata.linear ? true : false
            );
            //drawDot( contextfg, exit.x + cx, exit.y + cy, "#000000" );
            //drawDot( contextfg, approach.x + cx, approach.y + cy, "#000000" );
    

        }



        context.fill();
        context.stroke();


    }

    
    function drawCircle( context, x, y, r, color, lw ) {
        context.strokeStyle = color;
        context.lineWidth = lw;
        context.beginPath();
        context.arc( Math.floor(x), Math.floor(y), r, 0, Math.PI*2, true );
        context.closePath();
        context.stroke();
    }


    function drawDot( context, x, y, width, color ) {
        context.fillStyle = color;
        context.beginPath();
        context.arc( Math.floor(x), Math.floor(y), width, 0, Math.PI*2, true );
        context.closePath();
        context.fill();
    }

    function getCoords( $sg, dataset, idx ) {
        var data = $sg.data('spidergraph');
        degstep = 360 / (dataset.length);
        var deg = (idx*degstep) * Math.PI / 180;
        var dr = dataset[idx] / data.settings.increments * data.radius + data.settings.minrad;
        var dx = Math.sin( deg ) * dr;
        var dy = 0 - (Math.cos( deg ) * dr);

        return { x: dx, y: dy, r: dr };
    }


    function drawTriangle( context, x1, y1, x2, y2, x3, y3, color ) {
        context.fillStyle = color;
        context.beginPath();
        context.moveTo( Math.floor(x1), Math.floor(y1) );
        context.lineTo( Math.floor(x2), Math.floor(y2) );
        context.lineTo( Math.floor(x3), Math.floor(y3) );
        context.lineTo( Math.floor(x1), Math.floor(y1) );
        context.fill();
    }
    function drawLine( context, x1, y1, x2, y2, color, width ) {
        context.strokeStyle = color;
        context.lineWidth = width;
        context.beginPath();
        context.moveTo( Math.floor(x1), Math.floor(y1) );
        context.lineTo( Math.floor(x2), Math.floor(y2) );
        context.stroke();
    }
    function drawBezier( context, x1, y1, cx1, cy1, cx2, cy2, x2, y2, color ) {
        context.strokeStyle = color;
        context.lineWidth = stroke;
        context.beginPath();
        context.moveTo( Math.floor(x1), Math.floor(y1) );
        context.bezierCurveTo( Math.floor(cx1), Math.floor(cy1), Math.floor(cx2), Math.floor(cy2), Math.floor(x2), Math.floor(y2) );
        context.stroke();
    }
    function drawBezierShapePart( context, x1, y1, cx1, cy1, cx2, cy2, x2, y2, linear ) {
        if (!linear){
            context.bezierCurveTo( Math.floor(cx1), Math.floor(cy1), Math.floor(cx2), Math.floor(cy2), Math.floor(x2), Math.floor(y2) );
        }
        else {
            context.lineTo(Math.floor(x2), Math.floor(y2));
        }
    }



})(jQuery);




