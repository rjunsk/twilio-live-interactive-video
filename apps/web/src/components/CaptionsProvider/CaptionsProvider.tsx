import React, { createContext, useCallback, useState, useEffect } from 'react';
import { TwilioCaptionResult } from './CaptionTypes';

type CaptionContextType = {
  registerResult: (result: TwilioCaptionResult) => void;
  captions: Caption[];
  toggleCaptions: () => void;
  showCaptions: boolean;
};

interface Caption {
  identity: string;
  id: string;
  timestamp: number;
  transcript: string;
}

export const CaptionContext = createContext<CaptionContextType>(null!);

export const CaptionProvider: React.FC = ({ children }) => {
  const [captions, setCaptions] = useState<Caption[]>([]);
  const [showCaptions, setShowCaptions] = useState<boolean>(false);

  const toggleCaptions = useCallback(() => setShowCaptions(prevState => !prevState), [setShowCaptions]);

  const registerResult = useCallback((result: TwilioCaptionResult) => {
    console.log('received result', result);
    if (result.transcriptionResponse.TranscriptEvent.Transcript.Results.length) {
      const transcript = result.transcriptionResponse.TranscriptEvent.Transcript.Results[0].Alternatives[0].Transcript;
      const id = result.transcriptionResponse.TranscriptEvent.Transcript.Results[0].ResultId;
      const timestamp = Date.now();
      const identity = result.participantIdentity;

      setCaptions(prevCaptions => {
        // Make a copy of the caption array, keeping only the 4 most recent captions
        const arrayCopy = prevCaptions.slice(-4);

        const existingID = arrayCopy.find(item => item.id === id);
        if (existingID) {
          const existingIdIndex = arrayCopy.indexOf(existingID);
          arrayCopy[existingIdIndex] = { transcript, id, timestamp, identity };
        } else {
          arrayCopy.push({ transcript, id, timestamp, identity });
        }

        return arrayCopy;
      });
    }
  }, []);

  // Every second, we go through the captions, and remove any that are older than ten seconds
  useEffect(() => {
    const intervalId = setInterval(() => {
      setCaptions(prevCaptions => {
        const now = Date.now();
        const filteredCaptions = prevCaptions.filter(caption => caption.timestamp > now - 10000);
        if (filteredCaptions.length !== prevCaptions.length) {
          return filteredCaptions;
        } else {
          return prevCaptions;
        }
      });
    }, 1000);
    return () => {
      clearInterval(intervalId);
    };
  }, []);

  return (
    <CaptionContext.Provider value={{ registerResult, captions, toggleCaptions, showCaptions }}>
      {children}
    </CaptionContext.Provider>
  );
};
