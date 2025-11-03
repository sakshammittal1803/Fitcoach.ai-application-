// src/components/config.js
export const APP_CONFIG = {
  appName: "FitCoach AI",
  aiName: "Fit.ai",
  aiModel: "gemini-1.5-flash", // Current stable model
  pointsPerPhoto: 200,
  welcomeTimeout: 800,

  avatars: {
    ai: "https://lh3.googleusercontent.com/aida-public/AB6AXuBIwLGQjCiRzwfkMCnvZlrEaZcsSH7y6xzt6cBfNC3hed8LEfFTJr0k0aVFaU9FSjfEQvpH7lqVhVdDKeDHz16k1CZW0y-OIv1VQzJhfLLh10yWnF6yVx81OwsYcMPufior-2JP-PzFoekV0Cbf15eIL72Q6cYxUzLtsJjQ3UdxYVRg_Nu5yC3eKzTwMLOofNRizZlJoXhvABMdLkKrbLE-3gYaecLreR_OubFux8MXxYCMeY_5nE_xEiuIx_EmTg6FVcg9M3gHxNFV",
    male: "https://cdn-icons-png.flaticon.com/512/3135/3135715.png",
    female: "https://cdn-icons-png.flaticon.com/512/3135/3135789.png"
  },

  messages: {
    apiKeyMissing: `
**OpenRouter API Key Required**

Hi there! To chat with **{{aiName}}**, you need a free API key:

🔑 **Quick Setup:**
1. Visit [OpenRouter.ai](https://openrouter.ai/keys)
2. Sign up/Login (free!)
3. Create your API key
4. Enter it below to start chatting

**Why OpenRouter?**
• Access to multiple AI models (Gemini, GPT, Claude)
• Pay-per-use pricing (very affordable)
• No monthly subscriptions
• Better reliability than direct APIs

Ready to get started? 🚀
    `.trim(),

    welcome: `
Hey **{{name}}**! I'm **{{aiName}}**, your AI fitness coach!

{{profile}}

**I can help with:**
• Custom workout plans
• Meal planning & nutrition
• Form analysis (upload a photo!)
• Goal tracking & motivation

What would you like to work on today?
    `.trim(),

    profileSummary: `
**Your Profile:**
{{stats}}
`.trim(),

    aiTyping: "thinking...",
    sendButton: "Send",
    fileButton: "Attach",
    voiceButton: "Voice",
    onlineStatus: "Online",
    offlineStatus: "Setup Required"
  },

  links: {
    apiKey: "https://openrouter.ai/keys"
  }
};