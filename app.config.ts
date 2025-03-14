import 'dotenv/config';

export default {
  name: 'GastoMetria',
  version: '1.0.0',
  extra: {
    openaiApiKey: process.env.OPENAI_API_KEY,
    nodeEnv: process.env.NODE_ENV,
  },
};
