// ShaderParticleEmitter 0.5.0
//
// (c) 2013 Luke Moody (http://www.github.com/squarefeet) & Lee Stemkoski (http://www.adelphi.edu/~stemkoski/)
//     Based on Lee Stemkoski's original work (https://github.com/stemkoski/stemkoski.github.com/blob/master/Three.js/js/ParticleEngine.js).
//
// ShaderParticleEmitter may be freely distributed under the MIT license (See LICENSE.txt)

function ShaderParticleEmitter( options ) {
    // If no options are provided, fallback to an empty object.
    options = options || {};

    // Helps with minification. Not as easy to read the following code,
    // but should still be readable enough!
    var that = this;

    that.particlesPerSecond     = typeof options.particlesPerSecond === 'number' ? options.particlesPerSecond : 100;
    that.type                   = (options.type === 'cube' || options.type === 'sphere' || options.type === 'disk') ? options.type : 'cube';

    that.position               = options.position instanceof THREE.Vector3 ? options.position : new THREE.Vector3();
    that.positionSpread         = options.positionSpread instanceof THREE.Vector3 ? options.positionSpread : new THREE.Vector3();

    // These two properties are only used when this.type === 'sphere'
    that.radius                 = typeof options.radius === 'number' ? options.radius : 10;
    that.radiusSpread           = typeof options.radiusSpread === 'number' ? options.radiusSpread : 0;
    that.radiusScale            = options.radiusScale instanceof THREE.Vector3 ? options.radiusScale : new THREE.Vector3(1, 1, 1);

    that.acceleration           = options.acceleration instanceof THREE.Vector3 ? options.acceleration : new THREE.Vector3();
    that.accelerationSpread     = options.accelerationSpread instanceof THREE.Vector3 ? options.accelerationSpread : new THREE.Vector3();

    that.velocity               = options.velocity instanceof THREE.Vector3 ? options.velocity : new THREE.Vector3();
    that.velocitySpread         = options.velocitySpread instanceof THREE.Vector3 ? options.velocitySpread : new THREE.Vector3();

    // And again here; only used when this.type === 'sphere' or 'disk'
    that.speed                  = parseFloat( typeof options.speed === 'number' ? options.speed : 0, 10 );
    that.speedSpread            = parseFloat( typeof options.speedSpread === 'number' ? options.speedSpread : 0, 10 );

    that.sizeStart              = parseFloat( typeof options.sizeStart === 'number' ? options.sizeStart : 10.0, 10 );
    that.sizeStartSpread        = parseFloat( typeof options.sizeStartSpread === 'number' ? options.sizeStartSpread : 0, 10 );
    that.sizeEnd                = parseFloat( typeof options.sizeEnd === 'number' ? options.sizeEnd : that.sizeStart, 10 );

	that.angle                  = parseFloat( typeof options.angle === 'number' ? options.angle : 0, 10 );
    that.angleSpread            = parseFloat( typeof options.angleSpread === 'number' ? options.angleSpread : 0, 10 );
    that.angleVelocity          = parseFloat( typeof options.angleVelocity === 'number' ? options.angleVelocity : 0, 10 );
    that.angleAlignVelocity     = options.angleAlignVelocity || false;

    that.colorStart             = options.colorStart instanceof THREE.Color ? options.colorStart : new THREE.Color( 'blue' );
    that.colorStartSpread       = options.colorStartSpread instanceof THREE.Vector3 ? options.colorStartSpread : new THREE.Vector3(0,0,0);
    that.colorEnd               = options.colorEnd instanceof THREE.Color ? options.colorEnd : that.colorStart.clone();
	that.colorMiddle			= options.colorMiddle instanceof THREE.Color ? options.colorMiddle : 
		new THREE.Color().addColors( that.colorStart, that.colorEnd ).multiplyScalar( 0.5 );
		
    that.opacityStart           = parseFloat( typeof options.opacityStart !== 'undefined' ? options.opacityStart : 1, 10 );
    that.opacityEnd             = parseFloat( typeof options.opacityEnd === 'number' ? options.opacityEnd : 0, 10 );
    that.opacityMiddle          = parseFloat(
        typeof options.opacityMiddle !== 'undefined' ?
        options.opacityMiddle :
        Math.abs(that.opacityEnd + that.opacityStart) / 2,
    10 );

    that.emitterDuration        = typeof options.emitterDuration === 'number' ? options.emitterDuration : null;
    that.alive                  = parseInt( typeof options.alive === 'number' ? options.alive : 1, 10);

    that.static                 = typeof options.static === 'number' ? options.static : 0;

    // The following properties are used internally, and mostly set when this emitter
    // is added to a particle group.
    that.numParticles           = 0;
    that.attributes             = null;
    that.vertices               = null;
    that.verticesIndex          = 0;
    that.age                    = 0.0;
    that.maxAge                 = 0.0;

    that.particleIndex = 0.0;

    that.userData = {};
}


ShaderParticleEmitter.prototype = {

    /**
     * Reset a particle's position. Accounts for emitter type and spreads.
     *
     * @private
     *
     * @param  {THREE.Vector3} p
     */
    _resetParticle: function( i ) {
        var that = this;
            type = that.type,
            spread = that.positionSpread,
			particlePosition = that.vertices[i],
			particleVelocity = that.attributes.velocity.value[i];

        // Optimise for no position spread or radius
        if(
            ( type === 'cube' && spread.x === 0 && spread.y === 0 && spread.z === 0 ) ||
            ( type === 'sphere' && that.radius === 0 ) ||
            ( type === 'disk' && that.radius === 0 )
        ) {
            particlePosition.copy( that.position );
        }

        // If there is a position spread, then get a new position based on this spread.
        else if( type === 'cube' ) {
            that._randomizeExistingVector3( particlePosition, that.position, spread );
        }

        else if( type === 'sphere') {
            that._randomizeExistingVector3OnSphere( particlePosition, that.position, that.radius, that.radiusSpread, that.radiusScale );
			that._randomizeExistingVelocityVector3OnSphere( particleVelocity, that.position, particlePosition, that.speed, that.speedSpread );
        }

        else if( type === 'disk') {
            that._randomizeExistingVector3OnDisk( particlePosition, that.position, that.radius, that.radiusSpread, that.radiusScale );
			that._randomizeExistingVelocityVector3OnSphere( particleVelocity, that.position, particlePosition, that.speed, that.speedSpread );
        }

		if (that.angleAlignVelocity) {
			that.attributes.angle.value[i] = -Math.atan2(particleVelocity.y, particleVelocity.x);
        }

    },

	/**
     * Create a random Number value based on an initial value and
     * a spread range
     *
     * @private
     *
     * @param  {Number} base
     * @param  {Number} spread
     * @return {Number}
     */
    _randomFloat: function( base, spread ) {
        return base + spread * (Math.random() - 0.5);
    },

    /**
     * Given an existing particle vector, randomise it based on base and spread vectors
     *
     * @private
     *
     * @param  {THREE.Vector3} v
     * @param  {THREE.Vector3} base
     * @param  {THREE.Vector3} spread
     */
    _randomizeExistingVector3: function( v, base, spread ) {
        var r = Math.random;

        v.copy( base );

        v.x += r() * spread.x - (spread.x/2);
        v.y += r() * spread.y - (spread.y/2);
        v.z += r() * spread.z - (spread.z/2);
    },


    /**
     * Given an existing particle vector, project it onto a random point on a
     * sphere with radius `radius` and position `base`.
     *
     * @private
     *
     * @param  {THREE.Vector3} v
     * @param  {THREE.Vector3} base
     * @param  {Number} radius
     */
    _randomizeExistingVector3OnSphere: function( v, base, radius, radiusSpread, radiusScale ) {
        var rand = Math.random,
            z = 2 * rand() - 1,
            t = 6.2832 * rand(),
            r = Math.sqrt( 1 - z*z ),
            randomRadius = this._randomFloat( radius, radiusSpread );

        v.set(
            (r * Math.cos(t)) * randomRadius,
            (r * Math.sin(t)) * randomRadius,
            z * randomRadius
        ).multiply( radiusScale );

        v.add( base );
    },

    /**
     * Given an existing particle vector, project it onto a random point
     * on a disk (in the XY-plane) centered at `base` and with radius `radius`.
     *
     * @private
     *
     * @param  {THREE.Vector3} v
     * @param  {THREE.Vector3} base
     * @param  {Number} radius
     */
    _randomizeExistingVector3OnDisk: function( v, base, radius, radiusSpread, radiusScale ) {
        var rand = Math.random,
            t = 6.2832 * rand(),
            randomRadius = this._randomFloat( radius, radiusSpread );

        v.set(
            Math.cos( t ),
            Math.sin( t ),
            0
        ).multiplyScalar( randomRadius );

		if ( radiusScale ) {
			v.multiply( radiusScale );
		}

        v.add( base );
    },

	_randomizeExistingVelocityVector3OnSphere: function( v, base, position, speed, speedSpread ) {
        v.copy(position)
            .sub(base)
            .normalize()
            .multiplyScalar( this._randomFloat( speed, speedSpread ) );
    },

    // This function is called by the instance of `ShaderParticleEmitter` that
    // this emitter has been added to.
    /**
     * Update this emitter's particle's positions. Called by the ShaderParticleGroup
     * that this emitter belongs to.
     *
     * @param  {Number} dt
     */
    tick: function( dt ) {

        if( this.static ) {
            return;
        }

        // Cache some values for quicker access in loops.
        var that = this,
            a = that.attributes,
            alive = a.alive.value,
            age = a.age.value,
            start = that.verticesIndex,
            numParticles = that.numParticles,
            end = start + numParticles,
            pps = that.particlesPerSecond,
            ppsdt = pps * dt,
            m = that.maxAge,
            emitterAge = that.age,
            duration = that.emitterDuration,
            pIndex = that.particleIndex;

        // Loop through all the particles in this emitter and
        // determine whether they're still alive and need advancing
        // or if they should be dead and therefore marked as such
        // and pushed into the recycled vertices array for reuse.
        for( var i = start; i < end; ++i ) {
            if( alive[ i ] === 1.0 ) {
                age[ i ] += dt;
            }

            if( age[ i ] >= m ) {
                age[ i ] = 0.0;
                alive[ i ] = 0.0;
            }
        }

        // If the emitter is dead, reset any particles that are in
        // the recycled vertices array and reset the age of the
        // emitter to zero ready to go again if required, then
        // exit this function.
        if( that.alive === 0 ) {
            that.age = 0.0;
            return;
        }

        // If the emitter has a specified lifetime and we've exceeded it,
        // mark the emitter as dead and exit this function.
        if( typeof duration === 'number' && emitterAge > duration ) {
            that.alive = 0;
            that.age = 0.0;
            return;
        }

        var n = Math.min( end, pIndex + ppsdt );

        for( i = pIndex | 0; i < n; ++i ) {
            if( alive[ i ] !== 1.0 ) {
                alive[ i ] = 1.0;
                that._resetParticle( i );
            }
        }

        that.particleIndex += ppsdt;

        if( pIndex >= start + that.numParticles ) {
            that.particleIndex = parseFloat( start, 10 );
        }

        // Add the delta time value to the age of the emitter.
        that.age += dt;
    },

    /**
     * Reset this emitter back to its starting position.
     * If `force` is truthy, then reset all particles in this
     * emitter as well, even if they're currently alive.
     *
     * @param  {Boolean} force
     * @return {this}
     */
    reset: function( force ) {
        var that = this;

        that.age = 0.0;
        that.alive = 0;

        if( force ) {
            var start = that.verticesIndex,
                end = that.verticesIndex + that.numParticles,
                a = that.attributes,
                alive = a.alive.value,
                age = a.age.value;

            for( var i = start; i < end; ++i ) {
                alive[ i ] = 0.0;
                age[ i ] = 0.0;
            }
        }

        return that;
    },


    /**
     * Enable this emitter.
     */
    enable: function() {
        this.alive = 1;
    },

    /**
     * Disable this emitter.
     */
    disable: function() {
        this.alive = 0;
    }
};
