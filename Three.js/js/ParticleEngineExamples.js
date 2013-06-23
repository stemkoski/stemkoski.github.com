/**
* @author Lee Stemkoski   http://www.adelphi.edu/~stemkoski/
*/

/* 
	Particle Engine options:
	
	positionBase   : new THREE.Vector3(),
	positionStyle : Type.CUBE or Type.SPHERE,

	// for Type.CUBE
	positionSpread  : new THREE.Vector3(),

	// for Type.SPHERE
	positionRadius  : 10,
	
	velocityStyle : Type.CUBE or Type.SPHERE,

	// for Type.CUBE
	velocityBase       : new THREE.Vector3(),
	velocitySpread     : new THREE.Vector3(), 

	// for Type.SPHERE
	speedBase   : 20,
	speedSpread : 10,
		
	accelerationBase   : new THREE.Vector3(),
	accelerationSpread : new THREE.Vector3(),
		
	particleTexture : THREE.ImageUtils.loadTexture( 'images/star.png' ),
		
	// rotation of image used for particles
	angleBase               : 0,
	angleSpread             : 0,
	angleVelocityBase       : 0,
	angleVelocitySpread     : 0,
	angleAccelerationBase   : 0,
	angleAccelerationSpread : 0,
		
	// size, color, opacity 
	//   for static  values, use base/spread
	//   for dynamic values, use Tween
	//   (non-empty Tween takes precedence)
	sizeBase   : 20.0,
	sizeSpread : 5.0,
	sizeTween  : new Tween( [0, 1], [1, 20] ),
			
	// colors stored in Vector3 in H,S,L format
	colorBase   : new THREE.Vector3(0.0, 1.0, 0.5),
	colorSpread : new THREE.Vector3(0,0,0),
	colorTween  : new Tween( [0.5, 2], [ new THREE.Vector3(0, 1, 0.5), new THREE.Vector3(1, 1, 0.5) ] ),

	opacityBase   : 1,
	opacitySpread : 0,
	opacityTween  : new Tween( [2, 3], [1, 0] ),
	
	blendStyle    : THREE.NormalBlending (default), THREE.AdditiveBlending

	particlesPerSecond : 200,
	particleDeathAge   : 2.0,		
	emitterDeathAge    : 60	
*/

Examples =
{

	
	// (1) build GUI for easy effects access.
	// (2) write ParticleEngineExamples.js
	
	// Not just any fountain -- a RAINBOW STAR FOUNTAIN of AWESOMENESS
	fountain :
	{
		positionStyle    : Type.CUBE,
		positionBase     : new THREE.Vector3( 0,  5, 0 ),
		positionSpread   : new THREE.Vector3( 10, 0, 10 ),
		
		velocityStyle    : Type.CUBE,
		velocityBase     : new THREE.Vector3( 0,  160, 0 ),
		velocitySpread   : new THREE.Vector3( 100, 20, 100 ), 

		accelerationBase : new THREE.Vector3( 0, -100, 0 ),
		
		particleTexture : THREE.ImageUtils.loadTexture( 'images/star.png' ),

		angleBase               : 0,
		angleSpread             : 180,
		angleVelocityBase       : 0,
		angleVelocitySpread     : 360 * 4,
		
		sizeTween    : new Tween( [0, 1], [1, 20] ),
		opacityTween : new Tween( [2, 3], [1, 0] ),
		colorTween   : new Tween( [0.5, 2], [ new THREE.Vector3(0,1,0.5), new THREE.Vector3(0.8, 1, 0.5) ] ),

		particlesPerSecond : 200,
		particleDeathAge   : 3.0,		
		emitterDeathAge    : 60
	},

	fireball :
	{
		positionStyle  : Type.SPHERE,
		positionBase   : new THREE.Vector3( 0, 50, 0 ),
		positionRadius : 2,
				
		velocityStyle : Type.SPHERE,
		speedBase     : 40,
		speedSpread   : 8,
		
		particleTexture : THREE.ImageUtils.loadTexture( 'images/smokeparticle.png' ),

		sizeTween    : new Tween( [0, 0.1], [1, 150] ),
		opacityTween : new Tween( [0.7, 1], [1, 0] ),
		colorBase    : new THREE.Vector3(0.02, 1, 0.4),
		blendStyle   : THREE.AdditiveBlending,  
		
		particlesPerSecond : 60,
		particleDeathAge   : 1.5,		
		emitterDeathAge    : 60
	},
	
	smoke :
	{
		positionStyle    : Type.CUBE,
		positionBase     : new THREE.Vector3( 0, 0, 0 ),
		positionSpread   : new THREE.Vector3( 10, 0, 10 ),

		velocityStyle    : Type.CUBE,
		velocityBase     : new THREE.Vector3( 0, 150, 0 ),
		velocitySpread   : new THREE.Vector3( 80, 50, 80 ), 
		accelerationBase : new THREE.Vector3( 0,-10,0 ),
		
		particleTexture : THREE.ImageUtils.loadTexture( 'images/smokeparticle.png'),

		angleBase               : 0,
		angleSpread             : 720,
		angleVelocityBase       : 0,
		angleVelocitySpread     : 720,
		
		sizeTween    : new Tween( [0, 1], [32, 128] ),
		opacityTween : new Tween( [0.8, 2], [0.5, 0] ),
		colorTween   : new Tween( [0.4, 1], [ new THREE.Vector3(0,0,0.2), new THREE.Vector3(0, 0, 0.5) ] ),

		particlesPerSecond : 200,
		particleDeathAge   : 2.0,		
		emitterDeathAge    : 60
	},
	
	clouds :
	{
		positionStyle  : Type.CUBE,
		positionBase   : new THREE.Vector3( -100, 100,  0 ),
		positionSpread : new THREE.Vector3(    0,  50, 60 ),
		
		velocityStyle  : Type.CUBE,
		velocityBase   : new THREE.Vector3( 40, 0, 0 ),
		velocitySpread : new THREE.Vector3( 20, 0, 0 ), 
		
		particleTexture : THREE.ImageUtils.loadTexture( 'images/smokeparticle.png'),

		sizeBase     : 80.0,
		sizeSpread   : 100.0,
		colorBase    : new THREE.Vector3(0.0, 0.0, 1.0), // H,S,L
		opacityTween : new Tween([0,1,4,5],[0,1,1,0]),

		particlesPerSecond : 50,
		particleDeathAge   : 10.0,		
		emitterDeathAge    : 60
	},
		
	snow :
	{
		positionStyle    : Type.CUBE,
		positionBase     : new THREE.Vector3( 0, 200, 0 ),
		positionSpread   : new THREE.Vector3( 500, 0, 500 ),
		
		velocityStyle    : Type.CUBE,
		velocityBase     : new THREE.Vector3( 0, -60, 0 ),
		velocitySpread   : new THREE.Vector3( 50, 20, 50 ), 
		accelerationBase : new THREE.Vector3( 0, -10,0 ),
		
		angleBase               : 0,
		angleSpread             : 720,
		angleVelocityBase       :  0,
		angleVelocitySpread     : 60,
		
		particleTexture : THREE.ImageUtils.loadTexture( 'images/snowflake.png' ),
			
		sizeTween    : new Tween( [0, 0.25], [1, 10] ),
		colorBase   : new THREE.Vector3(0.66, 1.0, 0.9), // H,S,L
		opacityTween : new Tween( [2, 3], [0.8, 0] ),

		particlesPerSecond : 200,
		particleDeathAge   : 4.0,		
		emitterDeathAge    : 60
	},
	
	rain :
	{
		positionStyle    : Type.CUBE,
		positionBase     : new THREE.Vector3( 0, 200, 0 ),
		positionSpread   : new THREE.Vector3( 600, 0, 600 ),

		velocityStyle    : Type.CUBE,
		velocityBase     : new THREE.Vector3( 0, -400, 0 ),
		velocitySpread   : new THREE.Vector3( 10, 50, 10 ), 
		accelerationBase : new THREE.Vector3( 0, -10,0 ),
		
		particleTexture : THREE.ImageUtils.loadTexture( 'images/raindrop2flip.png' ),

		sizeBase    : 8.0,
		sizeSpread  : 4.0,
		colorBase   : new THREE.Vector3(0.66, 1.0, 0.7), // H,S,L
		colorSpread : new THREE.Vector3(0.00, 0.0, 0.2),
		opacityBase : 0.6,

		particlesPerSecond : 1000,
		particleDeathAge   : 1.0,		
		emitterDeathAge    : 60
	},
		
	starfield :
	{
		positionStyle    : Type.CUBE,
		positionBase     : new THREE.Vector3( 0, 200, 0 ),
		positionSpread   : new THREE.Vector3( 600, 400, 600 ),

		velocityStyle    : Type.CUBE,
		velocityBase     : new THREE.Vector3( 0, 0, 0 ),
		velocitySpread   : new THREE.Vector3( 0.5, 0.5, 0.5 ), 
		
		angleBase               : 0,
		angleSpread             : 720,
		angleVelocityBase       : 0,
		angleVelocitySpread     : 4,

		particleTexture : THREE.ImageUtils.loadTexture( 'images/spikey.png' ),
		
		sizeBase    : 10.0,
		sizeSpread  : 2.0,				
		colorBase   : new THREE.Vector3(0.15, 1.0, 0.9), // H,S,L
		colorSpread : new THREE.Vector3(0.00, 0.0, 0.2),
		opacityBase : 1,

		particlesPerSecond : 20000,
		particleDeathAge   : 60.0,		
		emitterDeathAge    : 0.1
	},

	fireflies :
	{
		positionStyle  : Type.CUBE,
		positionBase   : new THREE.Vector3( 0, 100, 0 ),
		positionSpread : new THREE.Vector3( 400, 200, 400 ),

		velocityStyle  : Type.CUBE,
		velocityBase   : new THREE.Vector3( 0, 0, 0 ),
		velocitySpread : new THREE.Vector3( 60, 20, 60 ), 
		
		particleTexture : THREE.ImageUtils.loadTexture( 'images/spark.png' ),

		sizeBase   : 30.0,
		sizeSpread : 2.0,
		opacityTween : new Tween([0.0, 1.0, 1.1, 2.0, 2.1, 3.0, 3.1, 4.0, 4.1, 5.0, 5.1, 6.0, 6.1],
		                         [0.2, 0.2, 1.0, 1.0, 0.2, 0.2, 1.0, 1.0, 0.2, 0.2, 1.0, 1.0, 0.2] ),				
		colorBase   : new THREE.Vector3(0.30, 1.0, 0.6), // H,S,L
		colorSpread : new THREE.Vector3(0.3, 0.0, 0.0),

		particlesPerSecond : 20,
		particleDeathAge   : 6.1,		
		emitterDeathAge    : 600
	},
	
	startunnel :
	{
		positionStyle  : Type.CUBE,
		positionBase   : new THREE.Vector3( 0, 0, 0 ),
		positionSpread : new THREE.Vector3( 10, 10, 10 ),

		velocityStyle  : Type.CUBE,
		velocityBase   : new THREE.Vector3( 0, 100, 200 ),
		velocitySpread : new THREE.Vector3( 40, 40, 80 ), 
		
		angleBase               : 0,
		angleSpread             : 720,
		angleVelocityBase       : 10,
		angleVelocitySpread     : 0,
		
		particleTexture : THREE.ImageUtils.loadTexture( 'images/spikey.png' ),

		sizeBase    : 4.0,
		sizeSpread  : 2.0,				
		colorBase   : new THREE.Vector3(0.15, 1.0, 0.8), // H,S,L
		opacityBase : 1,
		blendStyle  : THREE.AdditiveBlending,

		particlesPerSecond : 500,
		particleDeathAge   : 4.0,		
		emitterDeathAge    : 60
	},

	firework :
	{
		positionStyle  : Type.SPHERE,
		positionBase   : new THREE.Vector3( 0, 100, 0 ),
		positionRadius : 10,
		
		velocityStyle  : Type.SPHERE,
		speedBase      : 90,
		speedSpread    : 10,
		
		accelerationBase : new THREE.Vector3( 0, -80, 0 ),
		
		particleTexture : THREE.ImageUtils.loadTexture( 'images/spark.png' ),
		
		sizeTween    : new Tween( [0.5, 0.7, 1.3], [5, 40, 1] ),
		opacityTween : new Tween( [0.2, 0.7, 2.5], [0.75, 1, 0] ),
		colorTween   : new Tween( [0.4, 0.8, 1.0], [ new THREE.Vector3(0,1,1), new THREE.Vector3(0,1,0.6), new THREE.Vector3(0.8, 1, 0.6) ] ),
		blendStyle   : THREE.AdditiveBlending,  
		
		particlesPerSecond : 3000,
		particleDeathAge   : 2.5,		
		emitterDeathAge    : 0.2
	},

    candle :
	{
		positionStyle  : Type.SPHERE,
		positionBase   : new THREE.Vector3( 0, 50, 0 ),
		positionRadius : 2,
		
		velocityStyle  : Type.CUBE,
		velocityBase   : new THREE.Vector3(0,100,0),
		velocitySpread : new THREE.Vector3(20,0,20),
		
		particleTexture : THREE.ImageUtils.loadTexture( 'images/smokeparticle.png' ),
		
		sizeTween    : new Tween( [0, 0.3, 1.2], [20, 150, 1] ),
		opacityTween : new Tween( [0.9, 1.5], [1, 0] ),
		colorTween   : new Tween( [0.5, 1.0], [ new THREE.Vector3(0.02, 1, 0.5), new THREE.Vector3(0.05, 1, 0) ] ),
		blendStyle : THREE.AdditiveBlending,  
		
		particlesPerSecond : 60,
		particleDeathAge   : 1.5,		
		emitterDeathAge    : 60
	}
	
}