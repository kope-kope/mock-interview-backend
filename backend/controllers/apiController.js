import fs from 'fs';
import path from 'path';
import speech from '@google-cloud/speech';

const client = new speech.SpeechClient({
  keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
});

// ✅ Utility: Format End Time
const formatEndTime = (resultEndTime) => {
  if (!resultEndTime) return 'N/A';

  const seconds = resultEndTime.seconds || 0;
  const nanos = resultEndTime.nanos || 0;

  const totalSeconds = parseInt(seconds) + nanos / 1e9;
  const minutes = Math.floor(totalSeconds / 60);
  const remainingSeconds = (totalSeconds % 60).toFixed(2);

  return `${minutes}:${remainingSeconds.padStart(5, '0')}`;
};

// ✅ Utility: Identify Speakers (Map Tags to Roles)
const identifySpeakers = (speakerTags) => {
  const uniqueSpeakers = Array.from(new Set(speakerTags));
  if (uniqueSpeakers.length === 1) {
    return { [uniqueSpeakers[0]]: 'Speaker' }; // Single Speaker
  }
  return {
    [uniqueSpeakers[0]]: 'Interviewer',
    [uniqueSpeakers[1]]: 'Interviewee',
  };
};

// ✅ Transcribe Audio and Handle Transcripts Directly
const transcribeAudio = async (filePath) => {
  try {
    console.log('🔄 Reading audio file...');
    const audio = {
      content: fs.readFileSync(filePath).toString('base64'),
    };

    console.log('🔄 Configuring Google Speech-to-Text...');
    const config = {
      encoding: 'MP3',
      sampleRateHertz: 16000,
      languageCode: 'en-GB',
      enableSpeakerDiarization: true,
      diarizationSpeakerCount: 2,
      audioChannelCount: 1,
      enableAutomaticPunctuation: true,
      model: 'latest_long',
    };

    console.log('🔄 Sending audio to Google Speech-to-Text...');
    const [response] = await client.recognize({ audio, config });

    console.log('✅ Google API Full Response:', JSON.stringify(response, null, 2));

    if (!response.results || response.results.length === 0) {
      throw new Error('❌ No transcription results found.');
    }

    let formattedTranscription = '';
    let isSingleSpeaker = true;

    // ✅ Handle Results and Use `transcript` Directly
    response.results.forEach((result, index) => {
      const alternative = result.alternatives?.[0];
      const endTime = result.resultEndTime
        ? formatEndTime(result.resultEndTime)
        : 'N/A';

      if (alternative?.transcript) {
        const role = isSingleSpeaker ? 'Speaker' : `Segment ${index + 1}`;
        formattedTranscription += `[${endTime}] ${role}: ${alternative.transcript}\n\n`;
      }
    });

    // ✅ Ensure Transcription Isn't Empty
    if (!formattedTranscription.trim()) {
      throw new Error('❌ No transcription content detected in the response.');
    }

    console.log('✅ Final Formatted Transcription:', formattedTranscription);
    return formattedTranscription.trim();
  } catch (error) {
    console.error('❌ Transcription Error:', error.stack || error.message);
    throw error;
  }
};

// ✅ Audio Upload Controller
export const uploadAudio = async (req, res) => {
  const filePath = path.join(req.file.destination, req.file.filename);

  try {
    if (!req.file) {
      console.error('❌ No audio file uploaded');
      return res.status(400).json({ error: '❌ No audio file uploaded' });
    }

    console.log('🔄 Processing audio file...');
    const transcription = await transcribeAudio(filePath);

    // ✅ Clean up temporary file
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

    res.status(200).json({
      message: '✅ Audio file transcribed successfully',
      fileName: req.file.originalname,
      fileSize: req.file.size,
      mimeType: req.file.mimetype,
      transcription,
    });
  } catch (error) {
    console.error('❌ Error in uploadAudio:', error.stack || error.message);

    // ✅ Clean up in case of errors
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

    res.status(500).json({
      error: '❌ Failed to transcribe audio file.',
      details: error.message || 'Unknown error occurred.',
    });
  }
};
