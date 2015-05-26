# To Flux

Let’s build a simple blogging app, powered by an external API, using React.

## Listing Latests Posts

The main low-level building block will be a simple stateless `Post` component:

```javascript
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
```

We then build upon it to a `LatestPosts` component that loads the list of posts, keeps them in its internal state, and renders them:

```javascript
var LatestPosts = React.createClass( {
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
        return (
            <div className="posts">
                {
                    this.state.posts.map( function( post ) {
                        return <Post key={ post.id } post={ post } />;
                    } )
                }
            </div>
        );
    }
} );
```

## Featured Posts and Controller Views

We would like now to be able to pin or feature posts on the homepage and show them alongside the most recent ones. We can retrieve them via the `API.featured` async call. Unfortunately when we give implementing `FeaturedPosts` a try, it turns out that it’s the same as `LatestPosts`, just using a different API call.

The reason of the duplication is that our `*Posts` components are trying to do too much – loading data, keeping it in its state, and rendering it. Let’s try separating the rendering from loading the data.

We will keep the `Posts` component simple and stateless, it will receive its data from a parent component, responsible for fetching the data (TODO: link to a decent higher-order components blog post).

Ideally, the code for rendering the featured and latest posts, respectively would look something like this:

```javascript
<PostsData filter="latest">
  // the "posts" prop will be added automatically
  <Posts />
</PostsData>

<PostsData filter="featured">
  // we can add arbitrary props if we want
  <Posts onLike={ … } />
</PostsData>
```

The parent component provides the data, while its children can decide how to render it.

The implementation of `PostData` is simple, especially since React offers us `cloneWithProps` – perfect for adding the `posts` prop to all children:

```javascript
var PostsData = React.createClass( {
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
				posts: posts
			} );
		}.bind( this ) );
	},
	componentWillMount: function() {
		this.load();
	},
	render: function() {
    // will merge the children’s props with our state
		return React.addons.cloneWithProps( this.props.children, this.state );
	}
} );
```

Now we can have a very simple, short, sweet, and stateless `Posts` component:

```javascript
var Posts = React.createClass( {
	render: function() {
		return (
			<div className="posts">
				{
					this.props.posts.map( function( post ) {
						return <Post key={ post.id } post={ post } />;
					} )
				}
			</div>
		);
	}
} );
```

Since the data components have functionality similar to a classic controller, let’s call them **controller-views**. A big advantage over classic controllers is that we can use them at any level of our component hierarchy, not only at the top. Some routing systems like [react-router](TODO) are more flexible with nesting controllers.

## Feature: Likes

How would our friends know we’ve read a post if we haven’t liked it?

Adding likes to the UI is straight-foward. Our `Post` component now accepts an `onLike` callback via its props and renders the number of likes (now part of the each post object) and a “Like” button, which triggers the callback:

```javascript
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
```

The API side is also simple. We will add a new `API.like( postId, callback)` method, which likes a post and passes the updated post contents to the post. Let’s try integrating likes with the controller views.

Fetching the remote data will happen in the data component. So we will implement a `onPostLike` method and pass it to all the children (in our case the `Posts` component), which will in turn pass it to the `Post` components.

First, here is the `onPostLike` method of `PostsData`, which kicks off a remote request and updates the state with the new value of the post, including the updated like count:

```javascript
var PostsData = React.createClass( {
    …
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
```

Here is the new `render` method of `PostsData`, it adds the like callback to the props for the child of the data component (in our case `Posts`):

```javascript
var PostsData = React.createClass( {
  …
  render: function() {
    var childProps = {
      posts: this.state.posts
      onPostLike: this.onPostLike
    };
    return React.addons.cloneWithProps( this.props.children, childProps );
  },
```

…and the updated `Posts`, which just passes the callback down the chain to the singe `Post` component:

```javascript
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
```

All looks good. Can you spot the bug?

That’s right – if a post is in both the “featured” and “recent” lists and we like it, the count doesn’t update in the other list.

## Flux: Object Stores

With increasing application complexity, having multiple data sources quickly leads to out-of-sync issues, just like the like counts example above. If we had a central place to keep posts it would solve the problem – any part of the application could reference the same data and this central “store” would notify the controller views that the data changed. This way we will have a master copy of each post and all of its occurrences will be in sync.

Let’s call this central place a “store” and for simplicity’s sake, let’s use it only as a dumb storage with a single `change` event. We will keep the remote requests code and more granular events out for the store for now.

Here is a sample implementation. Three are three public methods:

* `get( id )` retrieves a single post by ID
* `registerChangeCallback( callback )` adds a listener, fired if anything in the store changes
* `merge( posts )` for bringing in new posts to the store – this is the only way to update the store without going through a back-door (manually editing the property)

```javascript
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
```

Here is also the updated `PostsData` controller-view, which will be listening for store changes.

* When a requests succeeds we pass the full objects to the store and keep only the IDs
* We need the IDs so that when a single post is updated in the store and we are notified, we will know how to recreate the list of posts
* In order to simplify re-rendering and enable optimizations, we will keep a shallow copy of the full objects in the state. Otherwise we will need to call `forceUpdate()`.

```javascript
var PostsData = React.createClass( {
  …
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
	componentWillMount: function() {
		postsStore.registerChangeCallback( this.onPostChange );
		this.load();
	},
	onPostChange: function() {
		this.setState( {
			posts: this.state.postIds.map( postsStore.get.bind( postsStore ) )
		} );
	},
  onPostLike: function( post ) {
      API.like( post.id, function( updatedPost ) {
          postsStore.merge( [ updatedPost ] );
      } );
  },
  …
} );
```

## Dependent stores

## Actions in stores

## Action touching multiple stores

## A store used in many actions

Users – they are returned everywhere. If we need to add a dependent store, we will have to touch many many actions.
