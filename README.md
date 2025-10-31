# Facelift AI: Your AI-powered Image & Video Studio

Facelift AI is a web application that leverages the power of Google's Gemini API to provide a seamless and intuitive creative experience. Users can edit images with simple text prompts and generate dynamic videos from a single static image.

The application features a clean, tab-based interface allowing users to easily switch between the Image Editor and the Video Generator.

## ✨ Key Features

### 🎨 Image Editor
- **Upload & Edit**: Upload any image (PNG, JPG, etc.).
- **Text-Based Prompts**: Describe your desired changes in plain English (e.g., "add a retro filter," "make the sky purple").
- **Fast & Creative**: Powered by the `gemini-2.5-flash-image` model for quick and imaginative image modifications.
- **Side-by-Side View**: Instantly compare the original and edited images in a clear, side-by-side layout.

### 🎬 Video Generator
- **Image-to-Video**: Transform a single static image into a captivating video.
- **Scene Direction**: Provide a text prompt to direct the animation and overall scene.
- **Aspect Ratios**: Choose between landscape (`16:9`) and portrait (`9:16`) aspect ratios for your video.
- **Powerful Generation**: Utilizes the advanced `veo-3.1-fast-generate-preview` model.
- **User-Friendly Loading**: A helpful loading state with reassuring messages keeps you informed during the multi-minute generation process.

## 🔑 API Key Requirement

The **Video Generation** feature uses the Veo model, which is a premium offering and requires a Gemini API key with **billing enabled**.

- The application provides a seamless, integrated flow to select your API key when you first access the Video Generator.
- If an API call fails due to an invalid key or missing billing information, you will be prompted to select a new key.
- For more information on setting up billing, please visit the [official Gemini API billing documentation](https://ai.google.dev/gemini-api/docs/billing).

## 🛠️ Tech Stack

- **Frontend**: React, TypeScript, Tailwind CSS
- **AI Models**:
  - **Image Editing**: `gemini-2.5-flash-image`
  - **Video Generation**: `veo-3.1-fast-generate-preview`
- **API SDK**: `@google/genai`
