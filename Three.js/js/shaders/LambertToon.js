/*
	Gives THREE.js Lambert Material a Toon / Cel look
	From: http://www.neocomputer.org/projects/donut/
*/
THREE.ShaderLib['lambert'].fragmentShader = THREE.ShaderLib['lambert'].fragmentShader.replace(/^\s\s*/, '').replace(/\s\s*$/, '');
THREE.ShaderLib['lambert'].fragmentShader = "uniform vec3 diffuse;\n" + THREE.ShaderLib['lambert'].fragmentShader.substr(0, THREE.ShaderLib['lambert'].fragmentShader.length-1);
THREE.ShaderLib['lambert'].fragmentShader += [
	"#ifdef USE_MAP",
	"	gl_FragColor = texture2D( map, vUv );",
	"#else",
	"	gl_FragColor = vec4(diffuse, 1.0);",
	"#endif",
	"	vec3 basecolor = vec3(gl_FragColor[0], gl_FragColor[1], gl_FragColor[2]);",
	"	float alpha = gl_FragColor[3];",
	"	float vlf = vLightFront[0];",
	// Clean and simple //
	"	if (vlf< 0.50) { gl_FragColor = vec4(mix( basecolor, vec3(0.0), 0.5), alpha); }",
	"	if (vlf>=0.50) { gl_FragColor = vec4(mix( basecolor, vec3(0.0), 0.3), alpha); }",
	"	if (vlf>=0.75) { gl_FragColor = vec4(mix( basecolor, vec3(1.0), 0.0), alpha); }",
	//"	if (vlf>=0.95) { gl_FragColor = vec4(mix( basecolor, vec3(1.0), 0.3), alpha); }",
	//"	gl_FragColor.xyz *= vLightFront;",
	"}"
	].join("\n");