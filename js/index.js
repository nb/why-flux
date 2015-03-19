/** @jsx React.DOM */
var PostsStore = function() {
	this.posts = {};
	this.changeCallbacks = [];
};
PostsStore.prototype.registerChangeCallback = function( callback ) {
	this.changeCallbacks.push( callback );
};
PostsStore.prototype.merge = function( newPosts ) {
	newPosts.forEach( function( post ) {
		this.posts[ post.id ] = post;
	}.bind( this ) );
	this.changeCallbacks.forEach( function( callback ) {
		setTimeout( callback, 0 );
	} );
};
var App = React.createClass( {
	render: function() {
		return (
			<div>
				<h1>Featured Posts</h1>
				<hr />
				<FeaturedPosts />
				<h1>Latest Posts</h1>
				<hr />
				<LatestPosts />
			</div>
		);
	}
} );

var postsStore = new PostsStore();

var FeaturedPosts = React.createClass( {
	getInitialState: function() {
		return {
			postIds: [],
			posts: []
		};
	},
	componentWillMount: function() {
		this.load();
		postsStore.registerChangeCallback( this.onPostChange );
	},
	onPostChange: function() {
		this.forceUpdate();
	},
	load: function() {
		API.featured( function( posts ) {
			this.setState( {
				postIds: posts.map( function( post ) {
		   			return post.id;
				} )
			} );
			postsStore.merge( posts );
		}.bind( this ) );
	},
	onPostLike: function( post ) {
		API.like( post.id, function( updatedPost ) {
			postsStore.merge( [ updatedPost ] );
		}.bind( this ) );
	},
	render: function() {
		var posts = this.state.postIds.map( function( id ) {
			return postsStore.posts[ id ];
		} );
		return <Posts posts={ posts } onPostLike={ this.onPostLike } />;
	}
} );

var LatestPosts = React.createClass( {
	propTypes: {
		children: React.PropTypes.element.isRequired
	},
	getInitialState: function() {
		return {
			postIds: []
		};
	},
	componentWillMount: function() {
		this.load();
		postsStore.registerChangeCallback( this.onPostChange );
	},
	onPostChange: function() {
		this.forceUpdate();
	},
	load: function() {
		API.featured( function( posts ) {
			this.setState( {
				postIds: posts.map( function( post ) {
		   			return post.id;
				} )
			} );
			postsStore.merge( posts );
		}.bind( this ) );
	},
	onPostLike: function( post ) {
		API.like( post.id, function( updatedPost ) {
			postsStore.merge( [ updatedPost ] );
		}.bind( this ) );
	},
	render: function() {
		var posts = this.state.postIds.map( function( id ) {
			return postsStore.posts[ id ];
		} );
		return <Posts posts={ posts } onPostLike={ this.onPostLike } />;
	}
} );

var Posts = React.createClass( {
	render: function() {
		return (
			<div className="posts">
				{
					this.props.posts.map( function( post ) {
						return <Post post={ post } onLike={ this.props.onPostLike }/>;
					}.bind( this ) )
				}
			</div>
		);
	}
} );

var Post = React.createClass( {
	onLike: function() {
		console.log( 'like' );
		this.props.onLike( this.props.post );
	},
	render: function() {
		return (
			<section className="post">
				<h1>{ this.props.post.title }</h1>
				<h2>by { this.props.post.author }</h2>
				{ this.props.post.likes } people liked this post <button onClick={ this.onLike }>Like “{ this.props.post.title }”</button>
			</section>
		);
	}
} );

React.render( <App/>, document.body );
