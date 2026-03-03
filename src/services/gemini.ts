import { GoogleGenAI, Type } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function generateHooks(category: string): Promise<string[]> {
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Generate exactly 50 short viral hooks for the category '${category}'.
Rules:
- Hooks must be short (1 line)
- Emotional or curiosity-based
- Optimized for TikTok/Reels
- Clear, direct, high curiosity
- No long explanation`,
    config: {
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.ARRAY,
        items: { type: Type.STRING },
      },
    },
  });
  try {
    return JSON.parse(response.text || '[]');
  } catch (e) {
    console.error("Failed to parse hooks JSON", e);
    return [];
  }
}

export async function generateScript(
  category: string,
  hook: string,
  scenesCount: number,
  gender: string,
  referenceImageBase64?: string,
  referenceImageMimeType?: string
) {
  const parts: any[] = [];
  
  if (referenceImageBase64 && referenceImageMimeType) {
    parts.push({
      inlineData: {
        data: referenceImageBase64.split(',')[1] || referenceImageBase64,
        mimeType: referenceImageMimeType,
      }
    });
  }

  parts.push({
    text: `Bạn là kiến trúc sư hệ thống cho ứng dụng 'AI Kids Learning Studio'. Nhiệm vụ của bạn là tạo ra một quy trình tự động từ ý tưởng đến tài nguyên sản xuất video.

Input:
- Chủ đề: ${category}
- Hook: ${hook}
- Số cảnh: ${scenesCount}
- Giới tính bé: ${gender === 'boy' ? 'Bé trai' : 'Bé gái'}
${referenceImageBase64 ? '- Ảnh nhân vật tham chiếu: Đã cung cấp (hãy giữ đồng nhất với ảnh này)' : ''}

Quy trình xử lý:
1. Script Engine: Tạo hội thoại song ngữ. Cha hỏi tiếng Việt tự nhiên (văn phong miền Bắc hoặc Nam tùy chọn), con trả lời tiếng Anh chuẩn.
2. Visual Prompting: Tạo prompt cho mô hình 3D Animation (như Runway, Luma, hoặc Veo). Yêu cầu: Phong cách Disney/Pixar, ánh sáng studio, nhân vật đồng nhất với ảnh upload.
3. Voice Synthesis (TTS):
   - Giọng cha: 'Vietnamese Male, warm, encouraging'.
   - Giọng con: 'English Child (US/UK), cute, clear pronunciation'.
4. Expression Mapping: Mô tả biểu cảm cho từng câu (ngạc nhiên, cười, gật đầu).

Output format:
Return a JSON object with two fields:
1. 'human_readable': A string containing a human-readable explanation and script in Markdown format. Bảng phân cảnh gồm: [Thời gian] | [Lời thoại] | [Prompt Hình ảnh] | [Prompt Video] | [Prompt Giọng nói].
2. 'json_data': A JSON object containing the structured data.

The 'json_data' MUST include:
{
  "main_category": "${category}",
  "selected_hook": "${hook}",
  "gender": "${gender}",
  "scenes": [
    {
      "time": "0s - 8s",
      "dialogue": [
         {"speaker": "Cha", "text": "...", "voice_prompt": "Vietnamese Male, warm, encouraging", "expression": "..."},
         {"speaker": "Con", "text": "...", "voice_prompt": "English Child (US/UK), cute, clear pronunciation", "expression": "..."}
      ],
      "image_prompt": "...",
      "video_prompt": "..."
    }
  ],
  "duration": "...",
  "target_platform": "TikTok/Reels/Shorts"
}

Hãy tham khảo các mẫu sau để tạo nội dung:
Mẫu 1: Chủ đề Animals (Động vật hoang dã)
Bối cảnh: Hai cha con đang ngồi trong một khu rừng hoạt hình rực rỡ.
Nhân vật: Bé trai.
Cảnh 1:
- Cha: Con hổ tiếng Anh là gì con?
- Con: Tiger (Con hổ đồ chơi nhảy ra, bé cười)
- Cha: Còn con sư tử thì sao?
- Con: Lion (Bé giả làm động tác sư tử gầm)

Mẫu 2: Chủ đề Colors (Màu sắc)
Bối cảnh: Hai cha con đang cùng nhau tô màu trong phòng khách.
Nhân vật: Bé gái (áo vàng).
Cảnh 1:
- Cha: Màu đỏ tiếng Anh là gì con?
- Con: Red (Bé cầm bút màu đỏ giơ lên)
- Cha: Còn màu xanh dương?
- Con: Blue (Bé chỉ vào màu áo của cha)

Hãy tạo ra kịch bản với ${scenesCount} cảnh nội dung + 1 cảnh Outro (vẫy tay chào và kêu gọi "Follow con nhé"). Mỗi cảnh nội dung có đúng 2 câu hỏi.`
  });

  const response = await ai.models.generateContent({
    model: 'gemini-3.1-pro-preview',
    contents: { parts },
    config: {
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          human_readable: { type: Type.STRING },
          json_data: { 
            type: Type.OBJECT,
            properties: {
              main_category: { type: Type.STRING },
              selected_hook: { type: Type.STRING },
              gender: { type: Type.STRING },
              scenes: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    time: { type: Type.STRING },
                    dialogue: {
                      type: Type.ARRAY,
                      items: {
                        type: Type.OBJECT,
                        properties: {
                          speaker: { type: Type.STRING },
                          text: { type: Type.STRING },
                          voice_prompt: { type: Type.STRING },
                          expression: { type: Type.STRING }
                        }
                      }
                    },
                    image_prompt: { type: Type.STRING },
                    video_prompt: { type: Type.STRING }
                  }
                }
              },
              duration: { type: Type.STRING },
              target_platform: { type: Type.STRING }
            }
          }
        }
      }
    }
  });

  try {
    return JSON.parse(response.text || '{}');
  } catch (e) {
    console.error("Failed to parse script JSON", e);
    throw new Error("Failed to parse script JSON");
  }
}
