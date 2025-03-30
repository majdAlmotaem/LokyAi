from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
from diffusers import StableDiffusionPipeline, StableDiffusionXLPipeline, StableDiffusionImg2ImgPipeline
import torch
from io import BytesIO
import time
from PIL import Image
import base64

app = Flask(__name__)
CORS(app)

device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
print(f"Using device: {device}")

# Initialize models dictionary to store loaded models
models = {}
img2img_models = {}

def get_model(model_id):
    """Load and return the requested model, with caching"""
    if model_id in models:
        return models[model_id]
    
    print(f"Loading model: {model_id}")
    
    if model_id == "stabilityai/stable-diffusion-xl-base-1.0":
        # Initialize SDXL
        model = StableDiffusionXLPipeline.from_pretrained(
            model_id,
            torch_dtype=torch.float16,
            use_safetensors=True,
            variant="fp16"
        ).to(device)
        
        # Apply optimizations for SDXL
        model.enable_attention_slicing(slice_size=1)
        model.enable_vae_slicing()
        model.unet.to(memory_format=torch.channels_last)
        
    elif model_id == "SG161222/Realistic_Vision_V5.1_noVAE":
        # Initialize Realistic Vision
        model = StableDiffusionPipeline.from_pretrained(
            model_id,
            torch_dtype=torch.float16,
            safety_checker=None
        ).to(device)
        
        # Apply basic optimizations
        model.enable_attention_slicing()
    
    elif model_id == "nitrosocke/Ghibli-Diffusion":
        # Initialize Ghibli model
        model = StableDiffusionPipeline.from_pretrained(
            model_id,
            torch_dtype=torch.float16,
            safety_checker=None
        ).to(device)
        
        # Apply basic optimizations
        model.enable_attention_slicing()
        
    # Try to enable xformers for any model
    try:
        model.enable_xformers_memory_efficient_attention()
        print("Using xformers for memory efficient attention")
    except:
        print("xformers not available")
    
    # Cache the model
    models[model_id] = model
    return model

def get_img2img_model(model_id):
    """Load and return the requested img2img model, with caching"""
    if model_id in img2img_models:
        return img2img_models[model_id]
    
    print(f"Loading img2img model: {model_id}")
    
    # For img2img we need to use the specific pipeline
    # First get the text2img model (loading components)
    text2img_pipe = get_model(model_id)
    
    # Create img2img pipeline reusing components
    if model_id == "stabilityai/stable-diffusion-xl-base-1.0":
        # For SDXL, we need a different approach
        from diffusers import StableDiffusionXLImg2ImgPipeline
        
        model = StableDiffusionXLImg2ImgPipeline(
            vae=text2img_pipe.vae,
            text_encoder=text2img_pipe.text_encoder,
            text_encoder_2=text2img_pipe.text_encoder_2,
            tokenizer=text2img_pipe.tokenizer,
            tokenizer_2=text2img_pipe.tokenizer_2,
            unet=text2img_pipe.unet,
            scheduler=text2img_pipe.scheduler
        ).to(device)
    else:
        # For regular SD models
        model = StableDiffusionImg2ImgPipeline(
            vae=text2img_pipe.vae,
            text_encoder=text2img_pipe.text_encoder,
            tokenizer=text2img_pipe.tokenizer,
            unet=text2img_pipe.unet,
            scheduler=text2img_pipe.scheduler,
            safety_checker=None,
            feature_extractor=None,
            requires_safety_checker=False
        ).to(device)
    
    # Apply optimizations
    model.enable_attention_slicing()
    
    try:
        model.enable_xformers_memory_efficient_attention()
    except:
        print("xformers not available for img2img")
    
    # Cache the model
    img2img_models[model_id] = model
    return model

@app.route('/generate', methods=['OPTIONS', 'POST'])
def generate_image():
    if request.method == 'OPTIONS':
        return '', 200

    data = request.get_json()
    prompt = data.get('message', '')
    model_id = data.get('model', 'stabilityai/stable-diffusion-xl-base-1.0')
    
    # Get the appropriate model
    model = get_model(model_id)
    
    start_time = time.time()
    
    # Generate image with model-specific settings
    if model_id == "stabilityai/stable-diffusion-xl-base-1.0":
        image = model(
            prompt=prompt,
            num_inference_steps=20,
            guidance_scale=7.0,
            height=512,
            width=512
        ).images[0]
    elif model_id == "nitrosocke/Ghibli-Diffusion":
        # For Ghibli model, we can enhance the prompt
        enhanced_prompt = prompt
        if "ghibli style" not in prompt.lower():
            enhanced_prompt = f"{prompt}, ghibli style"
        
        image = model(
            prompt=enhanced_prompt,
            num_inference_steps=25,
            guidance_scale=7.0,
            height=512,
            width=512
        ).images[0]
    else:
        image = model(
            prompt=prompt,
            num_inference_steps=30,
            guidance_scale=7.5,
            height=512,
            width=512
        ).images[0]
    
    print(f"Image generation took {time.time() - start_time:.2f} seconds")
    
    # Convert to bytes for sending
    img_io = BytesIO()
    image.save(img_io, 'PNG')
    img_io.seek(0)
    
    return send_file(img_io, mimetype='image/png')

@app.route('/img2img', methods=['OPTIONS', 'POST'])
def transform_image():
    if request.method == 'OPTIONS':
        return '', 200

    data = request.get_json()
    prompt = data.get('message', 'transform this image')
    image_data = data.get('image', '')
    model_id = data.get('model', 'stabilityai/stable-diffusion-xl-base-1.0')
    strength = float(data.get('strength', 0.6))  # Default to 0.6 for better detail preservation
    
    # Get the img2img model for the selected model
    model = get_img2img_model(model_id)
    
    # Decode base64 image
    image_data = image_data.split(',')[1] if ',' in image_data else image_data
    image_bytes = base64.b64decode(image_data)
    init_image = Image.open(BytesIO(image_bytes)).convert("RGB")
    
    # Resize to appropriate size based on model
    if model_id == "stabilityai/stable-diffusion-xl-base-1.0":
        # SDXL works better with 1024x1024
        if init_image.width != 1024 or init_image.height != 1024:
            init_image = init_image.resize((1024, 1024), Image.LANCZOS)
    else:
        # Other models use 512x512
        if init_image.width != 512 or init_image.height != 512:
            init_image = init_image.resize((512, 512), Image.LANCZOS)
    
    start_time = time.time()
    
    # Model-specific settings
    if model_id == "stabilityai/stable-diffusion-xl-base-1.0":
        image = model(
            prompt=prompt,
            image=init_image,
            strength=strength,
            num_inference_steps=30,
            guidance_scale=7.5
        ).images[0]
    elif model_id == "SG161222/Realistic_Vision_V5.1_noVAE":
        # For Realistic Vision, use settings that preserve more details
        image = model(
            prompt=f"{prompt}, realistic, detailed, high quality",
            image=init_image,
            strength=strength,
            num_inference_steps=35,
            guidance_scale=7.0
        ).images[0]
    elif model_id == "nitrosocke/Ghibli-Diffusion":
        # For Ghibli model, enhance prompt with ghibli style
        enhanced_prompt = prompt
        if "ghibli style" not in prompt.lower():
            enhanced_prompt = f"{prompt}, ghibli style"
        
        image = model(
            prompt=enhanced_prompt,
            image=init_image,
            strength=strength,
            num_inference_steps=25,
            guidance_scale=7.0
        ).images[0]
    else:
        # Default settings for any other model
        image = model(
            prompt=prompt,
            image=init_image,
            strength=strength,
            num_inference_steps=30,
            guidance_scale=7.0
        ).images[0]
    
    print(f"Image transformation took {time.time() - start_time:.2f} seconds")
    
    # Convert to bytes for sending
    img_io = BytesIO()
    image.save(img_io, 'PNG')
    img_io.seek(0)
    
    return send_file(img_io, mimetype='image/png')

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
