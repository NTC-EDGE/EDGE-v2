import * as React from "react";
import { StyleSheet, View, Text, PixelRatio, Platform } from "react-native";
import { useRecoilState } from "recoil";
import { IconButton } from "../components/IconButton";
import {
  editingModeState,
  glContextState,
  glProgramState,
  imageBoundsState,
  imageDataState,
  processingState,
} from "../Store";
import { Slider } from "@miblanchard/react-native-slider";
import { Asset } from "expo-asset";
import { GLView } from "expo-gl";
import * as ImageManinpulator from "expo-image-manipulator";
import * as FileSystem from "expo-file-system";
import _, { debounce, throttle } from "lodash";
import { EditorContext } from "../index";

const vertShader = `
precision highp float;
attribute vec2 position;
varying vec2 uv;
void main () {
  uv = position;
  gl_Position = vec4(1.0 - 2.0 * uv, 0, 1);
}`;

const fragShader = `
precision highp float;
precision highp int;
uniform sampler2D texture;
uniform highp float width;
uniform highp float height;
varying vec2 uv;
uniform highp int radius;
uniform highp int pass;
uniform highp float pixelFrequency;
float gauss (float sigma, float x) {
  float g = (1.0/sqrt(2.0*3.142*sigma*sigma))*exp(-0.5*(x*x)/(sigma*sigma));
  return g;
}
void main () {
  float f_radius = float(radius);
  float sigma = (0.5 * f_radius);
  // Get the color of the fragment pixel
  vec4 color = texture2D(texture, vec2(uv.x, uv.y));
  color *= gauss(sigma, 0.0);
  // Loop over the neightbouring pixels
  for (int i = -30; i <= 30; i++) {
    // Make sure we don't include the main pixel which we already sampled!
    if (i != 0) {
      // Check we are on an index that doesn't exceed the blur radius specified
      if (i >= -radius && i <= radius) {
        float index = float(i);
        // Caclulate the current pixel index
        float pixelIndex = 0.0;
        if (pass == 0) {
          pixelIndex = (uv.y) * height;
        }
        else {
          pixelIndex = uv.x * width;
        }
        // Get the neighbouring pixel index
        float offset = index * pixelFrequency;
        pixelIndex += offset;
        // Normalise the new index back into the 0.0 to 1.0 range
        if (pass == 0) {
          pixelIndex /= height;
        }
        else {
          pixelIndex /= width;
        }
        // Pad the UV 
        if (pixelIndex < 0.0) {
          pixelIndex = 0.0;
        }
        if (pixelIndex > 1.0) {
          pixelIndex = 1.0;
        }
        // Get gaussian amplitude
        float g = gauss(sigma, index);
        // Get the color of neighbouring pixel
        vec4 previousColor = vec4(0.0, 0.0, 0.0, 0.0);
        if (pass == 0) {
          previousColor = texture2D(texture, vec2(uv.x, pixelIndex)) * g;
        }
        else {
          previousColor = texture2D(texture, vec2(pixelIndex, uv.y)) * g;
        }
        color += previousColor;
      }
    }
  }
  // Return the resulting color
  gl_FragColor = color;
}`;

export function Blur() {
  //
  const [, setProcessing] = useRecoilState(processingState);
  const [imageData, setImageData] = useRecoilState(imageDataState);
  const [, setEditingMode] = useRecoilState(editingModeState);
  const [glContext, setGLContext] = useRecoilState(glContextState);
  const [imageBounds] = useRecoilState(imageBoundsState);
  const { throttleBlur } = React.useContext(EditorContext);

  const [sliderValue, setSliderValue] = React.useState(15);
  const [blur, setBlur] = React.useState(15);
  const [glProgram, setGLProgram] = React.useState<WebGLProgram | null>(null);

  // Use refs to persist WebGL resources and prevent repeated allocations during slider updates
  const resourcesRef = React.useRef<{
    mainTexture: WebGLTexture | null;
    firstPassTexture: WebGLTexture | null;
    framebuffer: WebGLFramebuffer | null;
    vertShader: WebGLShader | null;
    fragShader: WebGLShader | null;
    program: WebGLProgram | null;
    locations: {
      texture: WebGLUniformLocation | null;
      width: WebGLUniformLocation | null;
      height: WebGLUniformLocation | null;
      pixelFrequency: WebGLUniformLocation | null;
      radius: WebGLUniformLocation | null;
      pass: WebGLUniformLocation | null;
    };
  }>({
    mainTexture: null,
    firstPassTexture: null,
    framebuffer: null,
    vertShader: null,
    fragShader: null,
    program: null,
    locations: {
      texture: null,
      width: null,
      height: null,
      pixelFrequency: null,
      radius: null,
      pass: null,
    },
  });

  const onClose = React.useCallback(() => {
    // If closing reset the image back to its original
    setGLContext(null);
    setEditingMode("operation-select");
  }, [setGLContext, setEditingMode]);

  const onSaveWithBlur = React.useCallback(async () => {
    // Set the processing to true so no UI can be interacted with
    setProcessing(true);
    // Take a snapshot of the GLView's current framebuffer and set that as the new image data
    const gl = glContext;
    if (gl) {
      gl.drawArrays(gl.TRIANGLES, 0, 6);
      const output = await GLView.takeSnapshotAsync(gl);
      // Do any addtional platform processing of the result and set it as the
      // new image data
      if (Platform.OS === "web") {
        const fileReaderInstance = new FileReader();
        fileReaderInstance.readAsDataURL(output.uri as any);
        fileReaderInstance.onload = async () => {
          const base64data = fileReaderInstance.result;
          const flippedOutput = await ImageManipulator.manipulateAsync(
            base64data as string,
            [{ flip: ImageManipulator.FlipType.Vertical }]
          );
          setImageData({
            uri: flippedOutput.uri,
            width: flippedOutput.width,
            height: flippedOutput.height,
          });

          // Move state updates inside onload to ensure they happen after image update
          setProcessing(false);
          setGLContext(null);
          setEditingMode("operation-select");
        };
      } else {
        const flippedOutput = await ImageManipulator.manipulateAsync(
          output.uri as string,
          [{ flip: ImageManipulator.FlipType.Vertical }]
        );
        setImageData({
          uri: flippedOutput.uri as string,
          width: flippedOutput.width,
          height: flippedOutput.height,
        });

        // Reset back to operation selection mode
        setProcessing(false);
        setGLContext(null);
        // Small timeout so it can set processing state to flase BEFORE
        // Blur component is unmounted...
        setTimeout(() => {
          setEditingMode("operation-select");
        }, 100);
      }
    }
  }, [glContext, setProcessing, setImageData, setGLContext, setEditingMode]);

  // Track initial image URI to prevent redundant GL setups
  const initialUriRef = React.useRef(imageData.uri);

  React.useEffect(() => {
    if (glContext !== null) {
      const setupGL = async () => {
        // Load in the asset and get its height and width
        const gl = glContext;
        const res = resourcesRef.current;

        // Do some magic instead of using asset.download async as this tries to
        // redownload the file:// uri on android and iOS
        let asset;
        if (Platform.OS !== "web") {
          asset = {
            uri: initialUriRef.current,
            localUri: initialUriRef.current,
            height: imageData.height,
            width: imageData.width,
          };
          // Only copy if it's not already in the cache directory as blur.jpg
          const targetUri = FileSystem.cacheDirectory + "blur.jpg";
          if (asset.uri !== targetUri) {
            await FileSystem.copyAsync({
              from: asset.uri,
              to: targetUri,
            });
          }
          asset.localUri = targetUri;
        } else {
          asset = Asset.fromURI(initialUriRef.current);
          await asset.downloadAsync();
        }

        if (asset.width && asset.height) {
          // Setup the shaders for our GL context
          const vert = gl.createShader(gl.VERTEX_SHADER);
          const frag = gl.createShader(gl.FRAGMENT_SHADER);

          if (vert && frag) {
            gl.shaderSource(vert, vertShader);
            gl.compileShader(vert);
            gl.shaderSource(frag, fragShader);
            gl.compileShader(frag);

            const program = gl.createProgram();
            if (program) {
              gl.attachShader(program, vert);
              gl.attachShader(program, frag);
              gl.linkProgram(program);
              gl.useProgram(program);

              // Persist for cleanup and reuse
              res.program = program;
              res.vertShader = vert;
              res.fragShader = frag;

              // Cache uniform locations once to avoid lookups in the drawing loop
              res.locations.texture = gl.getUniformLocation(program, "texture");
              res.locations.width = gl.getUniformLocation(program, "width");
              res.locations.height = gl.getUniformLocation(program, "height");
              res.locations.pixelFrequency = gl.getUniformLocation(program, "pixelFrequency");
              res.locations.radius = gl.getUniformLocation(program, "radius");
              res.locations.pass = gl.getUniformLocation(program, "pass");

              const buffer = gl.createBuffer();
              gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
              const verts = new Float32Array([-1, -1, 1, -1, 1, 1, -1, -1, -1, 1, 1, 1]);
              gl.bufferData(gl.ARRAY_BUFFER, verts, gl.STATIC_DRAW);

              const positionAttrib = gl.getAttribLocation(program, "position");
              gl.enableVertexAttribArray(positionAttrib);
              gl.vertexAttribPointer(positionAttrib, 2, gl.FLOAT, false, 0, 0);

              // Main texture (the original image)
              const mainTexture = gl.createTexture();
              res.mainTexture = mainTexture;
              gl.activeTexture(gl.TEXTURE0);
              gl.bindTexture(gl.TEXTURE_2D, mainTexture);
              gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
              gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
              gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, asset as any);

              // Intermediate texture for the two-pass gaussian blur
              const firstPassTexture = gl.createTexture();
              res.firstPassTexture = firstPassTexture;
              gl.activeTexture(gl.TEXTURE1);
              gl.bindTexture(gl.TEXTURE_2D, firstPassTexture);
              gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
              gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
              gl.texImage2D(
                gl.TEXTURE_2D,
                0,
                gl.RGBA,
                gl.drawingBufferWidth,
                gl.drawingBufferHeight,
                0,
                gl.RGBA,
                gl.UNSIGNED_BYTE,
                null
              );

              // Persistent framebuffer for the first pass
              const fb = gl.createFramebuffer();
              res.framebuffer = fb;
              gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
              gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, firstPassTexture, 0);
              gl.bindFramebuffer(gl.FRAMEBUFFER, null);

              // Initial uniform set
              gl.uniform1i(res.locations.texture, 0);
              gl.uniform1f(res.locations.width, asset.width);
              gl.uniform1f(res.locations.height, asset.height);

              const pixelFrequency = Math.max(Math.round(imageData.width / imageBounds.width / 2), 1);
              gl.uniform1f(res.locations.pixelFrequency, pixelFrequency);

              setGLProgram(program);
            }
          }
        }
      };
      setupGL().catch((e) => console.error(e));
    }
  }, [glContext, imageData]);

  React.useEffect(() => {
    const gl = glContext;
    const res = resourcesRef.current;
    if (gl !== null && res.program !== null && res.framebuffer !== null) {
      // Use cached uniform locations and persistent resources to avoid allocations
      gl.useProgram(res.program);

      // Pass 0: Horizontal/Vertical blur (depending on shader) to persistent intermediate texture
      gl.uniform1i(res.locations.texture, 0); // Use original image (TEXTURE0)
      gl.uniform1i(res.locations.radius, blur);
      gl.uniform1i(res.locations.pass, 0);

      gl.bindFramebuffer(gl.FRAMEBUFFER, res.framebuffer);
      gl.drawArrays(gl.TRIANGLES, 0, 6);
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);

      // Pass 1: Opposite axis blur from intermediate texture to screen
      gl.uniform1i(res.locations.texture, 1); // Use intermediate texture (TEXTURE1)
      gl.uniform1i(res.locations.pass, 1);
      gl.drawArrays(gl.TRIANGLES, 0, 6);

      gl.endFrameEXP();
    }
  }, [blur, glContext, glProgram]);

  const throttleSliderBlur = React.useRef<(value: number) => void>(
    throttle((value) => setBlur(value), 50, { leading: true })
  ).current;

  React.useEffect(() => {
    return () => {
      const gl = glContext;
      const res = resourcesRef.current;
      if (gl) {
        if (res.mainTexture) gl.deleteTexture(res.mainTexture);
        if (res.firstPassTexture) gl.deleteTexture(res.firstPassTexture);
        if (res.framebuffer) gl.deleteFramebuffer(res.framebuffer);
        if (res.program) gl.deleteProgram(res.program);
        if (res.vertShader) gl.deleteShader(res.vertShader);
        if (res.fragShader) gl.deleteShader(res.fragShader);

        res.mainTexture = null;
        res.firstPassTexture = null;
        res.framebuffer = null;
        res.program = null;
        res.vertShader = null;
        res.fragShader = null;
      }
    };
  }, [glContext]);

  if (glContext === null) {
    return null;
  }

  return (
    <View style={styles.container}>
      <View style={[styles.row, { justifyContent: "center" }]}>
        <Slider
          value={sliderValue}
          onValueChange={(value) => {
            setSliderValue(value[0]);
            if (throttleBlur) {
              throttleSliderBlur(Math.round(value[0]));
            } else {
              setBlur(Math.round(value[0]));
            }
          }}
          minimumValue={1}
          maximumValue={30}
          minimumTrackTintColor="#00A3FF"
          maximumTrackTintColor="#ccc"
          thumbTintColor="#c4c4c4"
          containerStyle={styles.slider}
          trackStyle={styles.sliderTrack}
        />
      </View>
      <View style={styles.row}>
        <IconButton iconID="close" text="Cancel" onPress={() => onClose()} />
        <Text style={styles.prompt}>
          Blur Radius: {Math.round(sliderValue)}
        </Text>
        <IconButton
          iconID="check"
          text="Done"
          onPress={() => onSaveWithBlur()}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "column",
    justifyContent: "space-between",
    alignItems: "center",
  },
  prompt: {
    color: "#fff",
    fontSize: 21,
    textAlign: "center",
  },
  row: {
    width: "100%",
    height: 80,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: "2%",
  },
  slider: {
    height: 20,
    width: "90%",
    maxWidth: 600,
  },
  sliderTrack: {
    borderRadius: 10,
  },
});
