extern Image orig;
extern bool show = true;
float size = 5;

vec4 effect(vec4 color, Image texture, vec2 uv, vec2 xy) {
    float width = xy.x / uv.x;
    float height = xy.y / uv.y;


    color = Texel(texture,uv);
    vec4 oldColor = color;


    //return vec4((dX+dY),1);

    int lowerX = int(size*floor(xy.x/size));
    int lowerY = int(size*floor(xy.y/size));

    vec4 average = vec4(0,0,0,0);
    vec4 average1 = vec4(0,0,0,0);
    vec4 average2 = vec4(0,0,0,0);
    vec4 average3 = vec4(0,0,0,0);
    float std = 0;
    float std1 = 0;
    float std2 = 0;
    float std3 = 0;
    vec4 newColor;
    int total = 0;
    float threshold = .5;

    for (int i = int(max(0,xy.x-size)); i < xy.x;i++) {
        for (int j = int(max(0,xy.y-size)); j < xy.y;j++) {
            average += Texel(texture,vec2(i/width,j/height));
            total += 1;
        }
    }

    if (total == 0) {
        total = 1;
    }
    average /= total;

    for (int i = int(max(0,xy.x-size)); i < xy.x;i++) {
        for (int j = int(max(0,xy.y-size)); j < xy.y;j++) {
            newColor = Texel(texture,vec2(i/width,j/height));
            std += dot(newColor-average,newColor-average);
        }
    }
    std = std / total;
    std = sqrt(std);
    total = 0;

    for (int i = int(max(0,xy.x-size)); i < xy.x;i++) {
        for (int j = int(xy.y); j < int(min(height,xy.y+size));j++) {
            average1 += Texel(texture,vec2(i/width,j/height));
            total += 1;
        }
    }

    if (total == 0) {
        total = 1;
    }
    average1 /= total;

    for (int i = int(max(0,xy.x-size)); i < xy.x;i++) {
        for (int j = int(xy.y); j < int(min(height,xy.y+size));j++) {
            newColor = Texel(texture,vec2(i/width,j/height));
            std1 += dot(newColor-average1,newColor-average1);
        }
    }

    std1 = std1 / total;
    std1 = sqrt(std1);
    total = 0;

    for (int i = int(xy.x); i < int(min(width,xy.x+size));i++) {
        for (int j = int(xy.y); j < int(min(height,xy.y+size));j++) {
            average2 += Texel(texture,vec2(i/width,j/height));
            total += 1;
        }
    }

    if (total == 0) {
        total = 1;
    }
    average2 /= total;
    for (int i = int(xy.x); i < int(min(width,xy.x+size));i++) {
        for (int j = int(xy.y); j < int(min(height,xy.y+size));j++) {
            newColor = Texel(texture,vec2(i/width,j/height));
            std2 += dot(newColor-average2,newColor-average2);
        }
    }
    std2 = std2 / total;
    std2 = sqrt(std2);
    total = 0;

    for (int i = int(xy.x); i < int(min(width,xy.x+size));i++) {
        for (int j = int(max(0,xy.y-size)); j < int(xy.y);j++) {
            average3 += Texel(texture,vec2(i/width,j/height));
            total += 1;
        }
    }


    if (total == 0) {
        total = 1;
    }
    average3 /= total;
    for (int i = int(xy.x); i < int(min(width,xy.x+size));i++) {
        for (int j = int(max(0,xy.y-size)); j < int(xy.y);j++) {
            newColor = Texel(texture,vec2(i/width,j/height));
            std3 += dot(newColor-average3,newColor-average3);
        }
    }
    std3 = std3 / total;
    std3 = sqrt(std3);
    total = 0;

    float least = min(min(min(std,std1),std2),std2);

    if (least == std) {
        return average;
    }
    if (least == std1) {
        return average1;
    }
    if (least == std2) {
        return average2;
    }

    return average3;

}