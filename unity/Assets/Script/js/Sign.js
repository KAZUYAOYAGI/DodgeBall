#pragma strict

var animation_time:float = 0;
var isShown = false;
var isErased = false;

var uvAnimationTileX = 4;
var uvAnimationTileY = 4; 
var framesPerSecond = 10.0;
var sp_renderer:SpriteRenderer;

function Start () {
	
	animation_time = 0.7;
	//iTween.FadeTo(gameObject, iTween.Hash("alpha", 0, "time", 0)); 
	iTween.FadeTo(gameObject, iTween.Hash("alpha", 1, "time", 0.2)); 
	//iTween.ScaleTo(gameObject,iTween.Hash("time",0,"x",0.2,"z",0.2,"easeType", "easeOutExpo"));
	//loopScale();
	sp_renderer = this.gameObject.GetComponent(SpriteRenderer);
}

function loopScale(){
	iTween.ScaleTo(gameObject,iTween.Hash("time",animation_time,"x",0.3,"z",0.3,"easeType", "easeOutExpo","looptype",iTween.LoopType.pingPong));
	//iTween.ScaleTo(gameObject,iTween.Hash("time",animation_time,"x",0.15,"z",0.15,"delay",animation_time-0.3,"oncomplete","_oncomplete","easeType", "easeInExpo"));
}


function _oncomplete(){
	loopScale();
}


function Update () {
//	var index : int = Time.time * framesPerSecond;
//	index = index % (uvAnimationTileX * uvAnimationTileY);
//	var size = Vector2 (1.0 / uvAnimationTileX, 1.0 / uvAnimationTileY);
//	var uIndex = index % uvAnimationTileX;
//	var vIndex = index / uvAnimationTileX;
//	var offset = Vector2 (uIndex * size.x, 1.0 - size.y - vIndex * size.y);
//	renderer.material.SetTextureOffset ("_MainTex", offset);
//	renderer.material.SetTextureScale ("_MainTex", size);
	this.transform.rotation.x = 90;
}


function eraseCircle(){
	if(isErased){
		return;
	}
	isShown = false;
	isErased = true;
	iTween.FadeTo(gameObject, iTween.Hash("alpha", 0, "time", 0.2)); 
}

function showCircle(){
	if(isShown){
		//iTween.Stop(this.gameObject);
		return;
	};

isShown = true;
	isErased = false;
	transform.localScale.x = 2;
	transform.localScale.z = 2;
	iTween.ScaleTo(gameObject,iTween.Hash("time",1,"x",1,"z",1,"easeType", "easeOutBack"));
	iTween.FadeTo(gameObject, iTween.Hash("alpha", 0.6, "time", 0.3)); 
}

function showCircleSlow(){
	if(isShown){
		//iTween.Stop(this.gameObject);
		return;
	};

	isShown = true;
	isErased = false;
	transform.localScale.x = 3;
	transform.localScale.z = 3;
	iTween.ScaleTo(gameObject,iTween.Hash("time",2,"x",1,"z",1,"easeType", "easeInOutBack"));
	iTween.FadeTo(gameObject, iTween.Hash("alpha", 0.6, "time", 0.1)); 
}

function colorTo(color){
	iTween.ColorTo(gameObject,iTween.Hash("color",Color.blue,"time",0.1));
}