import { useState, useEffect, useRef } from 'react';

export const useVoiceToText = (onTranscript: (text: string) => void) => {
  const [isListening, setIsListening] = useState(false);
  const [supported, setSupported] = useState(true);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setSupported(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onresult = (event: any) => {
      let transcriptStr = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        transcriptStr += event.results[i][0].transcript;
      }
      if (transcriptStr) {
        onTranscript(transcriptStr);
      }
    };

    recognition.onerror = (event: any) => {
      console.warn('Speech recognition error:', event.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;
  }, [onTranscript]);

  const startListening = () => {
    if (!recognitionRef.current) {
      // Direct prompt fallback if SpeechRecognition API is disabled in environment
      setIsListening(true);
      return;
    }

    try {
      recognitionRef.current.start();
      setIsListening(true);
    } catch (e) {
      console.warn('Error starting speech recognition:', e);
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
    }
    setIsListening(false);
  };

  const toggleListening = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  return { isListening, supported, startListening, stopListening, toggleListening };
};
