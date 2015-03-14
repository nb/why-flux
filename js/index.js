/** @jsx React.DOM */
var API = {
	featured: function(cb) {
		cb( [
			{title: 'Best Scrambled Sunnyside ups', author: 'Willie Wonka', likes: 5},
			{title: 'askjhd kjsahd akjshasdk', author: 'Peter Gabriel', likes: 2}
		] );
	},
	latest: function(cb) {
		cb( [
			{title: 'News is on the road', author: 'Willie Wonka', likes: 0},
			{title: 'Bobo is fun again', author: 'Peter Gabriel', likes: 1}
		] );
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
	render: function() {
		return <Posts posts={ this.state.posts } />;
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
	render: function() {
		return <Posts posts={ this.state.posts } />;
	}
} );

var Posts = React.createClass( {
	render: function() {
		return (
			<div className="posts">
				{
					this.props.posts.map( function( post ) {
						return <Post post={ post } />;
					} )
				}
			</div>
		);
	}
} );

var Post = React.createClass( {
	onLike: function() {
		alert( 'Like!' );
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
