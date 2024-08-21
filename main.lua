if arg[2] == "debug" then
    require("lldebugger").start()
  end
  
io.stdout:setvbuf("no")

function love.load()

    speed = 3
    vertSpeed = 0

    wheld = 0
    sheld = 0
    aheld = 0
    dheld = 0

    theta = 0

    cameraPos = {0,20.5,0}
    cameraLook = {0,20.5,0}
    aspectRatio = 16/9
    imageWidth = 400
    imageHeight = math.floor(imageWidth/aspectRatio)

    love.window.setFullscreen(true)
    love.window.setVSync(0)

    imageHeight = love.graphics.getHeight()
    imageWidth = love.graphics.getWidth()

    love.mouse.setPosition(imageWidth/2,imageHeight/2)
    love.mouse.setVisible(false)

    width = love.graphics.getWidth()
    height = love.graphics.getHeight()


    screen = love.graphics.newCanvas(imageWidth,imageHeight)
    preGaus = love.graphics.newCanvas()

    mainShader = love.graphics.newShader("Shaders/rayTracer.frag")
    gaussian = love.graphics.newShader("Shaders/differenceOfGaussian.frag")
    kuwahara = love.graphics.newShader("Shaders/smoothingShader.frag")

    sphereTexture = love.graphics.newImage("Textures/earthmap.jpg")
    quadTexture = love.graphics.newImage("Textures/quad.jpg")

    if mainShader:hasUniform("sphereTexture") then
        mainShader:send("sphereTexture",sphereTexture)
    end
    if mainShader:hasUniform("quadTexture") then
        mainShader:send("quadTexture",quadTexture)
    end

    --Generate noise

    noiseMap = love.graphics.newCanvas()

    love.graphics.setCanvas(noiseMap)

    for i = 0,width do
        for j = 0, height do
            love.graphics.setColor(love.math.random(),love.math.random(),love.math.random(),1)
            love.graphics.points(i,j)
        end
    end
    love.graphics.setColor(1,1,1,1)
    love.graphics.setCanvas()

    noise = love.graphics.newImage(noiseMap:newImageData())

    if (mainShader:hasUniform("noise")) then
        mainShader:send("noise",noise)
    end

    num = 0
end

function love.keypressed(key) 
    if key == "w" then
        wheld = 1
    end
    if key == "a" then
        aheld = 1
    end
    if key == "s" then
        sheld = 1
    end
    if key == "d" then
        dheld = 1
    end
    if key == "space" then
        if cameraPos[2] == 20.5 then
            vertSpeed = 5
        end
    end
end

function love.keyreleased(key)
    if key == "w" then
        wheld = 0
    end
    if key == "a" then
        aheld = 0
    end
    if key == "s" then
        sheld = 0
    end
    if key == "d" then
        dheld = 0
    end
end

function love.mousemoved(x,y,dx,dy)
    theta = theta + dx * .005
    if (love.mouse.getX() >= .7 * imageWidth or love.mouse.getX() <= .3 * imageWidth) then
        love.mouse.setPosition(imageWidth/2,imageHeight/2)
    end
end

function love.update(dt)

    num = num + dt
    if mainShader:hasUniform("num") then
        mainShader:send("num",num)
    end

    cameraPos[2] = cameraPos[2] + vertSpeed * dt
    if cameraPos[2] < 20.5 then
        vertSpeed = 0
        cameraPos[2] = 20.5
    else
        vertSpeed = vertSpeed - 10 * dt
    end

    if wheld == 1 then
        cameraPos[3] = cameraPos[3] + math.sin(theta) * dt * speed
        cameraPos[1] = cameraPos[1] + math.cos(theta) * dt * speed
    end
    if aheld == 1 then
        cameraPos[3] = cameraPos[3] - math.cos(theta) * dt * speed
        cameraPos[1] = cameraPos[1] + math.sin(theta) * dt * speed
    end
    if sheld == 1 then
        cameraPos[3] = cameraPos[3] - math.sin(theta) * dt * speed
        cameraPos[1] = cameraPos[1] - math.cos(theta) * dt * speed
    end
    if dheld == 1 then
        cameraPos[3] = cameraPos[3] + math.cos(theta) * dt * speed
        cameraPos[1] = cameraPos[1] - math.sin(theta) * dt * speed
    end

    cameraLook[1] = cameraPos[1] - math.cos(math.pi - theta)
    cameraLook[2] = cameraPos[2]
    cameraLook[3] = cameraPos[3] + math.sin(math.pi - theta)

    if mainShader:hasUniform("lookFrom") then
        mainShader:send("lookFrom",cameraPos)
    end
    if mainShader:hasUniform("lookAt") then
        mainShader:send("lookAt",cameraLook)
    end
    
end

function love.draw()
    love.graphics.setShader(mainShader)
    love.graphics.setCanvas(preGaus)
    love.graphics.draw(screen)

    love.graphics.setCanvas()
    love.graphics.setShader()
    love.graphics.draw(preGaus)
   
end