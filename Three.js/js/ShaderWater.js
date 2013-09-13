/**
 * @author Slayvin / http://slayvin.net
 * @author Stemkoski / http://www.adelphi.edu/~stemkoski
 */

THREE.ShaderLib['mirror'] = {

	uniforms: { "mirrorColor": { type: "c", value: new THREE.Color(0x7F7F7F) },
				"mirrorSampler": { type: "t", value: null },
				"baseTexture": 	{ type: "t", value: null },
				"baseSpeed": 	{ type: "f", value: 0.05 },
				"noiseTexture": { type: "t", value: null },
				"noiseScale": 	{ type: "f", value: 0.05337 },
				"alpha": 		{ type: "f", value: 1.0 },
				"time": 		{ type: "f", value: 0.0 },
				
				"textureMatrix" : { type: "m4", value: new THREE.Matrix4() }
	},

	vertexShader: [

		"uniform mat4 textureMatrix;",

		"varying vec4 mirrorCoord;",
		"varying vec2 vUV;",
		
		"uniform sampler2D noiseTexture;",
		"uniform float time;",
		//"uniform float bumpSpeed;",
		//"uniform float bumpScale;",


		"void main() {",
			"vUV = uv;",
			
			
			"vec2 uvTimeShift = vUV + vec2( 1.1, 1.9 ) * time * 0.15;", // bumpSpeed;",
			"vec4 bumpData = texture2D( noiseTexture, uvTimeShift );",
			
			"float displacement = bumpData.g * 50.0;", // bumpScale
			"vec3 bumpedPosition = position + normal * displacement;",
	
			"vec4 mvPosition = modelViewMatrix * vec4( bumpedPosition, 1.0 );",
			"vec4 worldPosition = modelMatrix * vec4( position, 1.0 );",
			"mirrorCoord = textureMatrix * worldPosition;",

			"gl_Position = projectionMatrix * mvPosition;",

		"}"

	].join("\n"),

	fragmentShader: [

		"uniform vec3 mirrorColor;",
		"uniform sampler2D mirrorSampler;",

		"uniform sampler2D baseTexture;", // 337
		"uniform float baseSpeed;",
		"uniform sampler2D noiseTexture;",
		"uniform float noiseScale;",
		"uniform float alpha;",
		"uniform float time;",

		"varying vec4 mirrorCoord;",
		"varying vec2 vUV;",
		
		"float blendOverlay(float base, float blend) {",
			"return( base < 0.5 ? ( 2.0 * base * blend ) : (1.0 - 2.0 * ( 1.0 - base ) * ( 1.0 - blend ) ) );",
		"}",
		
		"void main() {",

			"vec4 color = texture2DProj(mirrorSampler, mirrorCoord);",
			"color = vec4(blendOverlay(mirrorColor.r, color.r), blendOverlay(mirrorColor.g, color.g), blendOverlay(mirrorColor.b, color.b), 1.0);",
			"color.a = alpha;", // 337
			
			"vec2 uvTimeShift = vUV + vec2( -0.7, 1.5 ) * time * baseSpeed;",
			"vec4 noiseGeneratorTimeShift = texture2D( noiseTexture, uvTimeShift );",
			"vec2 uvNoiseTimeShift = vUV + noiseScale * vec2( noiseGeneratorTimeShift.r, noiseGeneratorTimeShift.b );",
			"vec4 baseColor = texture2D( baseTexture, uvNoiseTimeShift );",

			// "gl_FragColor = color;",
			// "gl_FragColor = texture2D( overlayTexture, vUV );",
			"gl_FragColor = baseColor * 0.5 + color * 0.5;",
			

		"}"

	].join("\n")

};

THREE.FlatMirror = function ( renderer, camera, options ) {

	THREE.Object3D.call( this );
	this.name = 'flatMirror_' + this.id;

	function isPowerOfTwo ( value ) {
		return ( value & ( value - 1 ) ) === 0;
	};

	options = options || {};

	this.matrixNeedsUpdate = true;

	var width = options.textureWidth !== undefined ? options.textureWidth : 512;
	var height = options.textureHeight !== undefined ? options.textureHeight : 512;

	this.clipBias = options.clipBias !== undefined ? options.clipBias : 0.0;

	var mirrorColor = options.color !== undefined ? new THREE.Color(options.color) : new THREE.Color(0x7F7F7F);

	this.baseTexture = options.baseTexture !== undefined ? options.baseTexture : null;
	this.baseSpeed = options.baseSpeed !== undefined ? options.baseSpeed : 0.5;
	this.noiseTexture = options.noiseTexture !== undefined ? options.noiseTexture : null;
	this.noiseScale = options.noiseScale !== undefined ? options.noiseScale : 0.5337;
	this.alpha = options.alpha !== undefined ? options.alpha : 1.0;
	this.time = options.time !== undefined ? options.time : 0.0;
	
	this.renderer = renderer;
	this.mirrorPlane = new THREE.Plane();
	this.normal = new THREE.Vector3( 0, 0, 1 );
	this.mirrorWorldPosition = new THREE.Vector3();
	this.cameraWorldPosition = new THREE.Vector3();
	this.rotationMatrix = new THREE.Matrix4();
	this.lookAtPosition = new THREE.Vector3(0, 0, -1);
	this.clipPlane = new THREE.Vector4();
	
	// For debug only, show the normal and plane of the mirror
	var debugMode = options.debugMode !== undefined ? options.debugMode : false;
	if (debugMode){
		var arrow = new THREE.ArrowHelper(new THREE.Vector3( 0, 0, 1 ), new THREE.Vector3( 0, 0, 0 ), 10, 0xffff80 );
		var planeGeometry = new THREE.Geometry();
		planeGeometry.vertices.push( new THREE.Vector3( -10, -10, 0 ) );
		planeGeometry.vertices.push( new THREE.Vector3( 10, -10, 0 ) );
		planeGeometry.vertices.push( new THREE.Vector3( 10, 10, 0 ) );
		planeGeometry.vertices.push( new THREE.Vector3( -10, 10, 0 ) );
		planeGeometry.vertices.push( planeGeometry.vertices[0] );
		var plane = new THREE.Line( planeGeometry, new THREE.LineBasicMaterial( { color: 0xffff80 } ) );

		this.add(arrow);
		this.add(plane);
	}

	if ( camera instanceof THREE.PerspectiveCamera )
		this.camera = camera;
	else {
		this.camera = new THREE.PerspectiveCamera();
		console.log(this.name + ': camera is not a Perspective Camera!')
	}

	this.textureMatrix = new THREE.Matrix4();

	this.mirrorCamera = this.camera.clone();

	this.texture = new THREE.WebGLRenderTarget( width, height );
	this.tempTexture = new THREE.WebGLRenderTarget( width, height );

	var mirrorShader = THREE.ShaderLib[ "mirror" ];
	var mirrorUniforms = THREE.UniformsUtils.clone( mirrorShader.uniforms );

	this.material = new THREE.ShaderMaterial( { 
		fragmentShader: mirrorShader.fragmentShader, 
		vertexShader: mirrorShader.vertexShader, 
		uniforms: mirrorUniforms,
		transparent: true
	} );

	this.material.uniforms.mirrorSampler.value = this.texture;
	this.material.uniforms.mirrorColor.value = mirrorColor;
	this.material.uniforms.textureMatrix.value = this.textureMatrix;
	this.material.uniforms.baseTexture.value = this.baseTexture;
	this.material.uniforms.baseSpeed.value = this.baseSpeed;
	this.material.uniforms.noiseTexture.value = this.noiseTexture;
	this.material.uniforms.noiseScale.value = this.noiseScale;
	this.material.uniforms.alpha.value = this.alpha;
	this.material.uniforms.time.value = this.time;
	
	if ( !isPowerOfTwo(width) || !isPowerOfTwo(height) ) {
		this.texture.generateMipmaps = false;
		this.tempTexture.generateMipmaps = false;
	}

	this.updateTextureMatrix();
	this.render();

};

THREE.FlatMirror.prototype = Object.create( THREE.Object3D.prototype );

THREE.FlatMirror.prototype.renderWithMirror = function (otherMirror) {

	// update the mirror matrix to mirror the current view
	this.updateTextureMatrix();
	this.matrixNeedsUpdate = false;

	// set the camera of the other mirror so the mirrored view is the reference view
	var tempCamera = otherMirror.camera;
	otherMirror.camera = this.mirrorCamera;

	// render the other mirror in temp texture
	otherMirror.renderTemp();
	otherMirror.material.uniforms.mirrorSampler.value = otherMirror.tempTexture;

	// render the current mirror
	this.render();
	this.matrixNeedsUpdate = true;

	// restore material and camera of other mirror
	otherMirror.material.uniforms.mirrorSampler.value = otherMirror.texture;
	otherMirror.camera = tempCamera;

	// restore texture matrix of other mirror
	otherMirror.updateTextureMatrix();
};

THREE.FlatMirror.prototype.updateTextureMatrix = function () {

	function sign(x) { return x ? x < 0 ? -1 : 1 : 0; }

	this.updateMatrixWorld();
	this.camera.updateMatrixWorld();

	this.mirrorWorldPosition.getPositionFromMatrix( this.matrixWorld );
	this.cameraWorldPosition.getPositionFromMatrix( this.camera.matrixWorld );

	this.rotationMatrix.extractRotation( this.matrixWorld );

	this.normal.set( 0, 0, 1 );
	this.normal.applyMatrix4( this.rotationMatrix );

	var view = this.mirrorWorldPosition.clone().sub( this.cameraWorldPosition );
	var reflectView = view.reflect( this.normal );
	reflectView.add( this.mirrorWorldPosition );

	this.rotationMatrix.extractRotation( this.camera.matrixWorld );

	this.lookAtPosition.set(0, 0, -1);
	this.lookAtPosition.applyMatrix4( this.rotationMatrix );
	this.lookAtPosition.add( this.cameraWorldPosition );

	var target = this.mirrorWorldPosition.clone().sub( this.lookAtPosition );
	var reflectTarget = target.reflect( this.normal );
	reflectTarget.add( this.mirrorWorldPosition );

	this.up.set(0, -1, 0);
	this.up.applyMatrix4( this.rotationMatrix );
	var reflectUp = this.up.reflect( this.normal );

	this.mirrorCamera.position.copy(reflectView);
	this.mirrorCamera.up = reflectUp;
	this.mirrorCamera.lookAt(reflectTarget);

	this.mirrorCamera.updateProjectionMatrix();
	this.mirrorCamera.updateMatrixWorld();
	this.mirrorCamera.matrixWorldInverse.getInverse(this.mirrorCamera.matrixWorld);

	// Update the texture matrix
	this.textureMatrix.set( 0.5, 0.0, 0.0, 0.5,
							0.0, 0.5, 0.0, 0.5,
							0.0, 0.0, 0.5, 0.5,
							0.0, 0.0, 0.0, 1.0 );
	this.textureMatrix.multiply(this.mirrorCamera.projectionMatrix);
	this.textureMatrix.multiply(this.mirrorCamera.matrixWorldInverse);

	// Now update projection matrix with new clip plane, implementing code from: http://www.terathon.com/code/oblique.html
	// Paper explaining this technique: http://www.terathon.com/lengyel/Lengyel-Oblique.pdf
	this.mirrorPlane.setFromNormalAndCoplanarPoint( this.normal, this.mirrorWorldPosition );
	this.mirrorPlane.applyMatrix4(this.mirrorCamera.matrixWorldInverse);

	this.clipPlane.set(this.mirrorPlane.normal.x, this.mirrorPlane.normal.y, this.mirrorPlane.normal.z, this.mirrorPlane.constant );

	var q = new THREE.Vector4();
	var projectionMatrix = this.mirrorCamera.projectionMatrix;

	q.x = (sign(this.clipPlane.x) + projectionMatrix.elements[8]) / projectionMatrix.elements[0];
	q.y = (sign(this.clipPlane.y) + projectionMatrix.elements[9]) / projectionMatrix.elements[5];
	q.z = -1.0;
	q.w = (1.0 + projectionMatrix.elements[10]) / projectionMatrix.elements[14];

	// Calculate the scaled plane vector
	var c = new THREE.Vector4();
	c = this.clipPlane.multiplyScalar( 2.0 / this.clipPlane.dot(q) );

	// Replacing the third row of the projection matrix
	projectionMatrix.elements[2] = c.x;
	projectionMatrix.elements[6] = c.y;
	projectionMatrix.elements[10] = c.z + 1.0 - this.clipBias;
	projectionMatrix.elements[14] = c.w;

};

THREE.FlatMirror.prototype.render = function () {

	if (this.matrixNeedsUpdate)
		this.updateTextureMatrix();

	this.matrixNeedsUpdate = true;

	// Render the mirrored view of the current scene into the target texture
	var scene = this;
	while ( scene.parent !== undefined ) {
		scene = scene.parent;
	}

	if ( scene !== undefined && scene instanceof THREE.Scene)
		this.renderer.render(scene, this.mirrorCamera, this.texture, true);

};

THREE.FlatMirror.prototype.renderTemp = function () {

	if (this.matrixNeedsUpdate)
		this.updateTextureMatrix();

	this.matrixNeedsUpdate = true;

	// Render the mirrored view of the current scene into the target texture
	var scene = this;
	while ( scene.parent !== undefined ) {
		scene = scene.parent;
	}

	if ( scene !== undefined && scene instanceof THREE.Scene)
		this.renderer.render(scene, this.mirrorCamera, this.tempTexture, true);

};
