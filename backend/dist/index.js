"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
require('dotenv').config();
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        const response = yield fetch('https://api.perplexity.ai/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${process.env.PERPLEXITY_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: 'llama-3-sonar-small-32k-chat',
                stream: true,
                messages: [
                    {
                        role: 'user',
                        content: "Generate Python code to print prime numbers from 1 to 100" // <--- Clarified prompt
                    }
                ]
            })
        });
        if (!response.body) {
            throw new Error('No response body');
        }
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';
        while (true) {
            const { value, done } = yield reader.read();
            if (done)
                break;
            buffer += decoder.decode(value, { stream: true });
            // Process each line (SSE format: lines starting with "data: ")
            let lines = buffer.split('\n');
            buffer = lines.pop() || '';
            for (const line of lines) {
                if (line.startsWith('data: ')) {
                    const jsonStr = line.replace('data: ', '').trim();
                    if (jsonStr === '[DONE]')
                        continue;
                    try {
                        const data = JSON.parse(jsonStr);
                        console.log(data.choices[0].message.content); // Access the content of the message
                    }
                    catch (e) {
                        // Ignore incomplete JSON
                    }
                }
            }
        }
    });
}
main().catch(console.error);
