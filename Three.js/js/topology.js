/**
 * @author Lee Stemkoski
 */
 
// declare namespace
var TOPOLOGY = TOPOLOGY || {};

///////////////////////////////////////////////////////////////////////////////
TOPOLOGY.Vertex = function(params)
{
    this.ID = -1;
	this.type = "vertex";
    this.vector3 = new THREE.Vector3(); // coordinates
    this.edgeIDs = []; // length n
    this.faceIDs = []; // length n
   
    setParameters(this, params);   
}

TOPOLOGY.Edge = function(params)
{
    this.ID = -1;
    this.type = "edge";
    this.center    = new THREE.Vector3(); // midpoint
    this.vertexIDs = []; // length 2
    this.faceIDs   = []; // length 2
   
    setParameters(this, params);   
}

TOPOLOGY.Face = function (params)
{
   this.ID = -1;
   this.type = "face";
   this.center    = new THREE.Vector3(); // centroid
   this.vertexIDs = []; // length n
   this.edgeIDs   = []; // length n
   this.colorID = -1;
   
   setParameters(this, params);   
} 

setParameters = function(obj, params)
{
   if (params === undefined) return;

    for (var arg in obj)
        if (params[arg] !== undefined )
			obj[arg] = params[arg];
}

TOPOLOGY.Topology = function()
{
	this.vertex = [];
	this.edge   = [];
	this.face   = [];
}

///////////////////////////////////////////////////////////////////////////////
// convenience Array methods

Array.prototype.pushUnique = function(obj) 
{
	if (this.indexOf(obj) == -1) this.push(obj);
}

Array.prototype.spliceData = function(data) 
{	
	var dataArray = (data instanceof Array) ? data : [data];
	for (var a = 0; a < dataArray.length; a++)
	{
		var i = this.indexOf(dataArray[a]); 
		if ( i != -1 ) this.splice( i, 1 );
	}
}

Array.prototype.changeData = function(oldData, newData)
{
	for (var i = 0; i < this.length; i++)
		if (this[i] == oldData) this[i] = newData;
}

Array.prototype.clone = function() 
{
	return this.concat();
}

///////////////////////////////////////////////////////////////////////////////

// create a vertex/edge/face with next available ID, add it to topology structure.
TOPOLOGY.Topology.prototype.create = function(type)
{
	var simplex = {};
	if ( type == "vertex" ) simplex = new TOPOLOGY.Vertex();
	if ( type == "edge"   ) simplex = new TOPOLOGY.Edge();
	if ( type == "face"   ) simplex = new TOPOLOGY.Face();
	simplex.ID = this[type].length;
	this.add( simplex );
	return simplex; 
}

TOPOLOGY.Topology.prototype.add = function(obj)
{
	if ( obj.hasOwnProperty("type") )
		this[obj.type][obj.ID] = obj;
	else
		console.log("Topology.add: unknown object type");
}

TOPOLOGY.Topology.prototype.addIncidenceData = function(type1, data1, type2, data2)
{
	// convert non-arrays into arrays for convenience
	var IDs1 = (data1 instanceof Array) ? data1 : [data1];
	var IDs2 = (data2 instanceof Array) ? data2 : [data2];
	
	for (var i = 0; i < IDs1.length; i++)
	for (var j = 0; j < IDs2.length; j++)
	{
		this[type1][ IDs1[i] ][ type2 + "IDs" ].pushUnique( IDs2[j] );
		this[type2][ IDs2[j] ][ type1 + "IDs" ].pushUnique( IDs1[i] );
	}
}

TOPOLOGY.Topology.prototype.addTriangleData = function(Va, Vb, Vc, Eab, Ebc, Eca, F)
{
	this.addIncidenceData("edge", Eab, "vertex", [Va, Vb]);
	this.addIncidenceData("edge", Ebc, "vertex", [Vb, Vc]);
	this.addIncidenceData("edge", Eca, "vertex", [Vc, Va]);

	this.addIncidenceData("face", F, "vertex", [Va, Vb, Vc]);

	this.addIncidenceData("face", F, "edge", [Eab, Ebc, Eca]);
}

TOPOLOGY.Topology.prototype.remove = function(obj)
{
	// remove references to obj stored in ID lists of other types
	var otherTypes = ["vertex", "edge", "face"];
	otherTypes.spliceData(obj.type);
	
	for (var t = 0; t < 2; t++)
	{
		var otherType = otherTypes[t];		
		for (var i = 0; i < obj[otherType + "IDs"].length; i++)
		{
			// get ID of otherType that contains a reference to obj
			var ID = obj[otherType + "IDs"][i];
			this[otherType][ID][obj.type + "IDs"].spliceData( obj.ID );
		}
	}

	// pop off the last simplex of given type, and reindex it to given ID	
	this.reindex( this[obj.type].pop(), obj.ID );
}

TOPOLOGY.Topology.prototype.reindex = function(obj, newIndex)
{
	var oldIndex = obj.ID;
	obj.ID = newIndex;
	this[obj.type][newIndex] = obj;

	// change references to obj stored in ID lists of other types
	var otherTypes = ["vertex", "edge", "face"];
	otherTypes.spliceData(obj.type);
	
	for (var t = 0; t < 2; t++)
	{
		var otherType = otherTypes[t];		
		for (var i = 0; i < obj[otherType + "IDs"].length; i++)
		{
			// get ID of otherType that contains a reference to obj
			var ID = obj[otherType + "IDs"][i];
			this[otherType][ID][obj.type + "IDs"].changeData( oldIndex, newIndex );
		}
	}
}

///////////////////////////////////////////////////////////////////////////////

TOPOLOGY.Topology.prototype.edgeIDWithVertices = function(va, vb)
{
	var edgeCandidateIDs = this.vertex[va].edgeIDs;
	for (var i = 0; i < edgeCandidateIDs.length; i++)
	{
		var edgeIndex = edgeCandidateIDs[i];
		if (this.edge[edgeIndex].vertexIDs.indexOf(vb) != -1)
			return edgeIndex;
	}
	
	return -1;
}

TOPOLOGY.Topology.prototype.edgeIDWithFaces = function(fa, fb)
{
	var edgeCandidateIDs = this.face[fa].edgeIDs;
	for (var i = 0; i < edgeCandidateIDs.length; i++)
	{
		var edgeIndex = edgeCandidateIDs[i];
		if (this.edge[edgeIndex].faceIDs.indexOf(fb) != -1)
			return edgeIndex;
	}
	
	return -1;
}

///////////////////////////////////////////////////////////////////////////////

TOPOLOGY.Topology.prototype.computeCenters = function()
{
	for (var i = 0; i < this.edge.length; i++)
	{
		var edge = this.edge[i];
		if (edge == null) continue;
		edge.center = new THREE.Vector3(0,0,0);
		edge.center.add( this.vertex[ edge.vertexIDs[0] ].vector3 );
		edge.center.add( this.vertex[ edge.vertexIDs[1] ].vector3 );
		edge.center.divideScalar(2);	
	}
	for (var i = 0; i < this.face.length; i++)
	{
		var face = this.face[i];
		if (face == null) continue;
		face.center = new THREE.Vector3(0,0,0);
		for (var v = 0; v < face.vertexIDs.length; v++)
			face.center.add( this.vertex[ face.vertexIDs[v] ].vector3 );
		face.center.divideScalar( face.vertexIDs.length );	
	}
}

///////////////////////////////////////////////////////////////////////////////

TOPOLOGY.Topology.prototype.textQuery = function(type, ID)
{
	var array = this[type][ID];
	
	var info = type + " " + "ID " + ID + ". ";
	if ( !(type == "vertex") )
		info += "Adj vertices: [" + array.vertexIDs.toString() + "]. ";
	if ( !(type == "edge") )
		info += "Adj edges: [" + array.edgeIDs.toString() + "]. ";
	if ( !(type == "face") )
		info += "Adj faces: [" + array.faceIDs.toString() + "]. ";
	return info;
}

///////////////////////////////////////////////////////////////////////////////

// assumption: geometries previously triangulated.

TOPOLOGY.Topology.prototype.retriangulate = function(type, ID, vec3)
{
    if ( type == "face" )
	    this.retriangulateFace(ID, vec3)
	else if ( type == "edge" )
	    this.retriangulateEdge(ID, vec3)
	else
		console.log("Topology.retriangulate: unknown type");
}

TOPOLOGY.Topology.prototype.retriangulateFace = function(faceID, vec3)
{
	
	var v0 = this.face[faceID].vertexIDs[0];
	var v1 = this.face[faceID].vertexIDs[1];
	var v2 = this.face[faceID].vertexIDs[2];
	
	var e01 = this.edgeIDWithVertices(v0,v1);
	var e12 = this.edgeIDWithVertices(v1,v2);
	var e20 = this.edgeIDWithVertices(v2,v0);
	
	// create new items and store IDs
	var Vn = this.create("vertex");
	Vn.vector3 = vec3.clone();

	var E0n = this.create("edge").ID;
	var E1n = this.create("edge").ID;
	var E2n = this.create("edge").ID;

	var F01n = this.create("face").ID;
	var F12n = this.create("face").ID;
	var F20n = this.create("face").ID;
	
	this.addTriangleData( v0,v1,Vn.ID, e01,E1n,E0n, F01n );
	this.addTriangleData( v1,v2,Vn.ID, e12,E2n,E1n, F12n );
	this.addTriangleData( v2,v0,Vn.ID, e20,E0n,E2n, F20n );
		
	this.remove( this.face[faceID] );
}

TOPOLOGY.Topology.prototype.retriangulateEdge = function(edgeID, vec3)
{
	var v0 = this.edge[edgeID].vertexIDs[0];
	var v1 = this.edge[edgeID].vertexIDs[1];
	var e01 = this.edgeIDWithVertices(v0,v1);
	
	var f0 = this.edge[edgeID].faceIDs[0];
	var tempArray = this.face[f0].vertexIDs.clone();
	tempArray.spliceData( [v0,v1] );
	var va = tempArray[0];
	
	var e0a = this.edgeIDWithVertices(v0,va);
	var e1a = this.edgeIDWithVertices(v1,va);
	
	var f1 = this.edge[edgeID].faceIDs[1];
	var tempArray = this.face[f1].vertexIDs.clone();
	tempArray.spliceData( [v0,v1] );
	var vb = tempArray[0]; 
	
	var e0b = this.edgeIDWithVertices(v0,vb);
	var e1b = this.edgeIDWithVertices(v1,vb);

	// create new items and store IDs
	var Vn = this.create("vertex");
	Vn.vector3 = vec3.clone();

	var E0n = this.create("edge").ID;
	var E1n = this.create("edge").ID;
	var Ean = this.create("edge").ID;
	var Ebn = this.create("edge").ID;

	var F0na = this.create("face").ID;
	var F1na = this.create("face").ID;
	var F0nb = this.create("face").ID;
	var F1nb = this.create("face").ID;
	
	this.addTriangleData( v0,Vn.ID,va, E0n,Ean,e0a, F0na );
	this.addTriangleData( v1,Vn.ID,va, E1n,Ean,e1a, F1na );
	this.addTriangleData( v0,Vn.ID,vb, E0n,Ebn,e0b, F0nb );
	this.addTriangleData( v1,Vn.ID,vb, E1n,Ebn,e1b, F1nb );

	// remove edge and two faces
	this.remove( this.edge[edgeID] );
	this.remove( this.face[f0] );
	this.remove( this.face[f1] );	
}

///////////////////////////////////////////////////////////////////////////////

TOPOLOGY.createFromGeometry = function( geometry )
{
	// initialize topology
	var topo = new TOPOLOGY.Topology();

	// add vertices
	for (var vertexIndex = 0; vertexIndex < geometry.vertices.length; vertexIndex++)
	{
		var v = new TOPOLOGY.Vertex( {ID: vertexIndex, vector3: geometry.vertices[vertexIndex].clone() } );
		topo.add(v);
	}
	
	// add faces, link vertex-face IDs 
	for (var faceIndex = 0; faceIndex < geometry.faces.length; faceIndex++)
	{
		var face = geometry.faces[faceIndex];
		var vertexData = [ face['a'], face['b'], face['c'] ];
		if (face instanceof THREE.Face4) 
			vertexData.push( face['d'] );
		
		var f = new TOPOLOGY.Face( {ID: faceIndex} );
		topo.add(f);
		topo.addIncidenceData( "face", faceIndex, "vertex", vertexData );
	}

    // add edges, incidence data for vertex-edge and edge-face IDs
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
			var edgeIndex = topo.edgeIDWithVertices(edgeVertices[0], edgeVertices[1]);
			
			if ( edgeIndex == -1 ) // not already present
			{			
				edge = topo.create("edge");
				edgeIndex = edge.ID;
				topo.addIncidenceData( "edge", edgeIndex, "vertex", edgeVertices );	
			}

			topo.addIncidenceData( "edge", edgeIndex, "face", faceIndex );					
		}

	} // finished adding edges to topology
	
	topo.computeCenters();
	return topo;
}
///////////////////////////////////////////////////////////////////////////////

TOPOLOGY.Topology.prototype.convertToGeometry = function()
{
    var geometry = new THREE.Geometry();
	
	for (var i = 0; i < this.vertex.length; i++)
	{
		if (this.vertex[i] == null) continue;
		
		geometry.vertices[i] = this.vertex[i].vector3.clone();
	}

	this.computeFaceColoring();

	var palette = [new THREE.Color(0x333333), new THREE.Color(0x999999), new THREE.Color(0x666666), 
				   new THREE.Color(0xCCCCCC), new THREE.Color(0x111111)];

	var totalFaces = 0;
	for (var i = 0; i < this.face.length; i++)
	{
		if (this.face[i] == null) continue;
		var a = this.face[i].vertexIDs;
		var geoFace = new THREE.Face3( a[0], a[1], a[2] );
		geometry.faces[totalFaces] = geoFace;
		geometry.faces[totalFaces].color = palette[this.face[i].colorID];
		
		totalFaces++;
	}
	
	geometry.computeFaceNormals();
	geometry.computeVertexNormals();

	return geometry;
}

///////////////////////////////////////////////////////////////////////////////

TOPOLOGY.Topology.prototype.computeFaceColoring = function()
{
	for (var i = 0; i < this.face.length; i++)
	{
		if (this.face[i] == null) continue;

		var adjacentFaces = [];
		for (var j = 0; j < this.face[i].edgeIDs.length; j++)
		{
			var eID = this.face[i].edgeIDs[j];
			adjacentFaces = adjacentFaces.concat( this.edge[eID].faceIDs );
		}
		
		var colorIDs = [0,1,2,3,4,5,6];
		for (var k = 0; k < adjacentFaces.length; k++)
		{
			var fID = adjacentFaces[k];
			colorIDs.spliceData( this.face[fID].colorID );
		}

		this.face[i].colorID = colorIDs[0];
	}
}

///////////////////////////////////////////////////////////////////////////////
