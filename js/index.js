/** @jsx React.DOM */
var API = {
	featured: function(cb) {
		cb( [
			{title: 'Best Scrambled Sunnyside ups', author: 'Willie Wonka'},
			{title: 'askjhd kjsahd akjshasdk', author: 'Peter Gabriel'}
		] );
	}
};

var App = React.createClass( {
	render: function() {
		return (
			<div>
				<FeaturedPosts />
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
		return (
			<div className="posts">
				{
					this.state.posts.map( function( post ) {
						return <Post post={ post } />;
					} )
				}
			</div>
		);
	}
} );

var Post = React.createClass( {
	render: function() {
		return (
			<section className="post">
				<h1>{ this.props.post.title }</h1>
				<h2>by { this.props.post.author }</h2>
			</section>
		);
	}
} );

React.render( <App/>, document.body );
