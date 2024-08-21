//
//Structs
//

extern Image sphereTexture;
extern Image quadTexture;
extern bool depth;
float width = love_ScreenSize.x;
float height = love_ScreenSize.y;
extern Image noise;
vec2 seed;
extern float num;

struct ray {
    vec3 orig;
    vec3 dir;
};

struct hitRecord {
    vec3 p;
    vec3 normal;
    float t;
    bool frontFace;
    bool hit;
    int i;
    int hitType;
    float u;
    float v;
    int id;
};

struct sphere {
    vec3 center;
    float radius;
    vec4 color;
    bool tex;
    int id;
};

struct quad {
    vec3 Q;
    vec3 u;
    vec3 v;
    vec4 color;
    bool tex;
    int id;
};

struct light {
    vec4 color;
    vec3 position;
    vec3 dir;
    bool sun;
};

float rand(){
    float temp =  fract(sin(dot(seed, vec2(12.9898, 78.233))) * 43758.5453);
    seed.r = fract(sin(dot(seed, vec2(78.233, 12.9898))) * 43758.5453);
    seed.g = temp;
    return temp;

}

float lengthSquared(vec3 v) {
    return v.x * v.x + v.y * v.y + v.z * v.z;
}

vec3 randInUnitSphere() {
    while (true) {
        vec3 p = vec3(1*(rand()-.5),1*(rand()-.5),1*(rand()-.5));
        if (lengthSquared(p) < 1) {
            return p;
        }
    }
}

vec3 randUnitVector() {
    return normalize(randInUnitSphere());
}

vec3 randOnHemisphere(vec3 normal) {
    vec3 onUnitSphere = randUnitVector();
    if (dot(onUnitSphere,normal) > 0.0) {
        return onUnitSphere;
    }
    else {
        return -onUnitSphere;
    }
}

vec3 unitVector (vec3 v) {
    return v / (sqrt(pow(v.x,2)+pow(v.y,2)+pow(v.z,2)));
}

float vPHeight = 2;
float vPWidth = vPHeight * (width/height);
number samplesPerPixel = 50;

extern vec3 lookFrom = vec3(0,20,0);
vec3 cameraCenter = lookFrom;
extern vec3 lookAt = vec3(0,20,-1);
float focalLength = 1;
vec3 vup = unitVector(vec3(0,1,0));
vec3 w = unitVector(lookFrom-lookAt);
vec3 u = unitVector(cross(vup,w));
vec3 v = cross(w,u);


vec3 rayAt (ray r, float t) {
    return r.orig + t * r.dir;
}

vec3 sampleSquare() {
    return vec3(rand()-.5,rand()-.5,0);
}

ray getRay(number i,number j, vec3 pixelOrigin, vec3 cameraCenter, vec3 pDU, vec3 pDV, float total, float current) {
    float sideLength = sqrt(total);
    vec3 offset = vec3((current / total) - .5,(current - current / sideLength)/sideLength-.5, 0 );
    offset = sampleSquare();
    vec3 pixelSample = pixelOrigin + ((i + offset.x) * pDU) + ((j + offset.y) * pDV);
    vec3 rayOrigin = cameraCenter;
    vec3 rayDirection = pixelSample - rayOrigin;

    return ray(rayOrigin,rayDirection);
}

bool hitSphere(sphere s, ray r, float tmin, float tmax, out hitRecord rec, hitRecord tempRec, int i) {
    rec = tempRec;
    vec3 oc = s.center - r.orig;
    float a = dot(r.dir,r.dir);
    float h = dot(r.dir,oc);
    float c = dot(oc,oc) - s.radius*s.radius;
    float discriminant = h * h - a * c;
    
    if (discriminant < 0) {
        return false;
    }
    
    float sqrtd = sqrt(discriminant);

    float root = (h - sqrtd) / a;

    if (root <= tmin || root >= tmax) {
        root = (h + sqrtd) / a;
        if (root <= tmin || root >= tmax) {
            return false;
        }
    }

    rec.t = root;
    rec.hitType = 0;
    rec.i = i;
    rec.id = s.id;
    rec.p = rayAt(r, rec.t);
    rec.hit = true;
    vec3 outwardNormal = (rec.p - s.center) / s.radius;
    rec.frontFace = dot(r.dir,outwardNormal) < 0;
    rec.normal = rec.frontFace ? outwardNormal : -outwardNormal;

    return true;
}

bool hitQuad(quad q, ray r, float tmin, float tmax, out hitRecord rec, hitRecord tempRec, int i) {
    rec = tempRec;
    vec3 n = cross(q.u,q.v);
    vec3 normal = unitVector(n);
    float denom = dot(normal,r.dir);

    if (abs(denom) <= 1e-8) {
        return false;
    }

    float t = (dot(normal,q.Q) - dot(normal,r.orig))/denom;
    if (t <= tmin || t >= tmax) {
        return false;
    }

    vec3 intersection = rayAt(r,t);

    vec3 planarHitptVector = intersection - q.Q;
    vec3 w = n / dot(n,n);
    float alpha = dot(w,cross(planarHitptVector, q.v));
    float beta = dot(w,cross(q.u,planarHitptVector));

    if (alpha > 1 || alpha < 0 || beta > 1 || beta < 0 ) {
        return false;
    }
    rec.u = alpha;
    rec.v = beta;
    rec.t = t;
    rec.hitType = 1;
    rec.p = intersection;
    rec.hit = true;
    rec.i = i;
    rec.id = q.id;
    rec.normal = normalize(-n * (dot(n,rec.p-r.orig)/abs(dot(n,rec.p-r.orig))));

    return true;

}

vec4 rayColor (ray r, out hitRecord rec, sphere[4] worldSpheres, light[1] worldLights, quad[6] worldQuads, vec4 ambient) {
    
    vec4 hitColor = vec4(1,1,1,1);
    vec4 origColor = hitColor;

    for (int j = 0; j < 20; j ++) {
        hitRecord tempRec;
        rec.hit = false;
        rec.t = 100000;

        for (int i = 0; i < worldQuads.length(); i++) {
            tempRec = rec;
            hitQuad(worldQuads[i],r,0,rec.t,rec,tempRec,i);
        }
        for (int i = 0; i < worldSpheres.length(); i++) {
            tempRec = rec;
            hitSphere(worldSpheres[i],r,0,rec.t,rec,tempRec,i);
        }

        if (rec.hit) {
            if (rec.hitType == 0) {
                hitColor *= worldSpheres[rec.i].color;
            }
            else if (rec.hitType == 1) {
                hitColor *= worldQuads[rec.i].color;
            }

            vec3 direction;

            if (rec.id == 1) {
                float fuzz = hitColor.a;
                direction = reflect(r.dir,rec.normal);
                //direction = randOnHemisphere(rec.normal);
                direction = normalize(direction) + (fuzz * randOnHemisphere(rec.normal));
                //return vec4(direction,1);
                if (dot(direction,rec.normal) < 0) {
                    return vec4(0,0,0,1);
                }
            }
            else if (rec.id == 2) {
                hitColor *= .5;
                direction = randOnHemisphere(rec.normal);
                //return vec4(rec.normal, 1);
                //direction = rec.normal + randUnitVector();
            }
            
            else if (rec.id == 3) {
                hitColor *= hitColor.a;
                //hitColor.a = 0;
                //hitColor = normalize(hitColor);
                hitColor.a = 1;
                return hitColor;
                if (rec.hitType == 0) {
                    
                    return worldSpheres[rec.i].color;
                    hitColor /= origColor;
                    origColor += worldSpheres[rec.i].color;
                }
                else if (rec.hitType == 1) {
                    return worldQuads[rec.i].color;
                    hitColor /= origColor;
                    origColor += worldQuads[rec.i].color;
                }
                return origColor * hitColor;
            }
            else if (rec.id == 4) {
                direction = r.dir;
                direction = refract(normalize(r.dir),normalize(rec.normal),hitColor.a);
            }
            
            r.dir = direction;
            r.orig = rec.p + direction * .00001;
            hitColor.a = 1;
        }

        else {

            vec3 unitDirection = unitVector(r.dir);
            float a = .5 * (unitDirection.y + 1);
            //hitColor *= normalize(((1-a) * vec4(1,1,1,1) + a * vec4(.25,.25,25,1)));
            hitColor *= vec4(.5,.5,.5,1);
            return hitColor;
        }
    }

    return hitColor;
}



//
//Main Shader Code
//

vec3 POV(float x,float y,float z) {
    return vec3(x,y,z);
}

vec4 effect(vec4 color, Image texture, vec2 uv, vec2 xy) {
    
    seed = Texel(noise,uv).rg;

    vec3 temp = vec3(0,0,0);

    vec3 vPU = vPWidth * u;
    vec3 vPV = vPHeight * -v;


    vec3 pDU = vPU / width;
    vec3 pDV = vPV / height;
    vec3 vUL = cameraCenter - (focalLength * w) - vPU/2 - vPV/2;
    vec3 pixelOrigin = vUL + .5 * pDV + .5 * pDU;


    float infinity = 10000000;

    hitRecord rec;
    rec.hit = false;
    rec.t = infinity;
    hitRecord tempRec;

    sphere worldSpheres[4];
    worldSpheres[0] = sphere(POV(0,20.5,1),.5,vec4(.9,0,.9,.1),true,1);
    worldSpheres[1] = sphere(POV(3,21,3),1,vec4(1,1,1,.1),true,4);
    worldSpheres[2] = sphere(POV(500,500,3),100,vec4(1,1,1,100),true,3);
    worldSpheres[3] = sphere(POV(0,21,3),.3,vec4(.5,.2,.7,.1),true,4);

    light worldLights[1];
    worldLights[0] = light(vec4(.8,.7,.5,1),POV(0,24,-10),vec3(0,0,0),true);

    quad worldQuads[6];
    worldQuads[0] = quad(vec3(-50,20,-50),vec3(100,0,0),vec3(0,0,100),vec4(1,1,1,1),true,2);
    worldQuads[1] = quad(vec3(-5,25,0),vec3(2,2,0),vec3(0,0,2),vec4(1,1,1,100),true,4);
    worldQuads[2] = quad(vec3(-5,20,0),vec3(0,.5,0),vec3(0,0,.5),vec4(1,0,1,1),true,4);
    worldQuads[3] = quad(vec3(-5.5,20,0),vec3(0,.5,0),vec3(0,0,.5),vec4(1,1,0,1),true,4);
    worldQuads[4] = quad(vec3(-5,20,.5),vec3(-.5,0,0),vec3(0,.5,0),vec4(0,1,1,1),true,4);
    worldQuads[5] = quad(vec3(-5,20,0),vec3(-.5,0,0),vec3(0,.5,0),vec4(1,.5,0,1),true,4);

    ray r;
    color = vec4(0,0,0,0);


    for (int j = 0; j < samplesPerPixel; j++) {
        r = getRay(xy.x, xy.y, pixelOrigin, cameraCenter, pDU, pDV,samplesPerPixel,j);
        color += rayColor(r, rec,worldSpheres, worldLights,worldQuads,vec4(.5,.7,1,1));
    }
    color /= samplesPerPixel;
    color = normalize(color);
    color.a = 1;
    return (color);
}