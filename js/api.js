var API = ( function() {
	var posts = {
		1: {
			id: 1,
			title: 'Best Scrambled Sunny-side-ups',
			author: 'Peter Fry',
			likes: 5
		},
		2: {
			id: 2,
			title: 'The Magic Horn of A Bored Frog',
			author: 'Scientology Master',
			likes: 2
		},
		3: {
			id: 3,
			title: 'When In a Hole Stop Digging',
			author: 'Coyote (ACME)',
			likes: 0
		},
		4: {
			id: 4,
			title: 'Half-Virtious Feedback Loops',
			author: 'Barry Octogonoalson',
			likes: 1
		}
	},
		featured = [ 1, 2, 3 ];
	return {
		featured: function(cb) {
			cb( featured.map( function( id ) {
				return posts[id];
			} ) );
		},
		latest: function(cb) {
			var ids = Object.keys( posts );
			ids.sort( function( id0, id1 ) {
				return parseInt( id1, 10 ) - parseInt( id0, 10 );
			} );
			cb( ids.slice( 0, 2 ).map( function( id ) {
				return posts[ id ];
			} ) );
		},
		like: function( id, cb ) {
			if ( ! posts[ id ] ) {
				return cb ( null );
			}
			posts[ id ].likes++;
			cb ( posts[ id ] );
		}
	};
} )();

