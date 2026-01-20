'use client';

import { useCallback, useRef } from 'react';
import SpeechRecognition from 'react-speech-recognition';

interface BargeInHandlerOptions {
  onBargeIn?: () => void;
  onStreamAbort?: () => void;
  onSpeechCancel?: () => void;
}

export function useBargeInHandler(options: BargeInHandlerOptions = {}) {
  const { onBargeIn, onStreamAbort, onSpeechCancel } = options;
  const streamAbortControllerRef = useRef<AbortController | null>(null);
  const speechSynthRef = useRef<SpeechSynthesis | null>(null);
  const listeningDetectionTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize speech synthesis reference
  const initSpeechSynth = useCallback(() => {
    if (typeof window !== 'undefined' && !speechSynthRef.current) {
      speechSynthRef.current = window.speechSynthesis;
    }
  }, []);

  // Set the abort controller for stream cancellation
  const setStreamAbortController = useCallback(
    (controller: AbortController | null) => {
      streamAbortControllerRef.current = controller;
    },
    [],
  );

  // Detect user speech (barge-in trigger)
  const detectUserSpeech = useCallback(
    (transcript: string, isFinal: boolean) => {
      // If we're already in a listening detection window, ignore
      if (listeningDetectionTimeoutRef.current) {
        clearTimeout(listeningDetectionTimeoutRef.current);
      }

      // Only trigger barge-in on significant speech (final result)
      if (isFinal && transcript && transcript.trim().length > 0) {
        console.log('🎤 User speech detected - BARGE-IN TRIGGERED');
        triggerBargeIn();
      }
    },
    [],
  );

  // Main barge-in handler
  const triggerBargeIn = useCallback(() => {
    console.log('⛔ BARGE-IN: Canceling AI response and streaming');

    // 1. Stop text-to-speech
    if (speechSynthRef.current && speechSynthRef.current.speaking) {
      console.log('  → Canceling speech synthesis');
      speechSynthRef.current.cancel();
      if (onSpeechCancel) {
        onSpeechCancel();
      }
    }

    // 2. Abort streaming response
    if (streamAbortControllerRef.current) {
      console.log('  → Aborting API stream');
      streamAbortControllerRef.current.abort();
      if (onStreamAbort) {
        onStreamAbort();
      }
    }

    // 3. Stop speech recognition (briefly) to prevent echo
    try {
      SpeechRecognition.stopListening();
      console.log('  → Stopped speech recognition (for echo prevention)');

      // Re-enable listening after a brief delay
      listeningDetectionTimeoutRef.current = setTimeout(() => {
        SpeechRecognition.startListening({ continuous: true });
        console.log('  → Resumed speech recognition');
      }, 100);
    } catch (error) {
      console.error(
        'Error managing speech recognition during barge-in:',
        error,
      );
    }

    if (onBargeIn) {
      onBargeIn();
    }
  }, [onBargeIn, onStreamAbort, onSpeechCancel]);

  // Cleanup
  const cleanup = useCallback(() => {
    if (listeningDetectionTimeoutRef.current) {
      clearTimeout(listeningDetectionTimeoutRef.current);
    }
  }, []);

  return {
    initSpeechSynth,
    setStreamAbortController,
    detectUserSpeech,
    triggerBargeIn,
    cleanup,
  };
}
