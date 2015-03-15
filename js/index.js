/** @jsx React.DOM */
var API = {
	featured: function(cb) {
		cb( [
			{id: 1, title: 'Best Scrambled Sunnyside ups', author: 'Willie Wonka', likes: 5},
			{id: 2,title: 'askjhd kjsahd akjshasdk', author: 'Peter Gabriel', likes: 2}
		] );
	},
	latest: function(cb) {
		cb( [
			{id: 3, title: 'News is on the road', author: 'Willie Wonka', likes: 0},
			{id: 4, title: 'Bobo is fun again', author: 'Peter Gabriel', likes: 1},
			{id: 2,title: 'askjhd kjsahd akjshasdk', author: 'Peter Gabriel', likes: 2}
		] );
	},
	like: function( post, cb ) {
		cb ( {
			id: post.id,
			title: post.title,
			author: post.author,
			likes: post.likes + 1
		} );
	}
};

var App = React.createClass( {
	render: function() {
		return (
			<div>
				<FeaturedPosts />
				<LatestPosts />
			</div>
		);
	}
} );

var FeaturedPosts = React.createClass( {
	getInitialState: function() {
		return {
			posts: []
		};
	},
	componentWillMount: function() {
		this.load();
	},
	load: function() {
		API.featured( function( posts ) {
			this.setState( { posts: posts } );
		}.bind( this ) );
	},
	onPostLike: function( post ) {
		API.like( post, function( updatedPost ) {
			this.setState( {
				posts: this.state.posts.map( function( post ) {
					if ( post.id === updatedPost.id ) {
						return updatedPost;
					}
					return post;
				} )
			} );
		}.bind( this ) );
	},
	render: function() {
		return <Posts posts={ this.state.posts } onPostLike={ this.onPostLike } />;
	}
} );

var LatestPosts = React.createClass( {
	propTypes: {
		children: React.PropTypes.element.isRequired
	},
	getInitialState: function() {
		return {
			posts: []
		};
	},
	componentWillMount: function() {
		this.load();
	},
	load: function() {
		API.latest( function( posts ) {
			this.setState( { posts: posts } );
		}.bind( this ) );
	},
	onPostLike: function( post ) {
		API.like( post, function( updatedPost ) {
			this.setState( {
				posts: this.state.posts.map( function( post ) {
					if ( post.id === updatedPost.id ) {
						return updatedPost;
					}
					return post;
				} )
			} );
		}.bind( this ) );
	},
	render: function() {
		return <Posts posts={ this.state.posts } onPostLike={ this.onPostLike } />;
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
