vec4 effect(vec4 color, Image texture, vec2 uv, vec2 xy) {
    float width = xy.x/uv.x;
    float height = xy.y/uv.y;
    vec4 pixel = Texel(texture,uv);
    

    float total = 0;

    for (int i = int(max(xy.x-1,0)); i <= int(min(xy.x+2,width)); i++) {
        for (int j = int(max(xy.y-1,0)); j <= int(min(xy.y+2,height)); j++) {
            float weight = 0;
            float weight2 = 0;
            if (abs(int(xy.y) - j) - 1 < .2) {
                weight = 1;
            }
            else if (abs(xy.y - j) < .2) {
                weight = 2;
            }
            if (xy.x > i) {
                weight *= -1;
            }
            else if(abs(xy.y - j) < .2) {
                weight *= 0;
            }

            if (abs(int(xy.x) - i) - 1 < .2) {
                weight2 = 1;
            }
            else if (abs(xy.x - i) < .2) {
                weight2 = 2;
            }
            if (xy.y > j) {
                weight2 *= -1;
            }
            else if(abs(xy.x - i) < .2) {
                weight2 *= 0;
            }
            vec4 pix = Texel(texture,vec2(i/width,j/height));
            float depth = (pix.r + pix.g + pix.b)/3;
            total += weight * depth + weight2 * depth;
        }
    }
    return vec4(total,total,total,1);
}