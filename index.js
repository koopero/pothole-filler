const
  _ = require('underscore'),
  fs = require('fs'),
  PNG = require('node-png').PNG
;

exports.processFile = processFile;
exports.potholeFiller = potholeFiller;

function processFile( inputFile, outputFile ) {
  var width, height;

  fs.createReadStream(inputFile)
    .pipe( new PNG () )
    .on( 'metadata', function ( meta ) {
      width = meta.width;
      height = meta.height;
    })
    .on( 'parsed', function( data ) {
      potholeFiller( data, width, height );
      this.pack().pipe( fs.createWriteStream( outputFile ) );
    })
}


function potholeFiller( data, width, height ) {
  for ( var y = 0; y < height; y ++ )
  for ( var x = 0; x < width; x ++ ) {
    if ( isHole( x,y ) )
      fillHole( x, y );
  } 

  function ind( x,y,c) {
    return ( y * width + x ) * 4 + ( c || 0 );
  }

  function isHole( x,y ) {
    return data[ind(x,y,3)] == 0;
  }

  function pix( x, y ) {
    if ( x >= 0 && y >= 0 && x < width && y < height )
      return { x: x, y: y, a: data[ind( x,y,3)]  }
  }

  function fillHole( x, y ) {
    var result = findHole( x,y),
      hole = result[0],
      edge = result[1]
    ;

    for ( hi = 0; hi < hole.length; hi ++ ) {
      var h = hole[hi];
      var a = 0, t = 0;
      for ( ei = 0; ei < edge.length; ei ++ ) {
        var e = edge[ei];
        var w = 1 / ( ( h.x - e.x ) * (h.x - e.x ) + ( h.y - e.y ) * (h.y - e.y ) );
        a += e.a * w;
        t += w;
      }

      var i = ind( h.x, h.y, 3 );
      data[i] = Math.floor( a / t );
    }

    //process.exit();

    function findHole( x, y ) {
      var edge = {},
        hole = {},
        q = [],
        p
        ;

      p = pix( x,y );
      q.push( p );

      while ( p = q.shift() ) {
        var n;
        for ( var d = 0; d < 4; d ++ ) {
          n = next( p, d );
          if ( !n )
            continue;

          var i = ind( n.x, n.y );
          if ( n.a )
            edge[i] = n;
          else
            hole[i] = n;

          if ( !n.a )
            q.push( n );
        }
      } 

      return [ _.values( hole ), _.values( edge ) ];

      function next( p, d ) {
        var x = p.x,
          y = p.y;

        switch ( d ) {
          case 0: y --; break;
          case 1: x ++; break;
          case 2: y ++; break;
          case 3: x --; break;
        }

        if ( x < 0 || y < 0 || x >= width || y >= height )
          return;

        var i = ind( x, y );
        if ( hole[i] || edge[i] )
          return;

        return pix( x, y ); 
      }
    }
  }
}