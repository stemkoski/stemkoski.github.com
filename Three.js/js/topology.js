/**
 * @author Lee Stemkoski
 */
 
// declare namespace
var TOPOLOGY = TOPOLOGY || {};

///////////////////////////////////////////////////////////////////////////////
TOPOLOGY.Vertex = function(params)
{
    this.ID = -1;
    this.vector3 = new THREE.Vector3(); // coordinates
    this.edgeIDs = []; // length n
    this.faceIDs = []; // length n
   
    if (params === undefined) return;

    for (var arg in this)
        if (params[arg] !== undefined )
			this[arg] = params[arg];
}
///////////////////////////////////////////////////////////////////////////////
TOPOLOGY.Edge = function(params)
{
   this.ID = -1;
   this.center    = new THREE.Vector3(); // midpoint
   this.vertexIDs = []; // length 2
   this.faceIDs   = []; // length 2
   
   if (params === undefined) return;

    for (var arg in this)
        if (params[arg] !== undefined )
			this[arg] = params[arg];
}
///////////////////////////////////////////////////////////////////////////////
TOPOLOGY.Face = function (params)
{
   this.ID = -1;
   this.center    = new THREE.Vector3(); // centroid
   this.vertexIDs = []; // length n
   this.edgeIDs   = []; // length n
   
   if (params === undefined) return;

    for (var arg in this)
        if (params[arg] !== undefined )
			this[arg] = params[arg];
} 
///////////////////////////////////////////////////////////////////////////////
TOPOLOGY.Topology = function()
{
	this.vertices = [];
	this.edges    = [];
	this.faces    = [];
}

TOPOLOGY.Topology.prototype.addVertex = function(v)
{
    this.vertices[v.ID] = v;
}

TOPOLOGY.Topology.prototype.addEdge = function(e)
{
    this.edges[e.ID] = e;
}

TOPOLOGY.Topology.prototype.addFace = function(f)
{
    this.faces[f.ID] = f;
}

// push obj into array iff array does not contain obj
Array.prototype.pushUnique = function(obj) 
{
	if (this.indexOf(obj) == -1) this.push(obj);
}

// only need three link functions since incidence is a reflexive relation

TOPOLOGY.Topology.prototype.linkVertexIDEdgeID = function(vID, eID)
{
	this.vertices[vID].edgeIDs.pushUnique(eID);
	this.edges[eID].vertexIDs.pushUnique(vID);
}

TOPOLOGY.Topology.prototype.linkEdgeIDFaceID = function(eID, fID)
{
	this.edges[eID].faceIDs.pushUnique(fID);
	this.faces[fID].edgeIDs.pushUnique(eID);
}

TOPOLOGY.Topology.prototype.linkVertexIDFaceID = function(vID, fID)
{
	this.vertices[vID].faceIDs.pushUnique(fID);
	this.faces[fID].vertexIDs.pushUnique(vID);
}
// convenience method for arrays of vertices and faces (easy to generate)
TOPOLOGY.Topology.prototype.linkVertexIDsFaceIDs = function(vIDs, fIDs)
{
	for (var i = 0; i < vIDs.length; i++)
	for (var j = 0; j < fIDs.length; j++)
		this.linkVertexIDFaceID( vIDs[i], fIDs[j] );
}

///////////////////////////////////////////////////////////////////////////////
TOPOLOGY.Edge.prototype.equalsArray = function(e)
{
	return ( (this.vertexIDs[0] == e[0]) && (this.vertexIDs[1] == e[1]) ) 
	    || ( (this.vertexIDs[0] == e[1]) && (this.vertexIDs[1] == e[0]) );
}
// returns array index of item if present, otherwise returns -1
TOPOLOGY.Topology.prototype.containsEdgeData = function(e)
{
	for (var edgeIndex = 0; edgeIndex < this.edges.length; edgeIndex++ )
		if ( this.edges[edgeIndex].equalsArray(e) ) return edgeIndex;
		
	return -1;
}
///////////////////////////////////////////////////////////////////////////////
TOPOLOGY.Topology.prototype.computeCenters = function()
{
	for (var i = 0; i < this.edges.length; i++)
	{
		var edge = this.edges[i];
		edge.center = new THREE.Vector3(0,0,0);
		edge.center.add( this.vertices[ edge.vertexIDs[0] ].vector3 );
		edge.center.add( this.vertices[ edge.vertexIDs[1] ].vector3 );
		edge.center.divideScalar(2);	
	}
	for (var i = 0; i < this.faces.length; i++)
	{
		var face = this.faces[i];
		face.center = new THREE.Vector3(0,0,0);
		for (var v = 0; v < face.vertexIDs.length; v++)
			face.center.add( this.vertices[ face.vertexIDs[v] ].vector3 );
		face.center.divideScalar( face.vertexIDs.length );	
	}
}
///////////////////////////////////////////////////////////////////////////////
TOPOLOGY.createFromGeometry = function( geometry )
{
	// initialize topology
	var topo = new TOPOLOGY.Topology();

	// add vertices
	for (var i = 0; i < geometry.vertices.length; i++)
	{
		var v = new TOPOLOGY.Vertex( {ID: i, vector3: geometry.vertices[i].clone() } );
		topo.addVertex(v);
	}
	
	// add faces, link vertex-face IDs 
	for (var faceIndex = 0; faceIndex < geometry.faces.length; faceIndex++)
	{
		var face = geometry.faces[faceIndex];
		var vertexData = [ face['a'], face['b'], face['c'] ];
		if (face instanceof THREE.Face4) 
			vertexData.push( face['d'] );
		
		var f = new TOPOLOGY.Face( {ID: faceIndex} );
		f.center = face.centroid.clone();
		topo.addFace(f);
		topo.linkVertexIDsFaceIDs( vertexData, [faceIndex] );
	}

    // add edges, link vertex-edge and edge-face IDs
	var edgeCount = 0;
	for (var faceIndex = 0; faceIndex < geometry.faces.length; faceIndex++)
	{
		var edgeArray = [];
		
		var face = geometry.faces[faceIndex];
		// indices of vertices on the face
		var iva = face['a'];
		var ivb = face['b'];
		var ivc = face['c'];
		
		edgeArray.push( [iva,ivb] );
		edgeArray.push( [ivb,ivc] );
		
		if (face instanceof THREE.Face3)
		{
			edgeArray.push( [ivc,iva] );
		}
		else // THREE.Face4
		{
			var ivd = face['d'];
			edgeArray.push( [ivc,ivd] );
			edgeArray.push( [ivd,iva] );
		}
		
		// add edges to topology, if not already present
		for (var j = 0; j < edgeArray.length; j++)
		{
			var edgeVertices = edgeArray[j];
			var edgeIndex = topo.containsEdgeData(edgeVertices);
			
			if ( edgeIndex == -1 ) // not already present
			{
				edgeIndex = edgeCount;
				var edge = new TOPOLOGY.Edge( {ID: edgeIndex} );
				
				topo.addEdge(edge);
				topo.linkVertexIDEdgeID( edgeVertices[0], edgeIndex );
				topo.linkVertexIDEdgeID( edgeVertices[1], edgeIndex );			
				edgeCount++;
			}

			topo.linkEdgeIDFaceID( edgeIndex, faceIndex );						
		}

	} // finished adding edges to topology
	
	topo.computeCenters();
	return topo;
}
///////////////////////////////////////////////////////////////////////////////
