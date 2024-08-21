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

extern Image lines;

vec4 effect(vec4 color, Image texture, vec2 uv, vec2 xy) {
    float width = xy.x/uv.x;
    float height = xy.y/uv.y;
    return gaussianBlur(2,xy,texture,width,height);
    vec4 pixel = Texel(texture,uv);
    vec4 newPixel = gaussianBlur(1,xy,texture, width, height) - gaussianBlur(2,xy,texture,width,height);
    float average = (newPixel.r + newPixel.g + newPixel.b)/3;

    if (average >= .04) {
        return vec4(1,1,1,1);
    }
    return vec4(0,0,0,1);

    return newPixel;
    

}