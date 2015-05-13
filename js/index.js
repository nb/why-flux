/** @jsx React.DOM */
var PostsStore = function() {
	this.posts = {};
	this.changeCallbacks = [];
};
PostsStore.prototype.get = function( id ) {
	return this.posts[ id ];
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
				<PostsData filter="featured">
					<Posts />
				</PostsData>
				<h1>Latest Posts</h1>
				<hr />
				<PostsData filter="latest">
					<Posts />
				</PostsData>
			</div>
		);
	}
} );

var postsStore = new PostsStore();

var PostsData = React.createClass( {
	getInitialState: function() {
		return {
			posts: []
		};
	},
	propTypes: {
		children: React.PropTypes.element.isRequired,
		filter: React.PropTypes.string
	},
	callByFilter: {
		featured: API.featured,
		latest: API.latest,
		default: API.latest
	},
	load: function() {
		var apiCall = this.callByFilter[ this.props.filter ] || this.callByFilter.default;
		apiCall( function( posts ) {
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
        } );
    },
	componentWillMount: function() {
		postsStore.registerChangeCallback( this.onPostChange );
		this.load();
	},
	onPostChange: function() {
		this.setState( {
			posts: this.state.postIds.map( postsStore.get.bind( postsStore ) )
		} );
	},
	render: function() {
		var childProps = {
			posts: this.state.posts,
			onPostLike: this.onPostLike
		};
		return React.addons.cloneWithProps( this.props.children, childProps );
	}
} );

var Posts = React.createClass( {
	render: function() {
		return (
			<div className="posts">
				{
					this.props.posts.map( function( post ) {
						return <Post key={ post.id } post={ post } onLike={ this.props.onPostLike }/>;
					}.bind( this ) )
				}
			</div>
		);
	}
} );

var Post = React.createClass( {
	onLike: function() {
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
