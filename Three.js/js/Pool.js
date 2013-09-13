function Pool( numItems, object, creationArgument ) {
	var store = [];

	this.get = function() {
		if(store.length) {
			return store.pop();
		}
		else {
			return new object( creationArgument );
		}
	};

	this.release = function( o ) {
		this.reset( o );
		store.unshift( o );
	};

	this.reset = function() {};

	this.getLength = function() {
		return store.length;
	};

	this.getStore = function() {
		return store;
	};

	for( var i = 0, o; i < numItems; ++i ) {
		o = new object( creationArgument );
		store.push( o );
	}
}