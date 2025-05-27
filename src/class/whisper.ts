import { WaveFile} from 'wavefile';
import fs from 'fs';
import util from 'util';
import { Pipeline, pipeline, env } from '@huggingface/transformers';
import shell from 'shelljs';
import readlineSync from 'readline-sync';
import path from 'path';

const DEFAULT_MODEL = "base.en";

const NODE_MODULES_MODELS_PATH = "temp/whisper-models";

const MODELS_LIST: Record<string, string> = {
  "tiny": "whisper-tiny",
  "tiny.en": "whisper-tiny.en",
  "base": "whisper-base",
  "base.en": "whisper-base.en",
  "small": "whisper-small",
  "small.en": "whisper-small.en",
  "medium": "whisper-medium",
  "medium.en": "whisper-medium.en"
};

const MODEL_FILES = [
    "added_tokens.json",
    "config.json",
    "generation_config.json",
    "merges.txt",
    "normalizer.json",
    "preprocessor_config.json",
    "quant_config.json",
    "special_tokens_map.json",
    "tokenizer.json",
    "tokenizer_config.json",
    "vocab.json",
    "onnx/encoder_model.onnx",
    "onnx/decoder_model_merged.onnx"
];

env.localModelPath = NODE_MODULES_MODELS_PATH;
env.backends.onnx.logSeverityLevel = 4;
env.backends.onnx.graphOptimizationLevel = 'disabled';

const readFile = util.promisify(fs.readFile);

const modelPromise = (modelName: string): Promise<Pipeline> => {
  return new Promise<Pipeline>(async (resolve, reject) => {
    try {
      
        if (!MODELS_LIST[modelName])
            throw `modelName "${modelName}" not found in list of models.\n`;
        
        if (!fs.existsSync(`${NODE_MODULES_MODELS_PATH}/${MODELS_LIST[modelName]}`)) {
            console.log(`\n' Model ${modelName}' not downloaded!`);
            await downloadModel()
        }
        // @ts-ignore
        resolve(await pipeline("automatic-speech-recognition", MODELS_LIST[modelName], { quantized: false }));

    } catch (err) {
        reject(err);
    }
  });
};

// format audio to .wav 16Khz
const prepareAudio = async (filePath: string): Promise<Float64Array> => {
    const wav = new WaveFile(await readFile(path.normalize(filePath)));
    wav.toBitDepth('32f');
    wav.toSampleRate(16000);
    let audioData = wav.getSamples();

    if (Array.isArray(audioData)) {
        if (audioData.length > 1) {
            const SCALING_FACTOR = Math.sqrt(2);

            for (let i = 0; i < audioData[0].length; ++i) {
                audioData[0][i] = SCALING_FACTOR * (audioData[0][i] + audioData[1][i]) / 2;
            }
        }

        audioData = audioData[0];
    }

    return audioData;
};

const askModel: () => any = () => {
    const answer = readlineSync.question(`\nEnter a model name (e.g. 'base.en') to download it or 'cancel' to exit\n(ENTER for base.en): `)
  
    if (answer === "cancel") {
      console.log("Exiting model downloader");
      process.exit(0);
    }
    else if (answer === "") {
      console.log("Going with", DEFAULT_MODEL);
      return DEFAULT_MODEL;
    }
    else if (!MODELS_LIST[answer]) {
      console.log("\nFAIL: Name not found.");
  
      return askModel();
    }
  
    return answer;
}

export default async function downloadModel() {
    const src="https://huggingface.co/Xenova";
    const pfx="resolve/main";

    try {
        console.log(`
            | Model     | Disk   |
            |-----------|--------|
            | tiny      | 235 MB |
            | tiny.en   | 235 MB |
            | base      | 400 MB |
            | base.en   | 400 MB |
            | small     | 1.1 GB |
            | small.en  | 1.1 GB |
            | medium    | 1.2 GB |
            | medium.en | 1.2 GB |
        `);
        
        const modelName = await askModel();
    
        if (!!shell.which("wget")) {
            MODEL_FILES.forEach(fileName => {
                shell.exec(`wget --quiet --show-progress -P ./${NODE_MODULES_MODELS_PATH}/${MODELS_LIST[modelName]}/${path.dirname(fileName)} ${src}/${MODELS_LIST[modelName]}/${pfx}/${fileName}`);
            });
        }
        else if (!!shell.which("curl")) {
            MODEL_FILES.forEach(fileName => {
                shell.exec(`curl -L ${src}/${MODELS_LIST[modelName]}/${pfx}/${fileName} -o ${NODE_MODULES_MODELS_PATH}/${MODELS_LIST[modelName]}/${fileName} --create-dirs`);
            });
        }
        else {
            console.log("Either wget or curl is required to download models.");
        }
        
    } catch (error) {
        console.log("ERROR Caught in download model");
        console.log(error);
        process.exit(0);
    }
}

export class Whisper {
    private model: Pipeline;

    constructor(model: Pipeline) {
        this.model = model;
    }

    public async transcribe(filePath: string, language?: string) {
        try {
            const audioData = await prepareAudio(filePath);

            const lang = language ? { language } : {};
            
            return this.model(audioData, {
                chunk_length_s: 30,
                stride_length_s: 5,
                return_timestamps: true,
                ...lang
            });
        } catch (error) {
            console.log("Transcribe error:", error);
        }
    }

    public async disposeModel() {
        return this.model.dispose();
    }
}

export const initWhisper = async (modelName?: string): Promise<Whisper> => {
    if (!modelName)
        console.log("No 'modelName' provided. Trying default model:", DEFAULT_MODEL, "\n");

    const model = await modelPromise(modelName || DEFAULT_MODEL);
    return new Whisper(model);
};
