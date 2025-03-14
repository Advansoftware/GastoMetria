import OpenAI from 'openai';
import Constants from 'expo-constants';

const openaiConfig = {
  apiKey: Constants.expoConfig?.extra?.openaiApiKey || process.env.OPENAI_API_KEY,
  dangerouslyAllowBrowser: true
};

if (!openaiConfig.apiKey) {
  console.error('API Key da OpenAI não encontrada!');
}

export const openai = new OpenAI(openaiConfig);
export const isDevEnv = Constants.expoConfig?.extra?.nodeEnv === 'development';

const OpenAIConfig = {
  openai,
  isDevEnv
};

export default OpenAIConfig;
