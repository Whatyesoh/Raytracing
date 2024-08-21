vec4 effect(vec4 color, Image texture, vec2 uv, vec2 xy) {
    float width = xy.x/uv.x;
    float height = xy.y/uv.y;

    if (uv.y < .5) {
        uv.y -= .1 * pow(abs(uv.x-.5),2.5);
    }
    else if (uv.y > .5){
        uv.y += .1 * pow(abs(uv.x-.5),2.5);
    }
    float xyy = uv.y * height;
    float borderWidth = 5;
    float borderColor = .1;
    if (xy.x < borderWidth || xyy < borderWidth || xy.x > width-borderWidth || xyy > height-borderWidth) {
        return vec4(borderColor,borderColor,borderColor,borderColor);
    }
    vec4 pixel = Texel(texture,uv);
    int bandSize = 3;
    if (mod(xy.y,bandSize) < bandSize/2.0 ) {
        pixel = vec4(0,0,0,1);
    }
    return .9 * pixel * pixel;
}