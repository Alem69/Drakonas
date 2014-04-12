/**
 * Player logic like shooting will be placed in this file.
 */

var bullets             = new Array();
var bulletIndex         = 0;

var explosions          = new Array();
var explosionIndex      = 0;

/**
 * List with current equiped weapons. Intervall is based on time but might need to base it
 * on frames. (Use a counter loop in render() perhaps. Minimum of 50 microseconds.
 * @type {Array}
 */
var currentWeapons      = new Array();
currentWeapons[0]       = {
    "geometry":         new THREE.CubeGeometry(.2,.2,.2),
    "texture":          new THREE.MeshBasicMaterial ({color: 0xffffff}),
    "interval":         75,
    "lastShot":         new Date().getTime(),
    "damage":           1,
    "offset":           {
        x: -.75,
        y: -1,
        z: 2
    },
    "animation":        [
    {
        x: -.75,
        y: -1,
        z: 60,
        "duration": 750,
        "easing": "Linear.None"
    }
    ]
//    "animation":        [
//        {
//            x: 0,
//            y: -20,
//            z: 15,
//            "duration": 350,
//            "easing": "Sinusoidal.In"
//        },
//        {
//            x: 0,
//            y: -20,
//            z: 60,
//            "duration": 750,
//            "easing": "Sinusoidal.Out"
//        }
//    ]
}
currentWeapons[1]       = {
    "geometry":         new THREE.CubeGeometry(.2,.2,.8),
    "texture":          new THREE.MeshBasicMaterial ({color: 0xff0000}),
    "interval":         1000,
    "lastShot":         new Date().getTime(),
    "damage":           5,
    "offset":           {
        x: -.75,
        y: -1,
        z: 2
    },
    "animation":        [
        {
            x: -.75,
            y: -1,
            z: 60,
            "duration": 1500,
            "easing": "Linear.None"
        }
    ]
}
currentWeapons[2]       = {
    "geometry":         new THREE.CubeGeometry(.2,.2,.9),
    "texture":          new THREE.MeshBasicMaterial ({color: 0xffffff}),
    "interval":         350,
    "lastShot":         new Date().getTime(),
    "damage":           10,
    "offset":           {
        x: -1.5,
        y: -1,
        z: 3.7
    },
    "animation":        [
        {
            x: -1.5,
            y: -1,
            z: 60,
            "duration": 1250,
            "easing": "Quintic.In"
        }
    ]
}
currentWeapons[3]       = {
    "geometry":         new THREE.CubeGeometry(.2,.2,.9),
    "texture":          new THREE.MeshBasicMaterial ({color: 0xffffff}),
    "interval":         350,
    "lastShot":         new Date().getTime(),
    "easing":           "Quintic.In",
    "duration":         1250,
    "damage":           10,
    "offset":           {
        x: 0,
        y: -1,
        z: 3.7
    },
    "animation":        [
        {
            x: 0,
            y: -1,
            z: 60,
            "duration": 1250,
            "easing": "Quintic.In"
        }
    ]
}
function shoot() {
    if (mouseDown == false || gameOptions == null || gameOptions.inGame == null || gameOptions.inGame == false || gameOptions.pause == null || gameOptions.pause == true) {
        return;
    }
    var timeNow = new Date().getTime();
    for (i = 0; i < currentWeapons.length; i++) {
        if (currentWeapons[i].lastShot < (timeNow - currentWeapons[i].interval)) {
            spawnBullet(currentWeapons[i]);
            currentWeapons[i].lastShot = timeNow;
        }
    }

    if (mouseDown == true) {
        setTimeout(function() { shoot(); }, 50);
    }
}

/**
 * Spawns and animates a bullet.
 * @param currentWeapon
 */
function spawnBullet(currentWeapon) {
    var refObject = currentWeapon;
    var material = refObject.texture;
    var currentIndex = bulletIndex;
    var bullet = new THREE.Mesh(refObject.geometry, material);
    bullet.index = currentIndex;
    bullet.damage = currentWeapon.damage;

    bullet.position.x = player.position.x;
    bullet.position.y = player.position.y;
    bullet.position.z = player.position.z;
    bullet.position.i = currentIndex;
    if (currentWeapon.offset != null) {
        bullet.position.x += currentWeapon.offset.x;
        bullet.position.y += currentWeapon.offset.y;
        bullet.position.z += currentWeapon.offset.z;
    }
    delay = 0;
    position = bullet.position;
    for (var b = 0; b < currentWeapon.animation.length; b++) {
        var toPosition = {x: (position.x + currentWeapon.animation[b].x), i: currentIndex, y: (position.y + currentWeapon.animation[b].y), z: (position.z + currentWeapon.animation[b].z) }
        easing = TWEEN.Easing.Linear.None;
        if (currentWeapon.animation[b].easing != null) {
            easing = getEasingByString(currentWeapon.animation[b].easing);
        }
        var bulletName = 'bullets_' + currentIndex + '_' + b;
        gameTweens[bulletName] = new TWEEN.Tween( position )
            .to( toPosition, currentWeapon.animation[b].duration )
            .easing( easing )
            .onUpdate( function () {
                if (bullets[this.i] != null) {
                    bullets[this.i].position.x = this.x;
                    bullets[this.i].position.y = this.y;
                    bullets[this.i].position.z = this.z;
                }
            } )
            .onComplete( function () {
            } )
            .delay(delay)
            .start();
        position = toPosition;
        delay += currentWeapon.animation[b].duration;
    }
    bullets[currentIndex] = bullet;
    scene.add(bullets[currentIndex]);
    setTimeout(function() { removeBullet(currentIndex); }, delay);
    bulletIndex++;
}

function bulletHit(index, objectIndex) {
    // Calculate damage
    // Remove object
    yPos = objects[objectIndex].position.y;
    // Remove bullet from scene, tweens, etc
    removeObjectHp(objectIndex, bullets[index].damage);
    removeBullet(index, true, yPos);
}

function removeObjectHp(objectIndex, damage) {
    if (objects[objectIndex] != null) {
        if (objects[objectIndex] != null && objects[objectIndex].stats != null && objects[objectIndex].stats.hp != null) {
            objects[objectIndex].stats.hp -= damage;
        }
        if (objects[objectIndex].stats.hp == null || objects[objectIndex].stats.hp <= 0) {
            removeObject(objectIndex);
        }
    }
}

function createExplosion(position, size, amount, explosionRatio, color, duration) {
    if (gameSettings.quality != 'high') {
        return;
    }
    if (size == null) {
        size = 2;
    }
    if (amount == null) {
        amount = 5;
    }
    if (explosionRatio == null) {
        explosionRatio = 4;
    }
    if (color == null) {
        color = 0xffffff;
    }
    if (duration == null) {
        duration = 350;
    }
    for (i = 0; i < amount; i++ ) {
        randomObject = Math.round(Math.random() * 3);

        var material = new THREE.MeshBasicMaterial({ color: color });

        if (randomObject == 1) {
            var cubeGeometry = new THREE.CubeGeometry((Math.random() * size) / 10, (Math.random() * size) / 10, (Math.random() * size) / 10);
            var mesh = new THREE.Mesh( circleGeometry, material );
        }
        else if (randomObject == 2) {
            var tertraGeometry = new THREE.TetrahedronGeometry( (Math.random() * size) / 10, 0 );
            var mesh = new THREE.Mesh( tertraGeometry, material );
        }
        else {
            var radius = (Math.random() * size) / 10;
            var segments = 8;
            var circleGeometry = new THREE.CircleGeometry( radius, segments );
            var mesh = new THREE.Mesh( circleGeometry, material );
        }

        mesh.rotation.x = -(Math.PI / 2);
        mesh.position.x = position.x + ((Math.random() * 4) - 2);
        mesh.position.y = position.y + ((Math.random() * 4) - 2);
        mesh.position.z = position.z + ((Math.random() * 4) - 2);
        mesh.position.i = explosionIndex;
        var positionTo = new Object;
        positionTo.x = position.x + (Math.random() * explosionRatio) - (explosionRatio / 2);
        positionTo.y = position.y + (Math.random() * explosionRatio) - (explosionRatio / 2);
        positionTo.z = position.z + (Math.random() * explosionRatio) - (explosionRatio / 2);
        gameTweens['explosion' + explosionIndex] = new TWEEN.Tween( mesh.position )
            .to( positionTo, duration )
            .easing( TWEEN.Easing.Quadratic.Out )
            .onUpdate( function () {
                if (explosions[this.i] != null) {
                    explosions[this.i].position.x = this.x;
                    explosions[this.i].position.y = this.y;
                    explosions[this.i].position.z = this.z;
                    explosions[this.i].scale.x *= 0.96;
                    explosions[this.i].scale.y *= 0.96;
                    explosions[this.i].scale.z *= 0.96;
                }
            } )
            .onComplete( function () {
                delete(gameTweens['explosion' + this.i]);
                scene.remove(explosions[this.i]);
            } )
            .start();
        explosions[explosionIndex] = mesh;
        scene.add(explosions[explosionIndex]);
        explosionIndex++;
    }
}

/**
 * Removes a bullet from the game including its animation
 * @param index
 */
function removeBullet(index, explosion, explosionY) {
    if (bullets[index] != null && explosion != null && explosion == true) {
        createExplosion({x: bullets[index].position.x, y: explosionY, z: bullets[index].position.z});
    }
    scene.remove(bullets[index]);
    delete(bullets[index]);
    //gameTweens['bullets_' + index].stop();
    delete(gameTweens['bullets_' + index]);
}

/**
 * Removes a bullet from the game including its animation
 * @param index
 */
function removeObject(objectIndex) {
    object = objects[objectIndex];
    if (object == null) {
        return;
    }
    // createExplosion(position, size, amount, explosionSize, color)
    color = 0xff0000;
    if (objects[objectIndex].stats.color != null) {
        color = parseInt(objects[objectIndex].stats.color);
    }
    createExplosion(objects[objectIndex].position, 8, 20, 30, color, 750);
    //gameTweens['bullets_' + index].stop();
    objectElement = mission.elements[object.missionIndex];
    if (objectElement.movement != null) {
        for (var a = 0; a < objectElement.movement.length; a++) {
            delete(gameTweens['object_' + objectIndex + '_' + a]);
        }
    }
    // Add score
    if (objectElement.stats.score != null) {
        addScore(objectElement.stats.score);
    }
    scene.remove(objects[objectIndex]);
    delete(objects[objectIndex]);
    if (destroyableMeshList[objectIndex] != null) {
        delete(destroyableMeshList[objectIndex]);
    }
    if (collisionableMeshList[objectIndex] != null) {
        delete(collisionableMeshList[objectIndex]);
    }
}

/**
 * Function to add score for the current mission. Player will lose the score if it returns
 * to the menu before finishing the mission. After finishing a mission the score will be
 * add to the normal score and stored in the localStorage.
 * @param score
 */
function addScore(score) {
    currentScore = parseInt(document.getElementById('score').innerHTML);
    if (score > 1000) {
        newScore = currentScore + 500;
        score -= 500;
        setTimeout(function () { addScore(score) }, 20);
    }
    else if (score > 500) {
        newScore = currentScore + 250;
        score -= 250;
        setTimeout(function() { addScore(score) }, 30);
    }
    else if (score > 250) {
        newScore = currentScore + 125;
        score -= 125;
        setTimeout(function() { addScore(score) }, 40);
    }
    else if (score > 100) {
        newScore = currentScore + 50;
        score -= 50;
        setTimeout(function() { addScore(score) }, 50);
    }
    else if (score > 50) {
        newScore = currentScore + 25;
        score -= 25;
        setTimeout(function() { addScore(score) }, 60);
        newScore = currentScore + score;
    }
    else if (score > 10) {
        newScore = currentScore + 5;
        score -= 5;
        setTimeout(function() { addScore(score) }, 70);
        newScore = currentScore + score;
    }
    else if (score > 0) {
        newScore = currentScore + 1;
        score -= 1;
        setTimeout(function() { addScore(score) }, 125);
        newScore = currentScore + score;
    }
    document.getElementById('score').innerHTML = newScore;
}