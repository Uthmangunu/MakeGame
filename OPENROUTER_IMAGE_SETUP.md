# 🎨 OpenRouter Image Generation Setup

## Quick Reference for Flux Models

OpenRouter supports image generation through the **chat completions endpoint** with `modalities: ["image", "text"]`.

### Available Image Models on OpenRouter:

1. **black-forest-labs/flux.2-pro** - Best quality for pixel art
2. **black-forest-labs/flux.2-flex** - Faster, cheaper
3. **google/gemini-2.5-flash-image-preview** - Good fallback option

### Correct API Usage:

OpenRouter uses the **chat completions endpoint with modalities**:

```typescript
const response = await openai.chat.completions.create({
  model: "black-forest-labs/flux.2-pro",
  messages: [
    {
      role: "user",
      content: "pixel art sprite of a knight..."
    }
  ],
  modalities: ["image", "text"]
});

// Images returned as base64-encoded data URLs
const base64Image = response.choices[0].message.images[0];
```

### Model Comparison:

| Model | Quality | Speed | Cost | Best For |
|-------|---------|-------|------|----------|
| flux.2-pro | ⭐⭐⭐⭐⭐ | Medium | $$$ | Production sprites |
| flux.2-flex | ⭐⭐⭐⭐ | Fast | $$ | Quick iterations |
| gemini-2.5-flash-image | ⭐⭐⭐ | Fast | $ | Fallback option |

### Response Format:

Images are returned as **base64-encoded data URLs** in PNG format:
```
data:image/png;base64,iVBORw0KGgo...
```

### Check Your Credits:

Visit: https://openrouter.ai/credits

### Test Command:

```bash
curl https://openrouter.ai/api/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $OPENROUTER_API_KEY" \
  -d '{
    "model": "black-forest-labs/flux.2-pro",
    "messages": [
      {
        "role": "user",
        "content": "pixel art sprite, 16-bit style, knight with sword"
      }
    ],
    "modalities": ["image", "text"]
  }'
```

---

## 📚 Official Documentation

For the latest information, visit:
- https://openrouter.ai/docs/guides/overview/multimodal/image-generation.mdx
- https://openrouter.ai/models (filter by image generation capability)
