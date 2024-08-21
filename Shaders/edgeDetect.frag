vec4 gaussianBlur(float sigma,vec2 xy, Image texture, float width, float height) {
    float gaussian = 0;
    float total = 0;
    vec4 colorTotal = vec4(0,0,0,0);
    for (int i = int(max(xy.x-5,0)); i < int(min(xy.x+5,width));i++) {
        for (int j = int(max(xy.y-5,0)); j < int(min(xy.y+5,height));j++) {
            gaussian = 1/(2*3.14159*sigma*sigma)*pow(2.718,-(pow(i-xy.x,2)+pow(j-xy.y,2))/(2*sigma*sigma));
            colorTotal += Texel(texture,vec2(i/width,j/height)) * gaussian;
        }
    }
    return colorTotal;
}

vec4 effect(vec4 color, Image texture, vec2 uv, vec2 xy) {
    float width = xy.x/uv.x;
    float height = xy.y/uv.y;
    vec4 pixel = gaussianBlur(1,xy,texture,width,height);
    float maxColor = 1/ max(pixel.b,max(pixel.r,pixel.g));
    pixel *= maxColor;
    float ave = (pixel.r + pixel.g + pixel.b) / 3;
    vec3 total = vec3(0,0,0);
    for (int i = int(max(xy.x-1,0)); i <= int(min(xy.x+2,width)); i++) {
        for (int j = int(max(xy.y-1,0)); j <= int(min(xy.y+2,height)); j++) {
            vec4 pix = gaussianBlur(1,vec2(xy.x + i, xy.y + j),texture,width * 2,height * 2);
            float newMaxColor = 1 / max(pix.b,max(pix.r,pix.g));
            pix *= newMaxColor;
            float newAve = (pix.r + pix.g + pix.b) / 3;
            total += abs(ave-newAve);
        }
    }
    pixel.rgb = total;
    return vec4(1-pixel.rgb,1);
}